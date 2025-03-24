import { ethers } from 'ethers';
import { BatchService } from '../services/BatchService';
import { ChainConfig } from '../types';
import { BaseProvider } from '../providers/BaseProvider';
import { GasPriceUtils } from '../utils/gasPrice';
import { DEFAULT_GAS_LIMIT } from '../config';

// Constants for testing
const TESTNET_CONFIG: ChainConfig = {
    id: 5,
    multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
    blockExplorer: 'https://testnet.etherscan.io',
    name: '',
    baseUrl: '',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    }
};

const TESTNET_MULTICALL_CONFIG = {
    maxCalls: 100,
    retryCount: 3,
    retryDelay: 5000,
    gasPriceMultiplier: 1,
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11'
};

const TEST_WALLET = '0xF977814e90dA44bFA03b6295A0616a897446a4b3';
const TEST_TOKEN = '0xDAC17F958D2ee523a2206206994597C13D831ec7';


jest.mock('ethers', () => {
    const originalModule = jest.requireActual('ethers');

    return {
        __esModule: true,
        ...originalModule,
        Contract: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockReturnThis(),
            estimateGas: jest.fn().mockResolvedValue(ethers.toBigInt(21000))
        })),
        AbiCoder: originalModule.AbiCoder
    };
});

describe('BatchService', () => {
    let service: BatchService;
    let provider: BaseProvider;
    let mockContract: jest.Mocked<ethers.Contract>;
    let mockEstimateGas: jest.Mock;
    let mockGetSigner: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockEstimateGas = jest.fn().mockResolvedValue(BigInt(21000));
        mockGetSigner = jest.fn().mockReturnValue({
            getAddress: jest.fn().mockResolvedValue(TEST_WALLET) // Mock signer address
        });

        provider = {
            getProvider: jest.fn().mockReturnValue({
                estimateGas: mockEstimateGas
            }),
            getSigner: mockGetSigner
        } as unknown as BaseProvider;



        // Mock GasPriceUtils.getOptimalGasPrice
        jest.spyOn(GasPriceUtils, 'getOptimalGasPrice').mockResolvedValue(BigInt(20));

        // Mock ethers.Contract
        mockContract = {
            allowance: jest.fn().mockResolvedValue(BigInt(100000)),
            approve: jest.fn().mockResolvedValue({
                wait: jest.fn().mockResolvedValue({})
            })
        } as unknown as jest.Mocked<ethers.Contract>;

        // Mock ethers.Contract constructor
        jest.spyOn(ethers, 'Contract').mockReturnValue(mockContract);

        // Initialize the service
        service = new BatchService(TESTNET_CONFIG, provider, TESTNET_MULTICALL_CONFIG);
    });

    describe('checkTokenAllowance', () => {
        it('should return true when allowance is greater than amount', async () => {
            const result = await service.checkTokenAllowance(
                TEST_TOKEN,
                TEST_WALLET,
                TESTNET_MULTICALL_CONFIG.multicall3Address,
                BigInt(50000)
            );

            expect(result).toBe(true);
            expect(mockContract.allowance).toHaveBeenCalledWith(
                TEST_WALLET,
                TESTNET_MULTICALL_CONFIG.multicall3Address
            );
        });

        it('should return false when allowance is less than amount', async () => {

            const result = await service.checkTokenAllowance(
                TEST_TOKEN,
                TEST_WALLET,
                TESTNET_MULTICALL_CONFIG.multicall3Address,
                BigInt(100001)
            );

            expect(result).toBe(false);
            expect(mockContract.allowance).toHaveBeenCalledWith(
                TEST_WALLET,
                TESTNET_MULTICALL_CONFIG.multicall3Address
            );
        });
    });

    describe('approveToken', () => {
        it('should approve token transfer', async () => {
            await service.approveToken(
                TEST_TOKEN,
                TESTNET_MULTICALL_CONFIG.multicall3Address,
                BigInt(100000)
            );

            expect(mockContract.approve).toHaveBeenCalledWith(
                TESTNET_MULTICALL_CONFIG.multicall3Address,
                BigInt(100000)
            );
        });
    });
    describe('estimateGas', () => {

        it('should use default gas limit on estimation failure', async () => {
            mockEstimateGas.mockRejectedValue(new Error('Gas estimation failed'));
            const abiCoder = new ethers.AbiCoder();
            const encodedData = abiCoder.encode(
                ['uint256', 'address'],
                [100, TESTNET_MULTICALL_CONFIG.multicall3Address]
            );

            const transactionData = {
                data: [encodedData], // Fixed invalid hex format
                values: [BigInt(100)],
                to: [TESTNET_MULTICALL_CONFIG.multicall3Address]
            };

            const result = await service.estimateGas(transactionData, BigInt(30));

            expect(result).toBe(BigInt(DEFAULT_GAS_LIMIT));
        });
    });



});
