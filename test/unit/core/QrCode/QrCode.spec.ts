import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {Globals} from "../../../../src/utils/globals";
import {MerchantSDK} from "../../../../dist/src/MerchantSDKClass";

chai.use(chaiAsPromised);
const expect = chai.expect;

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

describe('A QrCode', () => {

    before('Building the sdk', async () => {
        sdk = new MerchantSDK().build(settings);
    });

    describe('generateQrCode method', () => {
        it('should return qr code json data', () => {
            const paymentID = 'id';
            const data = sdk.generateQRCode(paymentID);

            expect(data).to.have.property('pullPaymentModelURL');
            expect(data).to.have.property('pullPaymentURL');
            expect(data).to.have.property('transactionURL');
        });
    });


    describe('generateEthPushQrCode method', () => {
        it('should return qr code json data', () => {
            const payload = {
                to: 'add',
                value: '10',
                gas: 21000
            };
            const data = sdk.generateEthPushQRCode(payload.to, payload.value, payload.gas);

            expect(data).to.have.property('to').that.is.equal(payload.to);
            expect(data).to.have.property('value').that.is.equal(payload.value);
            expect(data).to.have.property('gas').that.is.equal(payload.gas);
            expect(data).to.have.property('data').that.is.equal(null);
        });
    });

    describe('generateErc20PushQrCode method', () => {
        it('should return qr code json data', async () => {
            const payload = {
                contract: Globals.GET_SMART_CONTRACT_ADDRESSES(3).token,
                to: Globals.GET_PMA_ESTIMATE_ADDRESS(3),
                value: '10',
                gas: 21000
            };
            const data = await sdk.generateErc20PushQRCode(payload.contract, payload.to, payload.value, payload.gas);

            expect(data).to.have.property('to').that.is.equal(payload.contract);
            expect(data).to.have.property('value').that.is.equal('0x00');
            expect(data).to.have.property('gas').that.is.equal(payload.gas);
            expect(data).to.have.property('data').that.is.not.equal(null);
        });
    });
});