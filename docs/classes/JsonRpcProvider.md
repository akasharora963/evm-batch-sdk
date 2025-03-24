[**evm-batch-sdk**](../README.md)

***

[evm-batch-sdk](../globals.md) / JsonRpcProvider

# Class: JsonRpcProvider

Defined in: [providers/JsonRpcProvider.ts:5](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/JsonRpcProvider.ts#L5)

## Extends

- `BaseProvider`

## Constructors

### Constructor

> **new JsonRpcProvider**(`config`, `rpcUrl`, `privateKey`?): `JsonRpcProvider`

Defined in: [providers/JsonRpcProvider.ts:16](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/JsonRpcProvider.ts#L16)

Constructor for JsonRpcProvider.

#### Parameters

##### config

[`ChainConfig`](../interfaces/ChainConfig.md)

The configuration object for the target chain.

##### rpcUrl

`string`

The URL of the JSON RPC endpoint.

##### privateKey?

`string`

The private key to use for signing transactions.

#### Returns

`JsonRpcProvider`

#### Throws

Error - If the RPC URL is not provided.

#### Throws

Error - If the private key is not provided.

#### Overrides

`BaseProvider.constructor`

## Properties

### config

> `protected` **config**: [`ChainConfig`](../interfaces/ChainConfig.md)

Defined in: [providers/BaseProvider.ts:5](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BaseProvider.ts#L5)

#### Inherited from

`BaseProvider.config`

***

### provider

> `protected` **provider**: `null` \| `Provider`

Defined in: [providers/BaseProvider.ts:6](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BaseProvider.ts#L6)

#### Inherited from

`BaseProvider.provider`

***

### signer

> `protected` **signer**: `null` \| `Signer`

Defined in: [providers/BaseProvider.ts:7](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BaseProvider.ts#L7)

#### Inherited from

`BaseProvider.signer`

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [providers/JsonRpcProvider.ts:37](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/JsonRpcProvider.ts#L37)

Connects the provider to the wallet.

#### Returns

`Promise`\<`void`\>

Promise that resolves when the provider is connected.

#### Overrides

`BaseProvider.connect`

***

### getChainId()

> **getChainId**(): `number`

Defined in: [providers/JsonRpcProvider.ts:72](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/JsonRpcProvider.ts#L72)

Returns the chain ID for the target chain.

#### Returns

`number`

The chain ID.

#### Overrides

`BaseProvider.getChainId`

***

### getProvider()

> **getProvider**(): `Provider`

Defined in: [providers/JsonRpcProvider.ts:48](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/JsonRpcProvider.ts#L48)

Gets the underlying provider for the JsonRpcProvider.

#### Returns

`Provider`

The ethers Provider instance.

#### Throws

Error - If the provider is not initialized.

#### Overrides

`BaseProvider.getProvider`

***

### getSigner()

> **getSigner**(): `Signer`

Defined in: [providers/JsonRpcProvider.ts:61](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/JsonRpcProvider.ts#L61)

Returns the underlying wallet as a signer.

#### Returns

`Signer`

The Signer instance.

#### Throws

Error - If the wallet is not initialized.

#### Overrides

`BaseProvider.getSigner`
