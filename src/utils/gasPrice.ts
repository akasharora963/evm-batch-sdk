import { ethers } from 'ethers';
import { ChainConfig, MulticallConfig } from '../types';

export class GasPriceUtils {
    /**
     * Returns the base fee per gas for the current block.
     *
     * @param {ethers.Provider} provider - The ethers provider to use.
     * @returns {Promise<bigint>} A promise that resolves to the base fee per gas.
     */
    static async getBaseFee(provider: ethers.Provider): Promise<bigint> {
        const blockNum = await provider.getBlockNumber();
        const block = await provider.getBlock(blockNum);

        if (!block || block.baseFeePerGas === null) {
            return BigInt(0);
        }

        return block.baseFeePerGas;
    }


    /**
     * Estimates the gas price based on the provider's estimate of the base fee
     * and the gas price multiplier in the multicall config.
     *
     * If the provider does not support `getFeeData`, it falls back to using the
     * base fee per gas for the current block.
     *
     * If estimation fails, it uses a default gas price.
     *
     * @param {ethers.Provider} provider - The ethers provider to use.
     * @param {ChainConfig} config - The chain configuration.
     * @param {MulticallConfig} multicallConfig - The multicall configuration.
     * @returns {Promise<bigint>} A promise that resolves to the estimated gas
     *          price.
     */
    static async estimateGasPrice(
        provider: ethers.Provider,
        config: ChainConfig,
        multicallConfig: MulticallConfig
    ): Promise<bigint> {
        try {
            const feeData = await provider.getFeeData();
            const baseFee = feeData.maxFeePerGas ?? await this.getBaseFee(provider);

            return baseFee * BigInt(multicallConfig.gasPriceMultiplier);
        } catch (error) {
            console.error('Gas price estimation failed:', error);

            return BigInt(config.nativeCurrency.decimals === 18 ? '20000000000' : '2000000000');
        }
    }


    /**
     * Gets the optimal gas price for a transaction. It first estimates the gas price based on the
     * provider's estimate of the base fee and the gas price multiplier in the multicall config. If the
     * provider supports `getFeeData` and the max fee per gas is available, it chooses the higher value
     * between the estimated gas price and the max fee per gas. Otherwise, it uses the estimated gas
     * price.
     *
     * @param {ethers.Provider} provider - The ethers provider to use.
     * @param {ChainConfig} config - The chain configuration.
     * @param {MulticallConfig} multicallConfig - The multicall configuration.
     * @returns {Promise<bigint>} A promise that resolves to the optimal gas price.
     */
    static async getOptimalGasPrice(
        provider: ethers.Provider,
        config: ChainConfig,
        multicallConfig: MulticallConfig
    ): Promise<bigint> {
        const gasPrice = await this.estimateGasPrice(provider, config, multicallConfig);
        const feeData = await provider.getFeeData();

        console.log("Gas Price:", gasPrice);
        console.log("Max Fee Per Gas:", feeData.maxFeePerGas);

        if (feeData.maxFeePerGas && feeData.maxFeePerGas > gasPrice) {
            return feeData.maxFeePerGas;
        }
        return gasPrice;
    }
}