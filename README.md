# merchant.sdk

## How to use
```
    import MerchantSDK from "puma_merchant_sdk";
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

### Development Server
To push your local development branch, to test development server do the following setup:
1. create a `id_dsa` file in your `~/.ssh/` directory
```bash
$ touch ~/.ssh/id_dsa
```
2. Copy RSA private key from lastpass `https://lastpass.com/`
either use
```bash
$ vi ~/.ssh/id_dsa
```
or
```bash
$ nano ~/.ssh/id_dsa
```
and copy the private key from lastpass `https://lastpass.com/`
3. Set the permission os `id_dsa` file
```bash
$ chmod 400 ~/.ssh/id_dsa
```
After you setup your ssh key setup git remote:
```bash
$ git remote add development ssh://centos@18.196.208.131/home/centos/app/src/merchant.sdk/
```

Your done!
To push the changes, make sure you are on development branch and do:
```bash
$ git push development
```


# LOCAL PACKAGING 
To create a npm package locally run `npm run pack-local` 
To install the local package to another project run `npm link puma_merchant_sdk`