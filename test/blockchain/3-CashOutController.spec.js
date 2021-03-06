import {MerchantSDK} from '../../dist/src/MerchantSDKClass';
import {PrivateKeysDbConnector} from '../../dist/src/utils/datasource/PrivateKeysDbConnector';
import {TestDbConnector} from '../../dist/src/utils/datasource/TestDbConnector';
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
};

const clearKey = async (address) => {
    const sqlQuery = {
        text: 'DELETE FROM account WHERE address = ?;',
        values: [address]
    };
    await dataServiceEncrypted.executeQueryAsPromise(sqlQuery);
};

// TEST MNEMONIC - chase eagle blur snack pass version raven awesome wisdom embrace wood example
const PumaPayToken = artifacts.require('PumaPayToken');
const PumaPayPullPayment = artifacts.require('PumaPayPullPayment');

const web3 = require('web3');
const web3API = new web3(new web3.providers.HttpProvider('http://localhost:7545'));

const MINUTE = 60; // 60 seconds
const HOUR = 60 * MINUTE;
const ONE_ETHER = web3.utils.toWei("1", 'ether');
const MINTED_TOKENS = 1000000000 * ONE_ETHER; // 1 Billion PMA

let sdk;

contract('Master Pull Payment Contract', async (accounts) => {
    const owner = accounts[0];          // 0xe689c075c808404C9A0d84bE10d2E960CC61c497
    const client = accounts[2];         // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const beneficiary2 = accounts[3];         // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const beneficiary = '0xc5b42db793CB60B4fF9e4c1bD0c2c633Af90aCFb';
    const bank = accounts[9];

    const bankAddressMock = async () => {
        return {bankAddress: bank}
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
        "automatedCashOut": true,
        "cashOutFrequency": 1,
        "networkID": 3,
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
        await addKeys(beneficiary, '4E9632F0D020E8BDD50A6055CC0904C5D866FC14081B48500352A914E02EF387');
        await addKeys(beneficiary2, '6cab891a1f6e5b60e99b9adfc0f1c06150334d4d67bc65204736f2543feaada9'.toUpperCase());
        await addKeys(bank, 'e2e00d88c4f66daf29875c6b23702631db4cab46034041ceee39617f8fcf5e49'.toUpperCase());
    });
    after('remove key', async () => {
        await clearKey(beneficiary);
        await clearKey(beneficiary2);
        await clearKey(bank);
    });
    before('build sdk', async () => {
        sdk = new MerchantSDK().build(settings);
    });
    after('disconnect redis', async () => {
        rclient.quit();
    });
    afterEach('clear test pull payment model', async () => {
        await clearTestPullPaymentModel();
    });
    beforeEach('Insert test pull payment model', async () => {
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
    beforeEach(async () => {
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
            numberOfPayments: 4,
            startTimestamp: Math.floor(Date.now() / 1000)
        };
    });
    beforeEach('Issue tokens to the clients', async () => {
        const tokens = MINTED_TOKENS;
        await token.mint(client, tokens, {
            from: owner
        });
    });
    beforeEach('Issue tokens to the beneficiery', async () => {
        const tokens = MINTED_TOKENS / 100000000;
        await token.mint(beneficiary, tokens, {
            from: owner
        });
    });
    beforeEach('Issue tokens to the beneficiery', async () => {
        const tokens = MINTED_TOKENS / 100000000;
        await token.mint(beneficiary2, tokens, {
            from: owner
        });
    });
    beforeEach('Issue tokens to the bank', async () => {
        const tokens = MINTED_TOKENS / 100000000;
        await token.mint(bank, tokens, {
            from: owner
        });
    });
    beforeEach('Finish Minting', async () => {
        await token.finishMinting({
            from: owner
        });
    });


    describe('A CashOut Controller', async () => {
        describe('successfuly retrieve the balance for address', async () => {
            it('should retrieve balance of PMA of provided address', async () => {
                const balance = await token.balanceOf(beneficiary);
                const sdkBalance = await sdk.getBalance(beneficiary, token.address);
                Number(sdkBalance).should.be.equal(Number(balance));
            });
        });

        describe('successfuly execute cash out PMA', async () => {
            it('should cash out PMAs from beneficiery to the bank', async () => {
                const oldBalance = await token.balanceOf(beneficiary);
                await sdk.fundETH(bank, beneficiary, recurringPullPayment.pullPaymentID, null, token.address, pumaPayPullPayment.address);
                await sdk.cashOutPMA(recurringPullPayment.pullPaymentID, token.address);
                const balance = await token.balanceOf(beneficiary);
                Number(balance).should.be.equal(0);
                Number(oldBalance).should.be.greaterThan(0);
            });
        });

        describe('successfuly execute cash out ETH', async () => {
            it('should cash out ETHs from beneficiery to the bank', async () => {
                await testDbConnector.updatePullPayment({
                    id: recurringPullPayment.pullPaymentID,
                    merchantAddress: beneficiary2
                });
                await sdk.fundETH(bank, beneficiary2, recurringPullPayment.pullPaymentID, null, token.address, pumaPayPullPayment.address);
                await sdk.cashOutETH(recurringPullPayment.pullPaymentID, token.address);
                const newBalance = await web3API.eth.getBalance(beneficiary2);

                Number(newBalance).should.be.lessThan(4000000000000000);
            });
        });

        after('transfer back eth', async () => {
            web3API.eth.sendTransaction({
                from: bank,
                to: beneficiary2,
                value: 100 * ONE_ETHER
            });
        });
        // TODO: Add failling tests when all the flow is in place.
    });
});