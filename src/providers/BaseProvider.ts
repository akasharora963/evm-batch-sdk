import { ethers } from 'ethers';
import { ChainConfig } from '../types';

export abstract class BaseProvider {
    protected config: ChainConfig;
    protected provider: ethers.Provider | null;
    protected signer: ethers.Signer | null;

    /**
     * Initializes a new instance of the BaseProvider class.
     *
     * @param {ChainConfig} config - The configuration object for the blockchain
     *        network including details such as network ID, name, and RPC URL.
     */
    constructor(config: ChainConfig) {
        this.config = config;
        this.provider = null;
        this.signer = null;
    }

    abstract connect(): Promise<void>;
    abstract getProvider(): ethers.Provider;
    abstract getSigner(): ethers.Signer | null;
    abstract getChainId(): number;
}