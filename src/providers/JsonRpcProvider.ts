import { ethers } from 'ethers';
import { BaseProvider } from './BaseProvider';
import { ChainConfig } from '../types';

export class JsonRpcProvider extends BaseProvider {
    private wallet: ethers.Wallet;

    /**
     * Constructor for JsonRpcProvider.
     * @param config - The configuration object for the target chain.
     * @param rpcUrl - The URL of the JSON RPC endpoint.
     * @param privateKey - The private key to use for signing transactions.
     * @throws Error - If the RPC URL is not provided.
     * @throws Error - If the private key is not provided.
     */
    constructor(config: ChainConfig, rpcUrl: string, privateKey?: string) {
        super(config);

        if (!rpcUrl) {
            throw new Error('RPC URL is required');
        }

        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        if (privateKey) {
            this.wallet = new ethers.Wallet(privateKey, this.provider);
        } else {
            throw new Error('Private key is required for JsonRpcProvider');
        }
    }

    /**
     * Connects the provider to the wallet.
     *
     * @returns Promise that resolves when the provider is connected.
     */
    async connect(): Promise<void> {
        this.signer = this.wallet.connect(this.provider);
    }


    /**
     * Gets the underlying provider for the JsonRpcProvider.
     *
     * @returns The ethers Provider instance.
     * @throws Error - If the provider is not initialized.
     */
    getProvider(): ethers.Provider {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        return this.provider;
    }

    /**
     * Returns the underlying wallet as a signer.
     *
     * @returns The Signer instance.
     * @throws Error - If the wallet is not initialized.
     */
    getSigner(): ethers.Signer {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }
        return this.wallet;
    }

    /**
     * Returns the chain ID for the target chain.
     * @returns The chain ID.
     */
    getChainId(): number {
        return this.config.id;
    }
}