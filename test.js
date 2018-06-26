const MerchantSDK = require('./index').default;

// Assume you created new merchant already with this cred {'test_user1200', 'pass0wrd'} using Postman

// when request without apikey
const merchantWithoutApiKey = new MerchantSDK({apiUrl: 'http://localhost:8081/api/v1/'});
merchantWithoutApiKey.authenticate('test_user1200', 'pass0wrd').then(res => {
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
});

// when request with apikey
const merchantWithApiKey = new MerchantSDK({
    apiUrl: 'http://localhost:8081/api/v1',
    apiKey: '1234567890'
});
merchantWithApiKey.authenticate('test_user1200', 'pass0wrd').then(res => {
    merchantWithApiKey.getRequest('/exchange/global').then(res => 
        console.debug('getRequest', res)
    );
    merchantWithApiKey.postRequest('/schedule', {
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
}).catch(err => console.debug(err));
