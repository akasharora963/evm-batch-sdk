

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