import { ethers } from 'ethers';
import { MULTICALL3_ABI } from '../abi/Multicall3';
import { ERC20_ABI } from '../abi/Erc20';
import {
    BatchData,
    BatchTransactionParams,
    ChainConfig,
    ETHBatch,
    InvalidTransactions,
    TransactionResponse
} from '../types';
import { DEFAULT_GAS_LIMIT } from '../config/chainConfig';
import { MulticallConfig, DEFAULT_MULTICALL_CONFIG, MULTICALL_CONFIGS } from '../config/multicallConfig';
import { BaseProvider } from '../providers/BaseProvider';

export class BatchService {

    // Properties
    private multicallContract: ethers.Contract;
    private erc20Contracts: Map<string, ethers.Contract>;
    private config: ChainConfig;
    private multicallConfig: MulticallConfig;
    private provider: BaseProvider;

    /**
     * Construct a new BatchService instance.
     *
     * @param {ChainConfig} config the configuration for the target chain
     * @param {MulticallConfig} [multicallConfig] the configuration for the multicall contract
     *          (optional), defaults to the configuration for the given chain id,
     *          and then to the default configuration if the chain id is not recognized.
     */
    constructor(
        config: ChainConfig,
        provider: BaseProvider,
        multicallConfig: MulticallConfig = MULTICALL_CONFIGS[config.id] || DEFAULT_MULTICALL_CONFIG
    ) {
        this.config = config;
        this.provider = provider;
        this.multicallConfig = multicallConfig;
        this.multicallContract = new ethers.Contract(
            multicallConfig.multicall3Address,
            MULTICALL3_ABI,
            provider.getSigner()
        );
        this.erc20Contracts = new Map();
    }

    /*//////////////////////////////////////////////////////////////
                         PUBLIC METHODS
    //////////////////////////////////////////////////////////////*/

    /**
     * Checks if the `owner` has given allowance to `spender` for
     * `amount` of tokens with address `tokenAddress`.
     *
     * @param {string} tokenAddress the address of the ERC20 token
     * @param {string} owner the address of the token owner
     * @param {string} spender the address of the token spender
     * @param {bigint} amount the amount of tokens
     * @returns {Promise<boolean>} true if the allowance is sufficient, false otherwise
     */
    async checkTokenAllowance(
        tokenAddress: string,
        owner: string,
        spender: string,
        amount: bigint
    ): Promise<boolean> {
        const erc20Contract = await this.getERC20Contract(tokenAddress);
        const currentAllowance = await erc20Contract.allowance(owner, spender);
        console.log("currentAllowance", currentAllowance)
        return BigInt(currentAllowance) > amount;
    }

    /**
     * Sends a transaction to the ERC20 contract at `tokenAddress` to set the
     * allowance for `spender` to `amount` of tokens.
     *
     * @param {string} tokenAddress the address of the ERC20 token
     * @param {string} spender the address of the token spender
     * @param {bigint} amount the amount of tokens to set the allowance for
     * @returns {Promise<void>} a Promise that resolves when the transaction is
     *          confirmed
     */
    async approveToken(
        tokenAddress: string,
        spender: string,
        amount: bigint
    ): Promise<void> {
        const erc20Contract = await this.getERC20Contract(tokenAddress);
        const approvalTxn = await erc20Contract.approve(spender, amount);
        await approvalTxn.wait();
    }

    /**
     * Estimates the gas required for a batch of transactions.
     *
     * @param {Object} transactionData - The data for the transactions.
     * @param {string[]} transactionData.data - Array of data payloads for the transactions.
     * @param {bigint[]} transactionData.values - Array of values to transfer in the transactions.
     * @param {string[]} transactionData.to - Array of destination addresses for the transactions.
     * @param {bigint} gasPrice - The gas price to use for the estimation.
     * @returns {Promise<bigint>} A promise that resolves to the estimated gas limit for the transactions.
     */
    async estimateGas(
        transactionData: BatchTransactionParams,
        gasPrice: bigint
    ): Promise<bigint> {

        try {

            const finalGasPrice = gasPrice;

            console.log("Final Gas Price:", finalGasPrice);

            // Use the full contract interface to encode the function call for aggregate3.
            const iface = new ethers.Interface(MULTICALL3_ABI);
            const calls = transactionData.to.map((target, i) => ({
                target,
                allowFailure: false,
                value: transactionData.values[i],
                callData: transactionData.data[i],
            }));
            const encodedData = iface.encodeFunctionData("aggregate3Value", [calls]);

            console.log("Encoded Data:", encodedData);
            console.log("Multicall Address:", this.config.multicallAddress);

            // Get signer and sender address.
            const signer = this.provider.getSigner();
            if (!signer) {
                throw new Error("Signer not found. Ensure provider is properly initialized.");
            }
            const senderAddress = await signer.getAddress();
            if (!senderAddress) {
                throw new Error("Failed to retrieve sender address.");
            }

            // Calculate total ETH value to send
            const totalValue = transactionData.values.reduce((acc, val) => acc + val, BigInt(0));
            console.log("Total ETH value to send:", totalValue.toString());

            // Estimate gas using the underlying JSON-RPC provider.
            const gasLimit = await this.provider.getProvider().estimateGas({
                from: senderAddress,
                to: this.config.multicallAddress,
                data: encodedData,
                gasPrice: finalGasPrice,
                value: totalValue
            });

            if (!gasLimit) {
                console.warn("Gas estimation returned null or undefined, using default gas limit.");
                return BigInt(DEFAULT_GAS_LIMIT);
            }

            // Add a 20% buffer.
            return gasLimit + gasLimit / BigInt(5);
        } catch (error) {
            console.error("Gas estimation failed:", error);
            return BigInt(DEFAULT_GAS_LIMIT);
        }

    }


    /**
     * Sends a batch of transactions to the Ethereum network and returns the
     * result of the transaction. The batch is processed as a single transaction
     * and the result contains the transaction receipt, invalid transactions, and
     * a link to the Etherscan page for the transaction.
     *
     * @param {BatchData[]} batchData - Array of batch data objects.
     * @param {bigint} gasPrice - The gas price to use for the transaction.
     * @returns {Promise<TransactionResponse | null>} A promise that resolves to
     *          the transaction response or null if the transaction failed.
     */
    async processBatchTransactions(
        batchData: BatchData[],
        gasPrice: bigint
    ): Promise<TransactionResponse | null> {
        const ethBatch: ETHBatch = {
            recipients: [],
            amounts: []
        };

        const invalidTxns: InvalidTransactions[] = [];

        // Validate and separate transactions
        for (const batch of batchData) {
            if (!ethers.isAddress(batch.recipient)) {
                invalidTxns.push({
                    message: `Invalid recipient address: ${batch.recipient}`,
                    batchData: batch
                });
                continue;
            }


            ethBatch.recipients.push(batch.recipient);
            ethBatch.amounts.push(BigInt(batch.amount));

        }

        if (ethBatch.recipients.length === 0) {
            throw new Error('No valid transactions to process');
        }

        const batchTxnParams = await this.prepareBatchTransaction(ethBatch);
        console.log("batchTxnParams", batchTxnParams);
        const gasLimit = await this.estimateGas(batchTxnParams, gasPrice);

        console.log("Gas Limit:", gasLimit);

        return null
    }

    /*//////////////////////////////////////////////////////////////
                            PRIVATE METHODS
    //////////////////////////////////////////////////////////////*/

    /**
     * Returns an instance of the ERC20 contract for the given `tokenAddress`.
     * Caches the contract instance to avoid recreating it for every call.
     *
     * @param {string} tokenAddress The address of the ERC20 token.
     * @returns {Promise<ethers.Contract>} A promise that resolves to the ERC20
     *          contract instance.
     */
    private async getERC20Contract(tokenAddress: string): Promise<ethers.Contract> {
        if (!this.erc20Contracts.has(tokenAddress)) {
            this.erc20Contracts.set(tokenAddress, new ethers.Contract(
                tokenAddress,
                ERC20_ABI,
                this.provider.getSigner()
            ));
        }
        return this.erc20Contracts.get(tokenAddress)!;
    }

    /**
     * Prepares a batch transaction by encoding the aggregate3 function
     * call with the given recipients and amounts. The encoded data is then
     * returned along with the total value of the batch and the address of the
     * Multicall3 contract.
     *
     * @param {ETHBatch} ethBatch - The ETH batch data.
     * @returns {Promise<{
     *     data: string[];
     *     values: bigint[];
     *     to: string[];
     * }>} A promise that resolves to the prepared batch transaction data.
     */
    private async prepareBatchTransaction(
        ethBatch: ETHBatch
    ): Promise<{
        data: string[];
        values: bigint[];
        to: string[];
    }> {
        const batchTxnParams: BatchTransactionParams = {
            data: [],
            values: [],
            to: []
        };

        if (ethBatch.recipients.length > 0) {
            const ethData = await this.prepareETHBatch(ethBatch);
            batchTxnParams.data.push(ethData.data);
            batchTxnParams.values.push(ethData.value);
            batchTxnParams.to.push(ethData.to);
        }

        return batchTxnParams;
    }

    /**
     * Prepares an ETH batch transaction by encoding the aggregate3 function
     * call with the given recipients and amounts. The encoded data is then
         * returned along with the total value of the batch and the address of the
         * Multicall3 contract.
         *
         * @param {ETHBatch} ethBatch - The ETH batch data.
         * @returns {Promise<{
         *     data: string;
         *     value: bigint;
         *     to: string;
         * }>} A promise that resolves to the prepared batch transaction data.
         */
    private async prepareETHBatch(ethBatch: ETHBatch): Promise<{
        data: string;
        value: bigint;
        to: string;
    }> {
        // Build the calls with the correct structure.
        const calls = ethBatch.recipients.map((recipient, index) => ({
            target: recipient,
            allowFailure: true,
            value: BigInt(ethBatch.amounts[index]),
            callData: "0x",
        }));

        console.log("Calls:", calls);

        try {
            // Use the full contract interface to encode the aggregate3 function call.
            const iface = new ethers.Interface(MULTICALL3_ABI);

            const encodedData = iface.encodeFunctionData("aggregate3Value", [calls]);
            console.log("Encoded Data:", encodedData);

            return {
                data: encodedData || "0x",
                value: ethBatch.amounts.reduce((acc, curr) => acc + BigInt(curr), BigInt(0)),
                to: this.multicallConfig.multicall3Address,
            };
        } catch (error) {
            console.error("Error in prepareETHBatch:", error);
            throw new Error("Failed to prepare ETH batch");
        }
    }



}