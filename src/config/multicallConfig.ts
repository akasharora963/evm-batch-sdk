
export interface MulticallConfig {
    maxCalls: number;
    retryCount: number;
    retryDelay: number;
    gasPriceMultiplier: number;
    multicall3Address: string;
}

export const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

export const MULTICALL_CONFIGS: Record<number, MulticallConfig> = {
    //Mainnet

    //Ethereum Mainnet
    1: {
        maxCalls: 100,
        retryCount: 3,
        retryDelay: 5000,
        gasPriceMultiplier: 1,
        multicall3Address: MULTICALL_ADDRESS
    },

    //ZkSync Era Mainnet
    324: {
        maxCalls: 100,
        retryCount: 3,
        retryDelay: 5000,
        gasPriceMultiplier: 1,
        multicall3Address: MULTICALL_ADDRESS
    },

    //Blast Mainnet
    81457: {
        maxCalls: 100,
        retryCount: 3,
        retryDelay: 5000,
        gasPriceMultiplier: 1,
        multicall3Address: MULTICALL_ADDRESS
    },

    // testnet

    //ZkSync Era Sepolia
    300: {
        maxCalls: 150,
        retryCount: 3,
        retryDelay: 3000,
        gasPriceMultiplier: 1,
        multicall3Address: MULTICALL_ADDRESS
    },

    //Sepolia
    11155111: {
        maxCalls: 150,
        retryCount: 3,
        retryDelay: 3000,
        gasPriceMultiplier: 1,
        multicall3Address: MULTICALL_ADDRESS
    },

    //Blast Sepolia
    168587773: {
        maxCalls: 150,
        retryCount: 3,
        retryDelay: 3000,
        gasPriceMultiplier: 1,
        multicall3Address: MULTICALL_ADDRESS
    }
};

export const DEFAULT_MULTICALL_CONFIG: MulticallConfig = {
    maxCalls: 100,
    retryCount: 3,
    retryDelay: 5000,
    gasPriceMultiplier: 1,
    multicall3Address: MULTICALL_ADDRESS
};