const MerchantSDK = require('./index').default;

const merchantSDK = new MerchantSDK();
merchantSDK.authenticate('test_user1200', 'pass0wrd').then(res => console.debug(res));
