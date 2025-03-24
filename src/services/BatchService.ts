import { ethers } from 'ethers';
import { MULTICALL3_ABI } from '../abi/Multicall3';
import { ERC20_ABI } from '../abi/Erc20';
import {
    BatchData,
    ChainConfig,
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
        transactionData: {
            data: string[];
            values: bigint[];
            to: string[];
        },
        gasPrice: bigint
    ): Promise<bigint> {

        return BigInt(DEFAULT_GAS_LIMIT)

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


}