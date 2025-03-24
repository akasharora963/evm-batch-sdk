import { JsonRpcProvider } from '../providers/JsonRpcProvider';
import { BatchService } from '../services/BatchService';
import { CHAIN_CONFIGS } from '../config/chainConfig';
import { MULTICALL_CONFIGS } from '../config/multicallConfig';
import { config } from "dotenv";

config();

if (!process.env.PRIVATE_KEY || !process.env.ALCHEMY_KEY) {
    throw new Error("Missing PRIVATE_KEY or RPC_URL in environment variables.");
}

async function main() {

    const DEFAULT_CHAIN_ID = 168587773;

    const rpcUrl = CHAIN_CONFIGS[DEFAULT_CHAIN_ID].baseUrl + process.env.ALCHEMY_KEY;

    const provider = new JsonRpcProvider(
        CHAIN_CONFIGS[DEFAULT_CHAIN_ID],
        rpcUrl,
        process.env.PRIVATE_KEY
    );
    await provider.connect();

    const multicallConfig = MULTICALL_CONFIGS[DEFAULT_CHAIN_ID];
    const batchService = new BatchService(
        CHAIN_CONFIGS[DEFAULT_CHAIN_ID],
        provider,
        multicallConfig
    );

    const batchData = [
        {
            recipient: '0xE24c9C12373741E9b6beed86D1A067fc5742dC07',
            amount: '1000000000000000'
        },
        {
            recipient: '0x23853BE4191A1a564AdA1Df47aB6F0098DcD0fa3',
            amount: '1000000000000000'
        }
    ];


    try {
        const result = await batchService.processBatchTransactions(batchData, BigInt(1e9));
        if (result) {
            console.log('Transaction hash:', (await result.txn?.getTransaction())?.hash);
            console.log('Invalid transactions:', result.invalidTxns);
            console.log('Explorer link:', result.link);
        }

    } catch (error) {
        console.error('Error processing batch:', error);
    }
}

main().catch(console.error);