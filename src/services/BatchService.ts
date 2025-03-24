import { ethers } from 'ethers';
import { MULTICALL3_ABI } from '../abi/Multicall3';
import { ERC20_ABI } from '../abi/Erc20';
import {
    BatchData,
    BatchTransactionParams,
    ChainConfig,
    ERC20Batch,
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
                allowFailure: true,
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

        const erc20Batch: ERC20Batch = {
            recipients: [],
            amounts: [],
            tokens: []
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

            if (batch.tokenAddress) {
                if (!ethers.isAddress(batch.tokenAddress)) {
                    invalidTxns.push({
                        message: `Invalid token address: ${batch.tokenAddress}`,
                        batchData: batch
                    });
                    continue;
                }

                const owner = await this.provider.getSigner()?.getAddress();
                if (!owner) {
                    throw new Error('Signer not available');
                }

                erc20Batch.recipients.push(batch.recipient);
                erc20Batch.amounts.push(BigInt(batch.amount));
                erc20Batch.tokens.push(batch.tokenAddress);
            } else {
                ethBatch.recipients.push(batch.recipient);
                ethBatch.amounts.push(BigInt(batch.amount));
            }

        }

        if (ethBatch.recipients.length === 0) {
            throw new Error('No valid transactions to process');
        }
        if (ethBatch.recipients.length === 0 && erc20Batch.recipients.length === 0) {
            throw new Error('No valid transactions to process');
        }

        const batchTxnParams = await this.prepareBatchTransaction(ethBatch, erc20Batch);
        console.log("batchTxnParams", batchTxnParams);
        const gasLimit = await this.estimateGas(batchTxnParams, gasPrice);

        console.log("Gas Limit:", gasLimit);
        return await this.handleJsonRpcTransaction(batchTxnParams, gasLimit, gasPrice);
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
     * Prepares a batch transaction by encoding the `aggregate3Value` function call for
     * both ETH and ERC20 transactions. The encoded data is then returned along with the
     * total value of the batch and the address of the Multicall3 contract.
     *
     * @param {ETHBatch} ethBatch - The ETH batch data.
     * @param {ERC20Batch} erc20Batch - The ERC20 batch data.
     * @returns {Promise<{
     *     data: string[];
     *     values: bigint[];
     *     to: string[];
     * }>} A promise that resolves to the prepared batch transaction data.
     */
    private async prepareBatchTransaction(
        ethBatch: ETHBatch,
        erc20Batch: ERC20Batch
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

        if (erc20Batch.recipients.length > 0) {
            const erc20Data = await this.prepareERC20Batch(erc20Batch);
            batchTxnParams.data.push(erc20Data.data);
            batchTxnParams.values.push(erc20Data.value);
            batchTxnParams.to.push(erc20Data.to);
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

    /**
         * Prepares an ERC20 batch transaction by encoding the "transfer" function
         * call for each token and recipient, and then encoding the
         * `aggregate3Value` function call for the Multicall3 contract.
         * The encoded data is then returned along with the total value of the
         * batch and the address of the Multicall3 contract.
         *
         * @param {ERC20Batch} erc20Batch - The ERC20 batch data.
         * @returns {Promise<{
         *     data: string;
         *     value: bigint;
         *     to: string;
         * }>} A promise that resolves to the prepared batch transaction data.
    */
    private async prepareERC20Batch(erc20Batch: ERC20Batch): Promise<{
        data: string;
        value: bigint;
        to: string;
    }> {
        try {

            const signer = this.provider.getSigner();
            if (!signer) {
                throw new Error("Signer not found. Ensure provider is properly initialized.");
            }
            const senderAddress = await signer.getAddress();
            if (!senderAddress) {
                throw new Error("Failed to retrieve sender address.");
            }

            // Approve Multicall3 to transfer tokens on behalf of sender
            for (const token of erc20Batch.tokens) {
                const erc20Contract = await this.getERC20Contract(token);

                const allowance = await erc20Contract.allowance(senderAddress, this.multicallConfig.multicall3Address);
                const totalAmount = erc20Batch.amounts.reduce((acc, amount) => acc + BigInt(amount), BigInt(0));

                if (allowance < totalAmount) {
                    const approveTx = await erc20Contract.approve(this.multicallConfig.multicall3Address, totalAmount);
                    await approveTx.wait();
                }
            }

            // Build the calls with the correct structure for ERC20 transfers.
            // Each call will encode the "transfer" function call for the token.
            const calls = erc20Batch.tokens.map((token, index) => {
                // Create an interface for the ERC20 token.
                const erc20Interface = new ethers.Interface(ERC20_ABI);
                // Encode the transfer function call.
                const encodedCallData = erc20Interface.encodeFunctionData("transferFrom", [
                    senderAddress,
                    erc20Batch.recipients[index],
                    erc20Batch.amounts[index]
                ]);

                return {
                    target: token,
                    allowFailure: false,
                    value: BigInt(0), // No ETH is sent with ERC20 transfers.
                    callData: encodedCallData,
                };
            });

            console.log("ERC20 Calls:", calls);

            // Use the full multicall interface to encode the aggregate3Value function call.
            const iface = new ethers.Interface(MULTICALL3_ABI);
            const encodedData = iface.encodeFunctionData("aggregate3Value", [calls]);
            console.log("Encoded ERC20 Data:", encodedData);

            return {
                data: encodedData || "0x",
                value: BigInt(0),
                to: this.multicallConfig.multicall3Address,
            };
        } catch (error) {
            console.error("Error in prepareERC20Batch:", error);
            throw new Error("Failed to prepare ERC20 batch");
        }
    }


    /**
     * Handle a JSON-RPC transaction.
     *
     * @param {BatchTransactionParams} batchTxnParams - The batch transaction parameters.
     * @param {bigint} gasLimit - The gas limit for the transaction.
         * @param {bigint | null} gasPrice - The gas price for the transaction.
         * @returns {Promise<{
         *     txn: ethers.TransactionReceipt | null;
         *     invalidTxns: InvalidTransactions[];
         *     link: string;
         * }>} A promise that resolves to the transaction receipt, invalid transactions, and link.
     */
    private async handleJsonRpcTransaction(
        batchTxnParams: BatchTransactionParams,
        gasLimit: bigint,
        gasPrice: bigint | null
    ): Promise<{
        txn: ethers.TransactionReceipt,
        invalidTxns: InvalidTransactions[],
        link: string
    }> {
        const signer = this.provider.getSigner();
        if (!signer) {
            throw new Error('Signer not available');
        }

        const txn = await signer.sendTransaction({
            to: batchTxnParams.to[0],
            data: batchTxnParams.data[0],
            value: batchTxnParams.values[0],
            gasLimit,
            gasPrice
        });

        const receipt = await txn.wait();

        if (!receipt) {
            throw new Error("Transaction failed");
        }

        return {
            txn: receipt,
            invalidTxns: [],
            link: `${this.config.blockExplorer}/tx/${txn.hash}`
        };
    }

}