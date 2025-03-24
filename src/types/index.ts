import { ethers } from "ethers";


export interface ChainConfig {
    id: number;
    name: string;
    multicallAddress: string;
    blockExplorer: string;
    baseUrl: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
}

export interface MulticallConfig {
    maxCalls: number;
    retryCount: number;
    retryDelay: number;
    gasPriceMultiplier: number;
    multicall3Address: string;
}

export interface BatchData {
    recipient: string;
    amount: string;
    tokenAddress?: string;
}

export interface ETHBatch {
    recipients: string[];
    amounts: bigint[];
}



export interface InvalidTransactions {
    message: string;
    batchData: BatchData;
}


export interface BatchTransactionParams {
    data: string[];
    values: bigint[];
    to: string[];
}

export interface TransactionResponse {
    txn: ethers.TransactionReceipt | null,
    invalidTxns: InvalidTransactions[],
    link: string
}