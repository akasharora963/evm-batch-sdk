import { ChainConfig } from '../types';
import { MULTICALL_ADDRESS } from './multicallConfig';

export const CHAIN_CONFIGS: Record<number, ChainConfig> = {
    //Mainnet
    1: {
        id: 1,
        name: 'Mainnet',
        multicallAddress: MULTICALL_ADDRESS,
        blockExplorer: 'https://etherscan.io',
        baseUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },

    324: {
        id: 324,
        name: 'ZkSync Mainnet',
        multicallAddress: MULTICALL_ADDRESS,
        blockExplorer: 'https://etherscan.io',
        baseUrl: 'https://zksync-mainnet.g.alchemy.com/v2/',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },

    81457: {
        id: 81457,
        name: 'Blast Mainnet',
        multicallAddress: MULTICALL_ADDRESS,
        blockExplorer: 'https://etherscan.io',
        baseUrl: 'https://blast-mainnet.g.alchemy.com/v2/',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },

    // testnet
    11155111: {
        id: 11155111,
        name: 'Sepolia',
        multicallAddress: MULTICALL_ADDRESS,
        blockExplorer: 'https://sepolia.etherscan.io/',
        baseUrl: 'https://eth-sepolia.g.alchemy.com/v2/',
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'SepoliaETH',
            decimals: 18
        }
    },
    300: {
        id: 300,
        name: 'ZkSync Sepolia',
        multicallAddress: MULTICALL_ADDRESS,
        blockExplorer: 'https://sepolia.explorer.zksync.io/',
        baseUrl: 'https://zksync-sepolia.g.alchemy.com/v2/',
        nativeCurrency: {
            name: 'ZkSync Sepolia Ether',
            symbol: 'ZkSync SepoliaETH',
            decimals: 18
        }
    },
    168587773: {
        id: 168587773,
        name: 'Blast Sepolia',
        multicallAddress: MULTICALL_ADDRESS,
        blockExplorer: 'https://sepolia.blastexplorer.io/',
        baseUrl: 'https://blast-sepolia.g.alchemy.com/v2/',
        nativeCurrency: {
            name: 'Blast Sepolia Ether',
            symbol: 'Blast SepoliaETH',
            decimals: 18
        }
    }

};

export const DEFAULT_GAS_LIMIT = 2000000;