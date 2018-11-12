import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {Globals} from "../../../../dist/src/utils/globals";
import {MerchantSDK} from "../../../../dist/src/MerchantSDKClass";
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect;
const nodeRSA = require('node-rsa');

const web3 = require('web3');
const web3API = new web3(new web3.providers.HttpProvider('http://localhost:7545'));
const settings = {
    web3: web3API,
    merchantApiUrl: 'test_api',
    getEnums: null,
    getPullPayment: null,
    updatePullPayment: null,
    getTransactions: null,
    createTransaction: null,
    updateTransaction: null,
    getPrivateKey: null,
    bankAddress: null
};

let sdk;
let key;
let publicKey;

describe('A EncryptionController: validateSecretPhrase', () => {

    before('Building the sdk', async () => {
        sdk = new MerchantSDK().build(settings);
    });

    before('Generate keys', () => {
        key = new nodeRSA();
        key.generateKeyPair();
        publicKey = key.exportKey('pkcs8-public');
    });

    before('Stub methods', () => {
        sinon.stub(Globals, 'GET_ENCRYPTION_PUBLIC_KEY').callsFake(() => {
            return publicKey;
        });
    });

    after('Restore methods', () => {
        sinon.restore();
    });

    describe('with success', () => {
        it('should return true if phrase is encrypted with corresponding private key', () => {
            const secretPhrase = Globals.GET_ENCRYPTION_SECRET_PHRASE();
            const encrypted = key.encryptPrivate(secretPhrase, 'base64', 'utf8');
            const valid = sdk.validateSecretPhrase(encrypted);
            expect(valid).to.be.equal(true);
        });
    });

    describe('with failed', () => {
        it('should return false if phrase is not encrypted with corresponding private key', () => {
            const paymentID = 'id';
            const data = sdk.generateQRCode(paymentID);

            expect(data).to.have.property('pullPaymentModelURL');
            expect(data).to.have.property('pullPaymentURL');
            expect(data).to.have.property('transactionURL');
        });
    });
});