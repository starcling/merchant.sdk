# merchant.sdk

## How to use

### Step 1
Import sdk from npm.
```
    import merchant_sdk from '@pumapay/merchant_sdk';
```

### Step 2
Instantiate the sdk object.
```
   const sdk = new merchant_sdk(); 
```
Recomended to be used as a singleton.
### Step 3
Construct the paramters required.
```
const settings = {
    web3: web3Provider, // web3 provider for etherium network
    merchantApiUrl: merhcant_host_url, // merchant website api url 
    redisHost: REDIS_HOST, // redis database host 
    redisPort: REDIS_PORT, // redis database port
    getEnums: enumerables, // method for getting enumerables
    getPaymentByID: getPaymentByIDCallback, // callback for getting payment from DB
    updatePayment: updatePaymentCallback, // callback for updating payment from DB
    getTransactions: getTransactionsByPaymentIDCallback, // callback for getting transactions from DB
    createTransaction: createTransactionCallback, // callback for creating transactions from DB
    updateTransaction: updateTransactionCallback, // callback for updating transactions from DB
    getPrivateKey: getPrivateKey // callback for getting private key based on hd wallet address
}
```
### Step 4
Build the sdk using provided parameters.
```
    sdk.build(settings);
```
You're done!
Now you can use the sdk, and all its funcionalities.

## Basic methods

```
sdk.monitorRegistrationTransaction(txHash, pullPaymentID);
sdk.monitorCancellationTransaction(txHash, pullPaymentID);
sdk.executePullPayment(pullPaymentID);
sdk.cashOutPMA(paymentID, [,tokenAddress]);
sdk.cashOutETH(paymentID, [,tokenAddress]);
sdk.getBalance(address, [,tokenAddress]);
sdk.fundETH(fromAddress, toAddress, paymentID, [, value, tokenAddress, pullPaymentAddress]);
sdk.fundPMA(fromAddress, toAddress, value, [,tokenAddress]);
sdk.calculateWeiToFund(paymentID, bankAddress, [,tokenAddress, pullPaymentAddress]);
sdk.calculateTransferFee(fromAddress, toAddress, value, [,tokenAddress]);
sdk.generateQRCode(paymentModelID);
sdk.Scheduler.stop(paymentID);
sdk.Scheduler.restart(paymentID);
```
