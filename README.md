# @pumapay/merchant_sdk

## Table of content
- [Intro](#intro)
- [V2.0 Notes](#v20-notes)
- [Dependencies](#dependencies)
- [Get started](#get-started)
- [Merchant SDK API Reference](#merchant-sdk-api-reference)
    - [sdk.build](#sdkbuild)
    - [sdk.executePullPayment](#sdkexecutepullpayment)
    - [sdk.monitorRegistrationTransaction](#sdkmonitorregistrationtransaction)
    - [sdk.monitorCancellationTransaction](#sdkmonitorcancellationtransaction)
    - [Class sdk.Scheduler](#class-sdkscheduler)
    - [sdk.Scheduler.start](#sdkschedulerstart)
    - [sdk.Scheduler.restart](#sdkschedulerrestart)
    - [sdk.Scheduler.stop](#sdkschedulerstop)
    - [sdk.fundETH](#sdkfundeth)
    - [sdk.cashOutETH](#sdkcashouteth)
    - [sdk.cashOutPMA](#sdkcashoutpma)
## Intro
Decentralized vision has developed a payment protocol that allows recurring payment to occur
over the Ethereum Blockchain.
This SDK module provides the core functionality to any third party integrator to allow execution
of pull payments.

## V2.0 Notes
The merchant has in their possession a set of addresses through their HD wallet.
Each pull payment is assigned to a different address (executor address) from the HD wallet.
The address at index 0 is being used as the bank account which need to holds ETH that will be used for funding the executor addresses.

## Dependencies
<!--More details regarding the dependencies and the PumaPay ecosystem can be found in our [wiki](https://github.com/pumapayio/wiki)-->
#### PostgreSQL Database
The merchant SDK needs to communicate with PostgreSQL database (referenced as Pull Payment DB from now on)
which stores everything around pull payments, i.e pull payment models, pull payments and Ethereum transactions related with pull payments.

#### MySQL Database
In addition a MySQL encrypted db (referenced as Wallet Encrypted DB from now on) is necessary
which stores the hd mnemonic phrase of the merchant wallet addresses that will be used for
executing pull payment, for funding the executor addresses with ETH to pay for gas and cashing
out PMA and ETH to an Ethereum "bank account" on their end.
<!--More details on the "Bank Account" can be found [here](https://github.com/pumapayio/wiki/).-->

#### Redis
Redis in-memory data structure store is used for storing information related with which executor address will be
the executor of the pull payment and for storing the maximum gas used for a pull payment transaction.

## Get Started
#### Step 1
First you need to get merchant_sdk to your project through npm
```sh
npm install @pumapay/merchant_sdk --save
```
#### Step 2
Import sdk from npm
```ts
    import merchant_sdk from '@pumapay/merchant_sdk';
```

#### Step 3
Instantiate the sdk
```ts
   const sdk = new merchant_sdk();
```
Recommended to be used as a singleton. Example:
```ts
class MerchantSDK {

    private static sdk: merchant_sdk = null;

    private constructor() {}

    /**
     * @description Returns the instantiated sdk object
     */
    public static GET_SDK() {
        if (this.sdk) {
            return this.sdk;
        }
        this.sdk = new merchant_sdk();

        return this.sdk;
    }
}
```
#### Step 4
Construct the sdk with the required parameters
```ts
const settings: SDKBuildSettings = {
    web3: web3Provider,                                     // web3 provider for ethereum network
    merchantApiUrl: https://merchant_example_url.com/,      // merchant backend url
    pgUser: db_user,                                        // PostgreSQL db user
    pgHost: db_host,                                        // PostgreSQL db host
    pgPort: db_port,                                        // PostgreSQL db port
    pgDatabase: db_name,                                    // PostgreSQL db name
    pgPassword: db_password,                                // PostgreSQL db password
    redisClient: redis_client                               // Redis client e.g. redis.createClient(redis_port, redis_host)
    getEnums: enumerables,                                  // method for getting enumerables
    getPullPayment: getPullPaymentCallback,                 // callback for getting payment from DB
    updatePullPayment: updatePullPaymentCallback,           // callback for updating payment from DB
    getTransactions: getTransactionsByPullPaymentCallback,  // callback for getting transactions from DB
    createTransaction: createTransactionCallback,           // callback for creating transactions from DB
    updateTransaction: updateTransactionCallback,           // callback for updating transactions from DB
    getPrivateKey: getPrivateKey                            // callback for getting private key based on hd wallet address
    bankAddress: getBankAddress                             // callback for getting ethereum address to be used as a bank address from the HD wallet
}
```
See [below](#merchant-sdk-api-reference) for detailed explanation.
#### Step 5
Build the sdk using provided parameters.
```ts
    sdk.GET_SDK().build(settings);
```

**NOTE:** The merchant SDK is encapsulated in a NodeJS server which will be referred to as Merchant Core Server from now on.
<!--For more details refer to our [wiki](https://github.com/pumapayio/wiki/).-->

## Merchant SDK API Reference
#### sdk.build
```ts
sdk.build(settings)
```
The build method is used to build the SDK.

Parameters

1. `SdkSettings` - Settings to initiate the merchant sdk

Returns

`object` - The merchant SDK or `error` if provided settings are incorrect

Example

```ts
sdk.build({
    web3: web3Provider,                                     // web3 provider for ethereum network
    merchantApiUrl: https://merchant_example_url.com/,      // merchant core server url
    pgUser: db_user,                                        // PostgreSQL db user
    pgHost: db_host,                                        // PostgreSQL db host
    pgPort: db_port,                                        // PostgreSQL db port
    pgDatabase: db_name,                                    // PostgreSQL db name
    pgPassword: db_password,                                // PostgreSQL db password
    redisClient: redis_client                               // Redis client e.g. redis.createClient(redis_port, redis_host)
    getEnums: enumerables,                                  // method for getting enumerables
    getPullPayment: getPullPaymentCallback,                 // callback for getting pull payment by ID from DB
    updatePullPayment: updatePullPaymentCallback,           // callback for updating a pull payment in DB
    getTransactions: getTransactionsByPullPaymentCallback,  // callback for getting transactions for a specific pull payment from DB
    createTransaction: createTransactionCallback,           // callback for creating transactions from DB
    updateTransaction: updateTransactionCallback,           // callback for updating transactions from DB
    getPrivateKey: getPrivateKey                            // callback for getting private key based on hd wallet address
    bankAddress: getBankAddress                             // callback for getting ethereum address to be used as a bank address from the HD wallet
})
```
***

#### sdk.executePullPayment
```ts
sdk.executePullPayment(pullPaymentID)
```
Executes a pull payment stored in the DB on the Ethereum network.

For the execution of the pull payment, the pull payment needs to be retrieved from the Pull Payment DB which contains details about the wallet address that can execute
the pull payment. The blockchain transaction is signed by the wallet address linked with the pull payment and is transmitted to the Ethereum network.
Once the transaction hash is obtained by the Ethereum network a new blockchain transaction with the `txHash` linked to the pull payment  is inserted in the
Pull Payment DB with status `pending`. If the transaction receipt is retrieved from the blockchain with status `true` the status in the db changes to `success`
otherwise is set to `failed`.


Parameters

1. `string` - pull payment ID that needs to be executed on Ethereum blockchain

Returns

`undefined`


Example
```ts
sdk.executePullPayment('2400005a-0000-0000-0000-f28000009fd1')
```
***

#### sdk.monitorRegistrationTransaction
```ts
sdk.monitorRegistrationTransaction(txHash, pullPaymentID)
```
Monitors a pull payment registration transaction on the blockchain.

The pull payment registration is submitted to the Ethereum network by the PumaPay Core after the pull payment was signed in the PumaPay Wallet. Once the transaction receipt is retrieved in the
PumaPay core, it is sent to the PumaPay Merchant server and stored in the Pull Payment DB as a registration transaction for the specified `pullPaymentID` with status `pending`.
The blockchain transaction is monitored on the merchant side and updated once the blockchain transaction receipt is retrieved. If the transaction receipt is retrieved
from the blockchain with status `true` the status in the db changes to `success` otherwise is set to `failed`.

Parameters

1. `string` - txHash of the registration transaction as retrieved by the blockchain
2. `pullPaymentID` - pull payment ID that was registered on Ethereum blockchain

Returns

`Promise<object>` - [Blockchain transaction receipt](https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionreceipt) or `error` if monitoring failed


Example
```ts
sdk.monitorRegistrationTransaction('0xaeed582d5a8165f9130e15b10a480400126b67fb21402623258626774c000000', '2400005a-0000-0000-0000-f28000009fd1')
```
***

#### sdk.monitorCancellationTransaction
```ts
sdk.monitorCancellationTransaction(txHash, pullPaymentID)
```
Monitors a pull payment cancellation transaction on the blockchain.

The pull payment cancellation is submitted to the Ethereum network by the PumaPay Core after the pull payment was signed in the PumaPay Wallet. Once the transaction receipt is retrieved in the
PumaPay core, it is sent to the PumaPay Merchant server and stored in the Pull Payment DB as a registration transaction for the specified `pullPaymentID` with status `pending`.
The blockchain transaction is monitored on the merchant side and updated once the blockchain transaction receipt is retrieved. If the transaction receipt is retrieved
from the blockchain with status `true` the status in the db changes to `success` otherwise is set to `failed`.

Parameters

1. `string` - txHash of the cancellation transaction as retrieved by the blockchain
2. `pullPaymentID` - pull payment ID that was cancelled on Ethereum blockchain

Returns

`Promise<object>` - [Blockchain transaction receipt](https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionreceipt) or `error` if monitoring failed


Example
```ts
sdk.monitorCancellationTransaction('0xaeed582d5a8165f9130e15b10a480400126b67fb21402623258626774c000000', '2400005a-0000-0000-0000-f28000009fd1')
```
***

#### Class sdk.Scheduler
```ts
new sdk.Scheduler(pullPaymentID, callback)
```
The Scheduler class is starting / stopping / restarting the scheduler which is executing a pull payment.

Parameters

1. `string` - pull payment ID that needs to be executed on Ethereum blockchain
2. `function` - callback function

Returns

`undefined`


Example
```ts
new sdk.Scheduler('2400005a-0000-0000-0000-f28000009fd1', sdk.executePullPayment)
```
***


#### sdk.Scheduler.start
```ts
new sdk.Scheduler(pullPaymentID, callback).start(reinitialized? = false)
```
Starts the scheduler based on a pull payment ID and a callback.

The scheduler is used for executing a pull payment on the blockchain i.e. pull PMA from the customer account. This function is being called on `sdk.monitorRegistrationTransaction`
and when the transaction receipt is successful, the scheduler starts with `sdk.executePullPayment(pullPaymentID)` as the callback function.


Parameters

1. `boolean` - (optional) whether the scheduler should be re-initialized

Returns

`undefined`


Example
```ts
sdk.Scheduler('2400005a-0000-0000-0000-f28000009fd1', sdk.executePullPayment).start()
```
***

#### sdk.Scheduler.restart
```ts
sdk.Scheduler.restart(pullPaymentID)
```
Restarts the scheduler based on a pull payment ID. The scheduler can be restarted only if it is stopped.

Parameters

1. `string` - pull payment ID

Returns

`undefined`


Example
```ts
sdk.Scheduler.restart('2400005a-0000-0000-0000-f28000009fd1')
```
***

#### sdk.Scheduler.stop
```ts
sdk.Scheduler.stop(pullPaymentID)
```
Stops a running scheduler based on a pull payment ID.

Parameters

1. `string` - pull payment ID

Returns

`undefined`


Example
```ts
sdk.Scheduler.stop('2400005a-0000-0000-0000-f28000009fd1')
```
***

#### sdk.generateQRCode
```ts
sdk.generateQRCode(paymentModelID)
```
This function is being used to generate the QR code object. It can be called after a new pull payment model is created by passing as a parameter the ID of the model.

Parameters

1. `string` - ID of the pull payment model for which you want to generate QR code

Returns
```
{
   pullPaymentModelURL: `https://merchant_example_url.com/payment-model/${paymentModelID}`,
   pullPaymentURL: `https://merchant_example_url.com/payment/`,
   transactionURL: `https://merchant_example_url.com/transaction/`
}
```

<!--`undefined`-->


Example
```ts
sdk.generateQRCode('2400005a-0000-0000-0000-f28000009fd1')
```
***

#### sdk.generateEthPushQRCode
```ts
sdk.generateEthPushQRCode(address, value, gas)
```
This function is being used to generate the QR code object for Ethereum push transaction.

Parameters

1. `string` - Address of the Ethereum wallet that is to receive ethers sent
2. `string` - Big number value of the amount to be transfered
3. `integer` - Transaction gas limit that is to be used

Returns
```
{
   to: `${address}`,
   value: `${value}`,
   gas: `${gas}`,
   data: null
}
```

<!--`undefined`-->


Example
```ts
sdk.generateEthPushQRCode('0x3ae8205c4258888ee976e05a8ed50645e0100000', '10000000000', 21000)
```
***

#### sdk.generateErc20PushQRCode
```ts
sdk.generateErc20PushQRCode(tokenAddress, address, value, gas)
```
This asynchronous function is being used to generate the QR code object for any ERC20 push transaction. Address of the token contract needs to be provided. Transfer method for ERC20Basic tokens is encoded using address and value and passed in the data payload.

Parameters

1. `string` - Address of the token contract
1. `string` - Address of the Ethereum wallet that is to receive tokens
2. `string` - Big number value of the amount to be transfered
3. `integer` - Transaction gas limit that is to be used

Returns
```
{
   to: `${tokenAddress}`,
   value: `0x00`,
   gas: `${gas}`,
   data: '0xa9059cbb000000000000000000000000c5b42db793cb60b4ff9e4c1bd0c2c633af90acfb000000000000000000000000000000000000000000000000000000000000000a'
}
```

<!--`undefined`-->


Example
```ts
sdk.generateErc20PushQRCode('0x5a48205c6258888ee976e05a8ed50645e0111111', '0x3ae8205c4258888ee976e05a8ed50645e0100000', '10000000000', 21000)
```
***

#### sdk.fundETH
```ts
sdk.fundETH(fromAddress, toAddress, pullPaymentID, value? = null, tokenAddress? = null, pullPaymentAddress? = null)
```
This function is being used to transfer ETH from one address to another one. It is called when a new pull payment is registered to transfer ETH from the bank account to the
executor account that will be used for gas throughout the lifecycle of a pull payment.

Parameters

1. `string` - from which address to transfer the ETH
2. `string` - to which address to transfer the ETH
3. `string` - pull payment ID related with this funding
4. `number` - (optional) value of ETH to be transferred - if not provided will be calculated
5. `string` - (optional) token address of the PMA token that is used for calculating the gas fee for transferring PMA - if the value is not provided
6. `string` - (optional) pull payment address that is used for calculating the gas fee for transferring PMA - if the value is not provided

<!--Returns-->

<!--`undefined`-->


Example
```ts
sdk.fundETH('0x3ae8205c4258888ee976e05a8ed50645e0100000', '0x3ae8205c4258888ee976e05a8ed50645e0111111', '2400005a-0000-0000-0000-f28000009fd1')
```
***



#### sdk.cashOutETH
```ts
sdk.cashOutETH(pullPaymentID, tokenAddress? = null)
```
This function is being used to cashing out ETH for a pull payment based on the ID one address to another one.
The cash-out of ETH happens at the end of the pull payment lifecycle so that all the remaining ETH that were not used for gas are transferred back to the bank account.

Parameters

1. `string` - pull payment ID
2. `string` - (optional) token address of the PMA token that is used for calculating the gas fee for transferring ETH - if the value is not provided

<!--Returns-->

<!--`undefined`-->


Example
```ts
sdk.cashOutETH('2400005a-0000-0000-0000-f28000009fd1')
```
***

#### sdk.cashOutPMA
```ts
sdk.cashOutPMA(pullPaymentID, tokenAddress?= null, forceCashOut? = false)
```
This function is being used to cashing out PMA for a pull payment based on the ID one address to another one.
The automated cash-out of PMA is specified on the creation of the pull payment model by the merchant by setting `automatedCashOut` to `true` along with the
`cashOutFrequency` which represents the number of executions after which an automated cashout will take place.

Parameters

1. `string` - pull payment ID
2. `string` - (optional) token address of the PMA token that is used for calculating the gas fee for transferring ETH - if the value is not provided
3. `boolean` - (optional) default `false` - if `true` the cashout will be executed without checking the `cashOutFrequency`

<!--Returns-->

<!--`undefined`-->


Example
```ts
sdk.cashOutPMA('2400005a-0000-0000-0000-f28000009fd1')
```
***
