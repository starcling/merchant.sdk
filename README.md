# merchant.sdk

## How to use
```
    import MerchantSDK from "puma-merchant-sdk";
```

## Example

```
    const merchant = new MerchantSDK({apiUrl: 'API_HOST_URL'});

    merchant.authenticate('user', 'password').then(res => {
        merchant.getRequest('API_ENDPOINT').then(response => {
            // Do something with response
        });

        merchant.postRequest('API_ENDPOINT', {}).then(response => {
            // Do something with response
        });
    })
    .catch(err => // handle error when authenticate fails );
```

# LOCAL PACKAGING 
To create a npm package locally run `npm run pack-local` 
To install the local package to another project run `npm link puma_sdk_core`