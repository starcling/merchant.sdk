import chaiAsPromised from 'chai-as-promised';
import { MerchantSDK } from '../../dist/src/MerchantSDKClass';
import { BlockchainController } from '../../dist/src/core/Blockchain/BlockchainController';
import { BlockchainHelper } from '../../dist/src/core/Blockchain/BlockchainHelper';
import { DataService, ISqlQuery } from '../../dist/src/utils/datasource/DataService';
import { PaymentDbConnector } from '../../dist/src/utils/datasource/PaymentDbConnector';
import {
    calcSignedMessageForRegistration,
    calcSignedMessageForDeletion,
    getVRS
} from '../helpers/signatureCalculator';
import { Globals } from '../../dist/src/utils/globals';

require('chai')
    .use(require('chai-as-promised'))
    .should();

const paymentDbConnector = new PaymentDbConnector();
const dataservice = new DataService();
let testId;

const insertTestPayment = async (testPayment) => {
  const result = await paymentDbConnector.createPayment(testPayment);
  testId = result.data[0].id;
};
const updateTestPayment = async (testPayment) => {
    const result = await paymentDbConnector.updatePayment(testPayment);
    testId = result.data[0].id;
};
const clearTestPayment = async (paymentID) => {
  const sqlQuery = {
    text: 'DELETE FROM public.tb_payments WHERE id = $1;',
    values: [paymentID]
  };
  await dataservice.executeQueryAsPromise(sqlQuery);
};

// TEST MNEMONIC - chase eagle blur snack pass version raven awesome wisdom embrace wood example
const PumaPayToken = artifacts.require('PumaPayToken');
const MasterPullPayment = artifacts.require('MasterPullPayment');

const web3 = require('web3');
const web3API = new web3(new web3.providers.HttpProvider('http://localhost:7545'));

const MINUTE = 60; // 60 seconds
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const ONE_ETHER = web3.utils.toWei("1", 'ether');
const MINTED_TOKENS = 1000000000 * ONE_ETHER; // 1 Billion PMA
const EUR_EXCHANGE_RATE = 100000000; // 0.010 * 1^10
const USD_EXCHANGE_RATE = 120000000; // 0.012 * 1^10

const settings = {
    web3: web3API,
    getPayment: paymentDbConnector.getPayment,
    deletePayment: paymentDbConnector.deletePayment,
    createPayment: paymentDbConnector.createPayment,
    updatePayment: paymentDbConnector.updatePayment,
    getAllPayments: paymentDbConnector.getAllPayments
};
let sdk;

const CLIENT_PRIVATE_KEY = '0xfdfd2ca99b70a6299fff767b4ef0fe82f58c47119721c817046023a29354129c';
const MERCHANT_PRIVATE_KEY = Globals.GET_MERCHANT_PRIVATE_KEY();
contract('Master Pull Payment  Contract', async (accounts) => {
    const owner = accounts[0];          // 0xe689c075c808404C9A0d84bE10d2E960CC61c497
    const executor = accounts[1];       // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const client = accounts[2];         // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const beneficiary = web3API.eth.accounts.privateKeyToAccount('0x' + MERCHANT_PRIVATE_KEY).address;
    const bank = accounts[9];         

    let recurringPullPayment;
    let token;
    let masterPullPayment;
    let testPayment = {
        "title": "Test Payment",
        "description": "Payment description",
        "amount": 1000,
        "customerAddress": client,
        "currency": "EUR",
        "startTimestamp": Math.floor(Date.now() / 1000),
        "endTimestamp": Math.floor(Date.now() / 1000) + 10 * DAY,
        "numberOfPayments": 1,
        "type": 1,
        "frequency": 10,
        "merchantAddress": beneficiary,
        "networkID": 3
    };;

    before(async () => {
        sdk = new MerchantSDK().build(settings);
    });
    after(async () => {
        sdk.disconnectRedis();
    });
    afterEach(async () => {
        await clearTestPayment(testId);
    });
    beforeEach(async () => {
        await insertTestPayment(testPayment);
    });
    beforeEach('set recurring pull payment', () => {
        recurringPullPayment = {
            merchantID: "merchantID",
            paymentID: testId,
            customerAddress: client,
            beneficiary: beneficiary,
            currency: 'EUR',
            fiatAmountInCents: 1000, // 0.20 USD in cents
            frequency: 10,
            numberOfPayments: 1,
            startTimestamp: Math.floor(Date.now() / 1000)
        };
    });
    beforeEach('Deploying new PumaPayToken', async () => {
        token = await PumaPayToken.new({
            from: owner
        });
    });
    beforeEach('Deploying new Master Pull Payment  ', async () => {
        masterPullPayment = await MasterPullPayment
            .new(token.address, {
                from: owner
            });
    });
    beforeEach('Issue tokens to the clients', async () => {
        const tokens = MINTED_TOKENS;
        await token.mint(client, tokens, {
            from: owner
        });
    });
    beforeEach('Finish Minting', async () => {
        await token.finishMinting({
            from: owner
        });
    });
    beforeEach('add executor', async () => {
        await masterPullPayment.addExecutor(executor, {
            from: owner
        });
    });
    beforeEach('set the rate for multiple fiat currencies', async () => {
        await masterPullPayment.setRate('EUR', EUR_EXCHANGE_RATE, {
            from:owner
        });
        await masterPullPayment.setRate('USD', USD_EXCHANGE_RATE, {
            from: owner
        });
    });
    beforeEach('approve pull payment contract', async () => {
        await token.approve(masterPullPayment.address, MINTED_TOKENS,{
            from: client
        });
    });
    beforeEach(async () => {
        await updateTestPayment({
            "id": testId,
            "customerAddress": client,
            "pullPaymentAddress": masterPullPayment.address
        });
    });
    describe('A Blockchain Controller', async () => {
        beforeEach('register new pull payment', async () => {
            const signature = await calcSignedMessageForRegistration(recurringPullPayment, CLIENT_PRIVATE_KEY);
            const sigVRS = await getVRS(signature);
            await masterPullPayment.registerPullPayment(
                sigVRS.v,
                sigVRS.r,
                sigVRS.s,
                recurringPullPayment.merchantID,
                recurringPullPayment.paymentID,
                recurringPullPayment.customerAddress,
                recurringPullPayment.beneficiary,
                recurringPullPayment.currency,
                recurringPullPayment.fiatAmountInCents,
                recurringPullPayment.frequency,
                recurringPullPayment.numberOfPayments,
                recurringPullPayment.startTimestamp,
                {
                    from: executor
                });
        });
        describe('succefuly executing a pull payment', async () => {
            beforeEach('Transfer funds to beneficiaty', async () => {
                await web3API.eth.sendTransaction({
                    from: bank,
                    to: beneficiary,
                    value: '1000000000000000000'
                })
            });
            it('should transfer PMA tokens to the beneficiary', async () => {
                await sdk.executePullPayment(recurringPullPayment.paymentID);
                const beneficiaryBalance = await token.balanceOf(beneficiary);
                
                Number(beneficiaryBalance).should.be.equal(1000 * ONE_ETHER);
            });
        })
        // TODO: Add failling tests when all the flow is in place.
    });
});