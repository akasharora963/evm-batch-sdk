import { ethers } from 'ethers';
import { BaseProvider } from './BaseProvider';
import { ChainConfig } from '../types';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export class BrowserProvider extends BaseProvider {
    private browserProvider: ethers.BrowserProvider | null = null;

    constructor(config: ChainConfig) {
        super(config);
    }

    /**
     * Connects the browser-based Ethereum provider by requesting account access.
     *
     * This method checks if the browser has an Ethereum provider available (e.g., MetaMask).
     * If available, it initializes an ethers.js BrowserProvider and requests access to the
     * user's Ethereum accounts. If successful, sets the provider and signer for the instance.
     *
     * @throws Error - If no Ethereum provider is found in the browser or if the connection request fails.
    */
    async connect(): Promise<void> {
        if (!window.ethereum) {
            throw new Error('No Ethereum provider found in browser');
        }

        try {
            this.browserProvider = new ethers.BrowserProvider(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            this.provider = this.browserProvider;
            this.signer = await this.browserProvider.getSigner();
        } catch (error: any) {
            throw new Error(`Failed to connect to browser provider: ${error.message}`);
        }
    }

    /**
     * Gets the underlying provider for the BrowserProvider.
     *
     * @returns The ethers Provider instance.
     * @throws Error - If the provider is not initialized. Call `connect()` first.
     */
    getProvider(): ethers.Provider {
        if (!this.provider) {
            throw new Error('Provider not initialized. Call `connect()` first.');
        }
        return this.provider;
    }


    /**
     * Returns the underlying wallet as a signer.
     *
     * @returns The Signer instance.
     * @throws Error - If the wallet is not initialized. Call `connect()` first.
     */
    getSigner(): ethers.Signer {
        if (!this.signer) {
            throw new Error('Signer not initialized. Call `connect()` first.');
        }
        return this.signer;
    }

    /**
        * Returns the chain ID for the target chain.
        * @returns The chain ID.
    */
    getChainId(): number {
        return this.config.id;
    }
}