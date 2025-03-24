import { ethers } from 'ethers';
import { BatchService } from '../services/BatchService';
import { ChainConfig } from '../types';
import { BaseProvider } from '../providers/BaseProvider';

// Constants for testing
const TESTNET_CONFIG: ChainConfig = {
    id: 5,
    multicallAddress: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
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

describe('BatchService', () => {
    let service: BatchService;
    let provider: BaseProvider;
    let mockContract: jest.Mocked<ethers.Contract>;

    beforeEach(() => {
        jest.clearAllMocks();

        provider = {
            getProvider: jest.fn().mockReturnValue({
                estimateGas: jest.fn().mockResolvedValue(BigInt(21000))
            }),
            getSigner: jest.fn()
        } as unknown as BaseProvider;

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

});
