require('ts-node').register({project: './'});
const {MerchantSDK} = require('./../src/MerchantSDKClass');

// Assume you created new merchant already 
// with this cred {'test_user1200', 'pass0wrd'} using Postman
// and api server is running on localhost:8081/api/v1


// when request without apikey
const merchantWithoutApiKey = new MerchantSDK({apiUrl: 'http://localhost:8081/api/v1/'});

/* merchantWithoutApiKey.generateQRCodeURL({
    merchantAddress: "0123x",
    currency: "EUR",
    amount: 123,
    maxAmount: 345,
    frequency: 3,
    nonce: 1,
    startTime: 3,
    endTime: 4,
    callbackURL: 'localhost:8081/api/v1/test'
}).then(url => console.log(url)); */

merchantWithoutApiKey.authenticate('user', 'password').then(res => {
    merchantWithoutApiKey.getRequest('/exchange/global').then(res => 
        console.debug('getRequest', res)
    );
    merchantWithoutApiKey.postRequest('/schedule', {
        "signature": "",
        "signatory_address": "A",
        "debit_amount": 1,
        "debit_currency": "USD",
        "dest_address": "B",
        "saving_account": "",
        "enable_yn": "",
        "payment_id": "",
        "start_time": "",
        "end_time": "",
        "sequence": 1,
        "recurrence_type": "* * * * *",
        "limit": 100,
        "charge": ""
    }).then(res => 
        console.debug('postRequest', res)
    );
}).catch(err => console.debug('getRequest error', err));

// // when request with apikey; Test this with correct apiKey
// const merchantWithApiKey = new MerchantSDK({
//     apiUrl: 'http://localhost:8081/api/v1',
//     apiKey: '170ca4231ad5cda7f9fb5a8319eab0058de55f908e8c5784b879cedbd3f86e3acbf0aa4b31a3e689ee740c5d36b1b11e687c19b7de7d79e723ca16a63c6ef9bf' //valid api key
// });
// merchantWithApiKey.authenticate('test_user1200', 'pass0wrd').then(res => {
//     merchantWithApiKey.getRequest('/exchange/global').then(res => 
//         console.debug('getRequest', res)
//     );
//     merchantWithApiKey.postRequest('/schedule', {
//         "signature": "",
//         "signatory_address": "A",
//         "debit_amount": 1,
//         "debit_currency": "USD",
//         "dest_address": "B",
//         "saving_account": "",
//         "enable_yn": "",
//         "payment_id": "",
//         "start_time": "",
//         "end_time": "",
//         "sequence": 1,
//         "recurrence_type": "* * * * *",
//         "limit": 100,
//         "charge": ""
//     }).then(res => 
//         console.debug('postRequest', res)
//     );
// }).catch(err => console.debug(err));
