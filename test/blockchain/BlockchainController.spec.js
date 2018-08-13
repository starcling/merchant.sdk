import chaiAsPromised from 'chai-as-promised';
import { BlockchainController } from '../../dist/src/core/Blockchain/BlockchainController';
import { DataService, ISqlQuery } from '../../dist/src/utils/datasource/DataService';
import { PaymentDbConnector } from '../../dist/src/connector/dbconnector/PaymentDbConnector';
import {
    insertTestPayment,
    clearTestPayment
} from '../helpers/blockchainHelper';

require('chai')
    .use(require('chai-as-promised'))
    .should();

const paymentsTestData = require('../../resources/testData.json').payments;
const testPayment = paymentsTestData['insertTestPayment'];
let testId;

const insertTestPayment = async () => {
  const result = await paymentDbConnector.createPayment(testPayment);
  testId = result.data[0].id;
};

const clearTestPayment = async () => {
  const sqlQuery = {
    text: 'DELETE FROM public.tb_payments WHERE id = $1;',
    values: [testId]
  };
  await dataservice.executeQueryAsPromise(sqlQuery);
};

// TEST MNEMONIC - chase eagle blur snack pass version raven awesome wisdom embrace wood example
const PumaPayToken = artifacts.require('PumaPayToken');
const MasterPullPayment = artifacts.require('MasterPullPayment');

const web3 = require('web3');
const web3API = new web3(new web3.providers.HttpProvider('http://localhost:7545'))

const ONE_ETHER = web3.utils.toWei("1", 'ether');
const MINTED_TOKENS = 1000000000 * ONE_ETHER; // 1 Billion PMA
const EUR_EXCHANGE_RATE = 100000000; // 0.01 * 1^10
const USD_EXCHANGE_RATE = 200000000; // 0.02 * 1^10

const MINUTE = 60; // 60 seconds
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const blockchainHelper = new BlockchainController();
blockchainHelper.provider = web3API;

const CLIENT_PRIVATE_KEY = '0xfdfd2ca99b70a6299fff767b4ef0fe82f58c47119721c817046023a29354129c';
contract('Master Pull Payment  Contract', async (accounts) => {
    const owner = accounts[0];          // 0xe689c075c808404C9A0d84bE10d2E960CC61c497
    const executor = accounts[1];       // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const client = accounts[2];         // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const beneficiary = accounts[3];    // 0x8CB728587175968B3616758FD0a528D057dFc336

    let recurringPullPayment = {
        merchantID: "merchantID",
        paymentID: "paymentID",
        client: client,
        beneficiary: beneficiary,
        currency: 'USD',
        fiatAmountInCents: 20, // 0.20 USD in cents
        frequency: 2 * MINUTE,
        numberOfPayments: 10,
        startTimestamp: Math.floor(Date.now() / 1000) + DAY
    };

    let token;
    let masterPullPayment;

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
    describe('A Blockchain Controller', async () => {
        beforeEach(async () => {
            await insertTestPayment();
        });
        afterEach(async () => {
            await clearTestPayment();
        });
        beforeEach('register new pull payment', async () => {
            const signature = await calcSignedMessageForRegistration(recurringPullPayment, CLIENT_PRIVATE_KEY);
                const sigVRS = await getVRS(signature);
    
                await masterPullPayment.registerPullPayment(
                    sigVRS.v,
                    sigVRS.r,
                    sigVRS.s,
                    recurringPullPayment.merchantID,
                    recurringPullPayment.paymentID,
                    recurringPullPayment.client,
                    recurringPullPayment.beneficiary,
                    recurringPullPayment.currency,
                    recurringPullPayment.fiatAmountInCents,
                    recurringPullPayment.frequency,
                    recurringPullPayment.numberOfPayments,
                    recurringPullPayment.startTimestamp,
                    {
                        from: executor
                    });
        })
        it('should execute the first pull payment', async () => {
            // await timeTravel(2 * MINUTE);

            // accounts = await web3API.eth.getAccounts();
            // const nonceBefore = await blockchainHelper.getTxCount(accounts[0]);
            
            // await web3API.eth.sendTransaction({to:accounts[1], from:accounts[0], value:web3API.utils.toWei("0.5", "ether")})
            // await web3API.eth.sendTransaction({to:accounts[1], from:accounts[0], value:web3.utils.toWei("1.5", "ether")})
    
            // const nonceAfter = await blockchainHelper.getTxCount(accounts[0]);
    
            // expect((nonceAfter - nonceBefore)).to.be.equal(2);
        })
    });
});