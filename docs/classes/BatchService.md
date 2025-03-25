[**evm-batch-sdk**](../README.md)

***

[evm-batch-sdk](../globals.md) / BatchService

# Class: BatchService

Defined in: [services/BatchService.ts:19](https://github.com/akasharora963/evm-batch-sdk/blob/194b75512cde76014240141cae8ca29b3a424770/src/services/BatchService.ts#L19)

## Constructors

### Constructor

> **new BatchService**(`config`, `provider`, `multicallConfig`?): `BatchService`

Defined in: [services/BatchService.ts:36](https://github.com/akasharora963/evm-batch-sdk/blob/194b75512cde76014240141cae8ca29b3a424770/src/services/BatchService.ts#L36)

Construct a new BatchService instance.

#### Parameters

##### config

[`ChainConfig`](../interfaces/ChainConfig.md)

the configuration for the target chain

##### provider

`BaseProvider`

##### multicallConfig?

[`MulticallConfig`](../interfaces/MulticallConfig.md) = `...`

the configuration for the multicall contract
         (optional), defaults to the configuration for the given chain id,
         and then to the default configuration if the chain id is not recognized.

#### Returns

`BatchService`

## Methods

### approveToken()

> **approveToken**(`tokenAddress`, `spender`, `amount`): `Promise`\<`void`\>

Defined in: [services/BatchService.ts:87](https://github.com/akasharora963/evm-batch-sdk/blob/194b75512cde76014240141cae8ca29b3a424770/src/services/BatchService.ts#L87)

Sends a transaction to the ERC20 contract at `tokenAddress` to set the
allowance for `spender` to `amount` of tokens.

#### Parameters

##### tokenAddress

`string`

the address of the ERC20 token

##### spender

`string`

the address of the token spender

##### amount

`bigint`

the amount of tokens to set the allowance for

#### Returns

`Promise`\<`void`\>

a Promise that resolves when the transaction is
         confirmed

***

### checkTokenAllowance()

> **checkTokenAllowance**(`tokenAddress`, `owner`, `spender`, `amount`): `Promise`\<`boolean`\>

Defined in: [services/BatchService.ts:66](https://github.com/akasharora963/evm-batch-sdk/blob/194b75512cde76014240141cae8ca29b3a424770/src/services/BatchService.ts#L66)

Checks if the `owner` has given allowance to `spender` for
`amount` of tokens with address `tokenAddress`.

#### Parameters

##### tokenAddress

`string`

the address of the ERC20 token

##### owner

`string`

the address of the token owner

##### spender

`string`

the address of the token spender

##### amount

`bigint`

the amount of tokens

#### Returns

`Promise`\<`boolean`\>

true if the allowance is sufficient, false otherwise

***

### estimateGas()

> **estimateGas**(`transactionData`, `allowFailure`, `gasPrice`): `Promise`\<`bigint`\>

Defined in: [services/BatchService.ts:108](https://github.com/akasharora963/evm-batch-sdk/blob/194b75512cde76014240141cae8ca29b3a424770/src/services/BatchService.ts#L108)

Estimates the gas required for a batch of transactions.

#### Parameters

##### transactionData

[`BatchTransactionParams`](../interfaces/BatchTransactionParams.md)

The data for the transactions.

##### allowFailure

`boolean`

Whether to allow failures in the transactions.

##### gasPrice

`bigint`

The gas price to use for the estimation.

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the estimated gas limit for the transactions.

***

### processBatchTransactions()

> **processBatchTransactions**(`batchData`, `allowFailure`, `gasPrice`): `Promise`\<`null` \| [`TransactionResponse`](../interfaces/TransactionResponse.md)\>

Defined in: [services/BatchService.ts:181](https://github.com/akasharora963/evm-batch-sdk/blob/194b75512cde76014240141cae8ca29b3a424770/src/services/BatchService.ts#L181)

Sends a batch of transactions to the Ethereum network and returns the
result of the transaction. The batch is processed as a single transaction
and the result contains the transaction receipt, invalid transactions, and
a link to the Etherscan page for the transaction.

#### Parameters

##### batchData

[`BatchData`](../interfaces/BatchData.md)[]

Array of batch data objects.

##### allowFailure

`boolean`

Whether to allow the transaction to fail.

##### gasPrice

`bigint`

The gas price to use for the transaction.

#### Returns

`Promise`\<`null` \| [`TransactionResponse`](../interfaces/TransactionResponse.md)\>

A promise that resolves to
         the transaction response or null if the transaction failed.
