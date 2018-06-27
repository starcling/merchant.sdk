import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';


import * as tsConfigPaths from 'tsconfig-paths';
const tsConfig = require('../../tsconfig.json');

tsConfigPaths.register({
    rootDir: '.',
    baseUrl: '.',
    paths: tsConfig.compilerOptions.paths
});

import { MerchantSDK } from '../../src/MerchantSDKClass';

chai.use(chaiAsPromised);
chai.should();

// Assume you created new merchant already with this cred {'test_user1200', 'pass0wrd'} using Postman

// when request without apikey
const merchantWithoutApiKey = new MerchantSDK({ apiUrl: 'http://localhost:8081/api/v1/' });

describe('Connect Merchant Core API with username and password', () => {
    it('should return UserToken', async () => {
        const userToken = await merchantWithoutApiKey.authenticate('test_user1200', 'pass0wrd');
        userToken.should.have.property('pmaUserToken').to.be.an('string');
        userToken.should.have.property('pmaApiKey').to.be.an('string');
    });
    it('should return response from GET request to /exchange/global endpoint', async () => {
        const response = await merchantWithoutApiKey.getRequest('/exchange/global');
        response.should.have.property('success').that.is.equal(true);
        response.should.have.property('status').that.is.equal(200);
        response.should.have.property('message').to.be.an('string');
        response.should.have.property('data').to.be.an('object');
    });

    it('should return response from POST request to /schedule endpoint', async () => {
        const response = await merchantWithoutApiKey.postRequest('/schedule', {
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
        });
        response.should.have.property('success').that.is.equal(true);
        response.should.have.property('status').that.is.equal(200);
        response.should.have.property('message').to.be.an('string');
    });
});
