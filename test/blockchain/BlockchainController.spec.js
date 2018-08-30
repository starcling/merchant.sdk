import chaiAsPromised from 'chai-as-promised';
import { MerchantSDK } from '../../dist/src/MerchantSDKClass';
import { BlockchainController } from '../../dist/src/core/Blockchain/BlockchainController';
import { BlockchainHelper } from '../../dist/src/core/Blockchain/BlockchainHelper';
import { DataService, ISqlQuery } from '../../dist/src/utils/datasource/DataService';
import { TestDbConnector } from '../../dist/src/utils/datasource/TestDbConnector';
import {
    calcSignedMessageForRegistration,
    calcSignedMessageForDeletion,
    getVRS
} from '../helpers/signatureCalculator';
import { Globals } from '../../dist/src/utils/globals';
import {
    timeTravel
} from '../helpers/timeHelper';

require('chai')
    .use(require('chai-as-promised'))
    .should();

const testDbConnector = new TestDbConnector();
const dataservice = new DataService();
let paymentID;
let testId;

const insertTestPayment = async (testPayment) => {
    const result = await testDbConnector.createPayment(testPayment);
    paymentID = result.data[0].id;
};
const updateTestContract = async (testContract) => {
    await testDbConnector.updateContract(testContract);
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
    getContract: testDbConnector.getContract,
    updateContract: testDbConnector.updateContract,
    getTransactions: testDbConnector.getTransactionsByContractID,
    createTransaction: testDbConnector.createTransaction,
    updateTransaction: testDbConnector.updateTransaction
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
    let recurringPullPaymentWithInitial;
    let token;
    let masterPullPayment;
    let testPayment = {
        "title": "test payment",
        "description": "test description",
        "amount": "20",
        "initialPaymentAmount": "23",
        "currency": "PMA",
        "numberOfPayments": 5,
        "frequency": 3,
        "typeID": 1,
        "networkID": 3
    }
    let testContract = {
        "hdWalletIndex": 0,
        "paymentID": "adsfads",
        "numberOfPayments": 4,
        "nextPaymentDate": 10,
        "lastPaymentDate": 20,
        "startTimestamp": 100,
        "customerAddress": client,
        "merchantAddress": beneficiary,
        "pullPaymentAddress": "24234234",
        "statusID": 1,
        "userID": "2342934"
    }

    before(async () => {
        sdk = new MerchantSDK().build(settings);
        await insertTestPayment(testPayment);
    });
    after(async () => {
        sdk.disconnectRedis();
    });
    afterEach(async () => {
        await clearTestPayment(testId);

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
    beforeEach(async () => {
        testContract.paymentID = paymentID;
        testContract.pullPaymentAddress = masterPullPayment.address;
        const result = await testDbConnector.createContract(testContract);
        testId = result.data[0].id;
    });
    beforeEach('set recurring pull payment', () => {
        recurringPullPayment = {
            merchantID: "merchantID",
            paymentID: testId,
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
            paymentID: testId,
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
    beforeEach('add executor', async () => {
        await masterPullPayment.addExecutor(executor, {
            from: owner
        });
    });
    beforeEach('set the rate for multiple fiat currencies', async () => {
        await masterPullPayment.setRate('EUR', EUR_EXCHANGE_RATE, {
            from: owner
        });
        await masterPullPayment.setRate('USD', USD_EXCHANGE_RATE, {
            from: owner
        });
    });
    beforeEach('approve pull payment contract', async () => {
        await token.approve(masterPullPayment.address, MINTED_TOKENS, {
            from: client
        });
    });
    describe('A Blockchain Controller', async () => {
        describe('succefuly executing a pull payment with fixed amount', async () => {
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
                await sdk.executePullPayment(recurringPullPayment.paymentID);
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
            await masterPullPayment.registerPullPayment(
                sigVRS.v,
                sigVRS.r,
                sigVRS.s,
                recurringPullPaymentWithInitial.merchantID,
                recurringPullPaymentWithInitial.paymentID,
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
            await sdk.executePullPayment(recurringPullPayment.paymentID);
            const beneficiaryBalance = await token.balanceOf(beneficiary);

            Number(beneficiaryBalance).should.be.equal(100 * ONE_ETHER);
        });

        it('should transfer PMA tokens to the beneficiary', async () => {
            await sdk.executePullPayment(recurringPullPayment.paymentID);
            await timeTravel(DAY);
            await sdk.executePullPayment(recurringPullPayment.paymentID);
            const beneficiaryBalance = await token.balanceOf(beneficiary);
            Number(beneficiaryBalance).should.be.equal(1100 * ONE_ETHER);
        });
    });
    // TODO: Add failling tests when all the flow is in place.
});