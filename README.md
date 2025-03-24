# EVM BATCH SDK FOR ETH AND ERC20 

## Overview
This SDK enables users to efficiently perform batch transactions on the Ethereum blockchain using a JSON-RPC provider. It leverages multicall configurations to optimize gas usage and execution speed.


### BATCH TRANSACTION FLOW DIAGRAM
![Image](https://github.com/user-attachments/assets/27e27c53-fe2a-4a18-9c25-768a1e970509)

### BATCH TRANSACTION SEQUENCE DIAGRAM
![Image](https://github.com/user-attachments/assets/71ec80fe-ae54-4a75-bc35-5f5ad1b739fc)

# SDK Usage Guide

### System Network Info
- Currently it supports Ethereum Mainnet, Blast ,ZkSync Era and their respective testnets.


## Prerequisites
Before using this SDK, ensure you have the following:
- **Node.js** installed
- **NPM or Yarn** for package management
- **Environment variables** properly set up, including a private key and an Alchemy API key



## Installation
Install the required dependencies using your package manager:
```sh
npm install
```

## Environment Setup (in case of JsonRpcProvider)
Create a `.env` file in your project root and configure it with your private key and Alchemy API key.

## Usage
The SDK provides functionality to process multiple transactions in a single batch, reducing the overhead of individual transactions. Users need to:
1. Set up the provider with the required RPC URL and credentials.

```ts
    const DEFAULT_CHAIN_ID = 168587773; // Blast Sepolia chain id

    const rpcUrl = CHAIN_CONFIGS[DEFAULT_CHAIN_ID].baseUrl + process.env.ALCHEMY_KEY;

    const provider = new JsonRpcProvider(
        CHAIN_CONFIGS[DEFAULT_CHAIN_ID],
        rpcUrl,
        process.env.PRIVATE_KEY
    );
    await provider.connect();

```
2. Configure the multicall settings for the target blockchain network and batch service.

```ts
    const multicallConfig = MULTICALL_CONFIGS[DEFAULT_CHAIN_ID];
    const batchService = new BatchService(
        CHAIN_CONFIGS[DEFAULT_CHAIN_ID],
        provider,
        multicallConfig
    );

```
3. Prepare a batch of transactions, specifying recipients and amounts.
4. Execute the batch transaction process.
5. Retrieve transaction details, including the transaction hash and any invalid transactions.

## Running the Script
After setting up, execute the script to process batch transactions.

## Expected Output
Upon successful execution, the script will provide:
- **Transaction Hash** to track the transaction on the blockchain.
- **Invalid Transactions**, if any issues occur.
- **Explorer Link** for quick access to transaction details.

## Troubleshooting
If issues arise, consider the following:
- Verify that your `.env` file contains valid credentials.
- Ensure that the provider is correctly configured for your selected blockchain network.
- Double-check recipient addresses and transaction amounts.
- Check network congestion and gas fees if transactions fail.

## License
This SDK is provided under the MIT License.

For more details refer docs folder