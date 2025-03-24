[**evm-batch-sdk**](../README.md)

***

[evm-batch-sdk](../globals.md) / BrowserProvider

# Class: BrowserProvider

Defined in: [providers/BrowserProvider.ts:11](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BrowserProvider.ts#L11)

## Extends

- `BaseProvider`

## Constructors

### Constructor

> **new BrowserProvider**(`config`): `BrowserProvider`

Defined in: [providers/BrowserProvider.ts:14](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BrowserProvider.ts#L14)

#### Parameters

##### config

[`ChainConfig`](../interfaces/ChainConfig.md)

#### Returns

`BrowserProvider`

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

Defined in: [providers/BrowserProvider.ts:27](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BrowserProvider.ts#L27)

Connects the browser-based Ethereum provider by requesting account access.

This method checks if the browser has an Ethereum provider available (e.g., MetaMask).
If available, it initializes an ethers.js BrowserProvider and requests access to the
user's Ethereum accounts. If successful, sets the provider and signer for the instance.

#### Returns

`Promise`\<`void`\>

#### Throws

Error - If no Ethereum provider is found in the browser or if the connection request fails.

#### Overrides

`BaseProvider.connect`

***

### getChainId()

> **getChainId**(): `number`

Defined in: [providers/BrowserProvider.ts:74](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BrowserProvider.ts#L74)

Returns the chain ID for the target chain.

#### Returns

`number`

The chain ID.

#### Overrides

`BaseProvider.getChainId`

***

### getProvider()

> **getProvider**(): `Provider`

Defined in: [providers/BrowserProvider.ts:49](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BrowserProvider.ts#L49)

Gets the underlying provider for the BrowserProvider.

#### Returns

`Provider`

The ethers Provider instance.

#### Throws

Error - If the provider is not initialized. Call `connect()` first.

#### Overrides

`BaseProvider.getProvider`

***

### getSigner()

> **getSigner**(): `Signer`

Defined in: [providers/BrowserProvider.ts:63](https://github.com/akasharora963/evm-batch-sdk/blob/5b37c2ea625e7e8fce545be782ecdf3df051c29b/src/providers/BrowserProvider.ts#L63)

Returns the underlying wallet as a signer.

#### Returns

`Signer`

The Signer instance.

#### Throws

Error - If the wallet is not initialized. Call `connect()` first.

#### Overrides

`BaseProvider.getSigner`
