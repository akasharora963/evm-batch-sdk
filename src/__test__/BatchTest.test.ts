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

const TEST_WALLET = ethers.getAddress('0x3c5a809e712D30D932b71EdB066FA2EEDEE6Ad58');
const TEST_RECIPIENT = ethers.getAddress('0xE24c9C12373741E9b6beed86D1A067fc5742dC07');
const TEST_TOKEN = ethers.getAddress('0x5B2f5c3e8A9Aa9B26A2ADE212Fa6d0B2f6e993DC'); // token mock




jest.mock('ethers', () => {
    const originalModule = jest.requireActual('ethers');

    return {
        __esModule: true,
        ...originalModule,
        Contract: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockReturnThis(),
            estimateGas: jest.fn().mockResolvedValue(ethers.toBigInt(21000)),
            sendTransaction: jest.fn().mockResolvedValue({
                hash: '0xmockhash',
                wait: jest.fn().mockResolvedValue({})
            })
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
            getAddress: jest.fn().mockResolvedValue(TEST_WALLET), // Mock signer address
            sendTransaction: jest.fn().mockResolvedValue({
                hash: '0xmockhash',
                wait: jest.fn().mockResolvedValue({})
            })
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

            const result = await service.estimateGas(transactionData, false, BigInt(30));

            expect(result).toBe(BigInt(DEFAULT_GAS_LIMIT));
        });
    });

    describe('processBatchTransactions', () => {
        it('should process ETH batch transactions', async () => {
            const batchData = [{
                recipient: TEST_RECIPIENT,
                amount: '100'
            }];

            const mockEstimateGas = jest.fn().mockResolvedValue(ethers.toBigInt(21000));
            (provider.getProvider as jest.Mock).mockImplementation(() => ({
                estimateGas: mockEstimateGas
            }));

            const result = await service.processBatchTransactions(batchData, false, ethers.toBigInt(30));

            expect(result?.txn).toBeDefined();
            expect(result?.invalidTxns).toHaveLength(0);
            expect(result?.link).toContain('testnet.etherscan.io');
        });

        it('should process ERC20 batch transactions', async () => {
            const batchData = [{
                recipient: TEST_RECIPIENT,
                tokenAddress: TEST_TOKEN,
                amount: '100'
            }];

            const mockEstimateGas = jest.fn().mockResolvedValue(ethers.toBigInt(21000));
            (provider.getProvider as jest.Mock).mockImplementation(() => ({
                estimateGas: mockEstimateGas
            }));

            const result = await service.processBatchTransactions(batchData, false, ethers.toBigInt(30));

            expect(result?.txn).toBeDefined();
            expect(result?.invalidTxns).toHaveLength(0);
            expect(result?.link).toContain('testnet.etherscan.io');
        });

    });

});
