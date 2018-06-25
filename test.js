require('ts-node').register({project: __dirname});

const {MerchantSDK} = require('./index');

const merchantSDK = new MerchantSDK({apiUrl: 'http://localhost:8081/api/v1'});
merchantSDK.authenticate('test_user1200', 'pass0wrd').then(res => console.debug(res));
