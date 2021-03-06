import {MerchantSDK} from '../../dist/src/MerchantSDKClass';
import {PrivateKeysDbConnector} from '../../dist/src/utils/datasource/PrivateKeysDbConnector';
import {TestDbConnector} from '../../dist/src/utils/datasource/TestDbConnector';
import {
    calcSignedMessageForRegistration,
    getVRS
} from '../helpers/signatureCalculator';
import {
    timeTravel
} from '../helpers/timeHelper';
import {DataServiceEncrypted} from '../../dist/src/utils/datasource/DataServiceEncrypted';

require('chai')
    .use(require('chai-as-promised'))
    .should();

import * as redis from 'redis';
import * as bluebird from 'bluebird';

const rclient = redis.createClient({
    port: 6379,
    host: 'localhost'
});
bluebird.promisifyAll(redis);

const testDbConnector = new TestDbConnector();
const privateKeysDbConnector = new PrivateKeysDbConnector();
const dataServiceEncrypted = new DataServiceEncrypted();
let pullPaymentID;
let testId;

const insertTestPullPaymentModel = async (testPayment) => {
    const result = await testDbConnector.createPullPaymentModel(testPayment);
    pullPaymentID = result.data[0].id;
};
const clearTestPullPaymentModel = async () => {
    await testDbConnector.deletePullPaymentModel(pullPaymentID);
};

const addKeys = async (address, key) => {
    await privateKeysDbConnector.addAddress(address, key);
}

const clearKey = async (address) => {
    const sqlQuery = {
        text: 'DELETE FROM account WHERE address = ?;',
        values: [address]
    };
    await dataServiceEncrypted.executeQueryAsPromise(sqlQuery);
}

// TEST MNEMONIC - chase eagle blur snack pass version raven awesome wisdom embrace wood example
const PumaPayToken = artifacts.require('PumaPayToken');
const PumaPayPullPayment = artifacts.require('PumaPayPullPayment');

const web3 = require('web3');
const web3API = new web3(new web3.providers.HttpProvider('http://localhost:7545'));

const MINUTE = 60; // 60 seconds
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const ONE_ETHER = web3.utils.toWei("1", 'ether');
const MINTED_TOKENS = 1000000000 * ONE_ETHER; // 1 Billion PMA
const EUR_EXCHANGE_RATE = 100000000; // 0.010 * 1^10
const USD_EXCHANGE_RATE = 120000000; // 0.012 * 1^10

let sdk;

const CLIENT_PRIVATE_KEY = '0xfdfd2ca99b70a6299fff767b4ef0fe82f58c47119721c817046023a29354129c';
contract('Master Pull Payment Contract', async (accounts) => {
    const owner = accounts[0];          // 0xe689c075c808404C9A0d84bE10d2E960CC61c497
    const executor = accounts[1];       // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const client = accounts[2];         // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const beneficiary = '0xc5b42db793CB60B4fF9e4c1bD0c2c633Af90aCFb';
    const bank = accounts[9];

    const bankAddressMock = async () => {
        return {bankAddress: bank};
    };

    const settings = {
        web3: web3API,
        getPullPayment: testDbConnector.getPullPayment,
        updatePullPayment: testDbConnector.updatePullPayment,
        getTransactions: testDbConnector.getTransactionsByContractID,
        createTransaction: testDbConnector.createTransaction,
        updateTransaction: testDbConnector.updateTransaction,
        getPrivateKey: privateKeysDbConnector.getPrivateKey,
        bankAddress: bankAddressMock,
        redisClient: rclient
    };

    let recurringPullPayment;
    let recurringPullPaymentWithInitial;
    let token;
    let pumaPayPullPayment;
    let testPullPaymentModel = {
        "merchantID": "63c684fe-8a97-11e8-b99f-9f38301a1e03",
        "title": "test payment",
        "description": "test description",
        "amount": "20",
        "initialPaymentAmount": "23",
        "trialPeriod": "23",
        "currency": "PMA",
        "numberOfPayments": 5,
        "frequency": 3,
        "typeID": 1,
        "networkID": 3,
        "automatedCashOut": false,
        "cashOutFrequency": 0
    };
    let testPullPayment = {
        "hdWalletIndex": 0,
        "pullPaymentID": "adsfads",
        "numberOfPayments": 4,
        "nextPaymentDate": 10,
        "lastPaymentDate": 20,
        "startTimestamp": 100,
        "customerAddress": client,
        "merchantAddress": beneficiary,
        "pullPaymentAddress": "24234234",
        "statusID": 1,
        "userID": "2342934",
        "networkID": 3
    };

    before('add Key', async () => {
        await addKeys(beneficiary, '4E9632F0D020E8BDD50A6055CC0904C5D866FC14081B48500352A914E02EF387')
    });
    after('remove key', async () => {
        await clearKey(beneficiary);
    });
    before('build sdk and insert payment', async () => {
        sdk = new MerchantSDK().build(settings);
    });
    after('disconnect redis', async () => {
        rclient.quit();
    });
    afterEach('clear test pull payment model', async () => {
        await clearTestPullPaymentModel();

    });
    beforeEach('insert test pull payment model', async () => {
        await insertTestPullPaymentModel(testPullPaymentModel);
    });
    beforeEach('Deploying new PumaPayToken', async () => {
        token = await PumaPayToken.new({
            from: owner
        });
    });
    beforeEach('Deploying new Master Pull Payment  ', async () => {
        pumaPayPullPayment = await PumaPayPullPayment
            .new(token.address, {
                from: owner
            });
    });
    beforeEach('Inserting pull payment', async () => {
        testPullPayment.pullPaymentID = pullPaymentID;
        testPullPayment.pullPaymentAddress = pumaPayPullPayment.address;
        const result = await testDbConnector.createPullPayment(testPullPayment);
        testId = result.data[0].id;
        await testDbConnector.updatePullPayment({
            id: result.data[0].id,
            merchantAddress: beneficiary
        });
    });

    beforeEach('set recurring pull payment', () => {
        recurringPullPayment = {
            merchantID: "merchantID",
            pullPaymentID: testId,
            customerAddress: client,
            beneficiary: beneficiary,
            currency: 'EUR',
            initialPaymentAmount: 0,
            fiatAmountInCents: 1000, // 10.00 USD in cents
            frequency: 10,
            numberOfPayments: 1,
            startTimestamp: Math.floor(Date.now() / 1000)
        };
    });
    beforeEach('set recurring pull payment with intial amount', () => {
        recurringPullPaymentWithInitial = {
            merchantID: "merchantID",
            pullPaymentID: testId,
            customerAddress: client,
            beneficiary: beneficiary,
            currency: 'EUR',
            initialPaymentAmount: 100, // 1.00 USD in cents
            fiatAmountInCents: 1000, // 10.00 USD in cents
            frequency: 10,
            numberOfPayments: 1,
            startTimestamp: Math.floor(Date.now() / 1000) + DAY
        }
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
    beforeEach('Send ETH to smart contract', async () => {
        await pumaPayPullPayment.sendTransaction(
            {
                from: owner,
                value: 1 * ONE_ETHER
            }
        );
    });
    beforeEach('add executor', async () => {
        await pumaPayPullPayment.addExecutor(executor, {
            from: owner
        });
    });
    beforeEach('set the rate for multiple fiat currencies', async () => {
        await pumaPayPullPayment.setRate('EUR', EUR_EXCHANGE_RATE, {
            from: owner
        });
        await pumaPayPullPayment.setRate('USD', USD_EXCHANGE_RATE, {
            from: owner
        });
    });
    beforeEach('approve pull payment contract', async () => {
        await token.approve(pumaPayPullPayment.address, MINTED_TOKENS, {
            from: client
        });
    });
    describe('A Blockchain Controller', async () => {
        describe('succefuly executing a pull payment with fixed amount', async () => {
            beforeEach('register new pull payment', async () => {
                const signature = await calcSignedMessageForRegistration(recurringPullPayment, CLIENT_PRIVATE_KEY);
                const sigVRS = await getVRS(signature);

                await pumaPayPullPayment.registerPullPayment(
                    sigVRS.v,
                    sigVRS.r,
                    sigVRS.s,
                    recurringPullPayment.merchantID,
                    recurringPullPayment.pullPaymentID,
                    recurringPullPayment.customerAddress,
                    recurringPullPayment.beneficiary,
                    recurringPullPayment.currency,
                    recurringPullPayment.initialPaymentAmount,
                    recurringPullPayment.fiatAmountInCents,
                    recurringPullPayment.frequency,
                    recurringPullPayment.numberOfPayments,
                    recurringPullPayment.startTimestamp,
                    {
                        from: executor
                    });
            });
            beforeEach('Transfer funds to beneficiaty', async () => {
                await web3API.eth.sendTransaction({
                    from: bank,
                    to: beneficiary,
                    value: '1000000000000000000'
                });
            });
            it('should transfer PMA tokens to the beneficiary', async () => {
                await sdk.executePullPayment(recurringPullPayment.pullPaymentID);
                const beneficiaryBalance = await token.balanceOf(beneficiary);

                Number(beneficiaryBalance).should.be.equal(1000 * ONE_ETHER);
            });
        });
        // TODO: Add failling tests when all the flow is in place.
    });
    describe('succefuly executing a pull payment with intial payment amount', async () => {
        beforeEach('register new pull payment', async () => {
            const signature = await calcSignedMessageForRegistration(recurringPullPaymentWithInitial, CLIENT_PRIVATE_KEY);
            const sigVRS = await getVRS(signature);
            await pumaPayPullPayment.registerPullPayment(
                sigVRS.v,
                sigVRS.r,
                sigVRS.s,
                recurringPullPaymentWithInitial.merchantID,
                recurringPullPaymentWithInitial.pullPaymentID,
                recurringPullPaymentWithInitial.customerAddress,
                recurringPullPaymentWithInitial.beneficiary,
                recurringPullPaymentWithInitial.currency,
                recurringPullPaymentWithInitial.initialPaymentAmount,
                recurringPullPaymentWithInitial.fiatAmountInCents,
                recurringPullPaymentWithInitial.frequency,
                recurringPullPaymentWithInitial.numberOfPayments,
                recurringPullPaymentWithInitial.startTimestamp,
                {
                    from: executor
                });
        });
        beforeEach('Transfer funds to beneficiaty', async () => {
            await web3API.eth.sendTransaction({
                from: bank,
                to: beneficiary,
                value: '1000000000000000000'
            });
        });
        it('should transfer PMA tokens to the beneficiary', async () => {
            await sdk.executePullPayment(recurringPullPayment.pullPaymentID);
            const beneficiaryBalance = await token.balanceOf(beneficiary);

            Number(beneficiaryBalance).should.be.equal(100 * ONE_ETHER);
        });

        it('should transfer PMA tokens to the beneficiary', async () => {
            await sdk.executePullPayment(recurringPullPayment.pullPaymentID);
            await timeTravel(DAY);
            await sdk.executePullPayment(recurringPullPayment.pullPaymentID);
            const beneficiaryBalance = await token.balanceOf(beneficiary);
            Number(beneficiaryBalance).should.be.equal(1100 * ONE_ETHER);
        });
    });
    // TODO: Add failling tests when all the flow is in place.
});