import { CHAIN_CONFIGS } from '../config/chainConfig';
import { ChainConfig } from '../types';


export class ChainIdUtils {

    /**
     * Retrieves the name of the blockchain network associated with the provided chain ID.
     * 
     * @param chainId - The chain ID of the blockchain network.
     * @returns The name of the blockchain network.
     * @throws Error if the chain ID is not found.
     */
    static getChainName(chainId: number): string {
        const config = this.getChainConfig(chainId);
        return config.name;
    }

    /**
     * Given a chain ID, returns the associated ChainConfig object.
     * @param chainId The chain ID to look up.
     * @returns The ChainConfig object associated with the given chain ID.
     * @throws Error if the chain ID is not found.
     */
    static getChainConfig(chainId: number): ChainConfig {
        const config = Object.values(CHAIN_CONFIGS).find(c => c.id === chainId);
        if (!config) {
            throw new Error(`Chain with ID ${chainId} not found`);
        }
        return config;
    }


    /**
     * Returns true if the given chain ID is a valid chain supported by the app, false otherwise.
     * @param chainId The chain ID to check.
     * @returns true if the chain ID is valid, false otherwise.
     */
    static isValidChainId(chainId: number): boolean {
        return Object.values(CHAIN_CONFIGS).some(c => c.id === chainId);
    }

    /**
     * Given a chain ID and a transaction hash, returns the URL to view the transaction on the
     * block explorer associated with the chain.
     * @param chainId The chain ID.
     * @param txHash The transaction hash.
     * @returns The URL to view the transaction on the block explorer.
     */

    static getChainExplorerUrl(chainId: number, txHash: string): string {
        const config = this.getChainConfig(chainId);
        return `${config.blockExplorer}/tx/${txHash}`;
    }
}