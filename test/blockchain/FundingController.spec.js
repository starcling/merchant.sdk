import { MerchantSDK } from '../../dist/src/MerchantSDKClass';
import { DataService } from '../../dist/src/utils/datasource/DataService';
import { PrivateKeysDbConnector } from '../../dist/src/utils/datasource/PrivateKeysDbConnector';
import { TestDbConnector } from '../../dist/src/utils/datasource/TestDbConnector';
import {
    calcSignedMessageForRegistration,
    getVRS
} from '../helpers/signatureCalculator';
import {
    timeTravel
} from '../helpers/timeHelper';
import { DataServiceEncrypted } from '../../dist/src/utils/datasource/DataServiceEncrypted';

require('chai')
    .use(require('chai-as-promised'))
    .should();

const testDbConnector = new TestDbConnector();
const dataservice = new DataService();
const privateKeysDbConnector = new PrivateKeysDbConnector();
const dataServiceEncrypted = new DataServiceEncrypted();
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

const addKeys = async (address, key) => {
    await privateKeysDbConnector.addKeyName();
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
    updateTransaction: testDbConnector.updateTransaction,
    getPrivateKey: privateKeysDbConnector.getPrivateKey
};
let sdk;

const CLIENT_PRIVATE_KEY = '0xfdfd2ca99b70a6299fff767b4ef0fe82f58c47119721c817046023a29354129c';
contract('Master Pull Payment Contract', async (accounts) => {
    const owner = accounts[0];          // 0xe689c075c808404C9A0d84bE10d2E960CC61c497
    const executor = accounts[1];       // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const client = accounts[2];         // 0xf52DBA6fe86D2f80c13F2e2565F521Ad0C18Efc0
    const beneficiary = '0xc5b42db793CB60B4fF9e4c1bD0c2c633Af90aCFb';
    const bank = accounts[9];

    let recurringPullPayment;
    let token;
    let masterPullPayment;
    let testPayment = {
        "merchantID": "63c684fe-8a97-11e8-b99f-9f38301a1e03",
        "title": "test payment",
        "description": "test description",
        "amount": "20",
        "initialPaymentAmount": "23",
        "currency": "PMA",
        "numberOfPayments": 5,
        "trialPeriod": 23,
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
        "userID": "2342934",
        "networkID": 3
    };

    before('add Key', async () => {
        await addKeys(beneficiary, '4E9632F0D020E8BDD50A6055CC0904C5D866FC14081B48500352A914E02EF387');
        await addKeys(bank, '4E9632F0D020E8BDD50A6055CC0904C5D866FC14081B48500352A914E02EF387');
    });
    after('remove key', async () => {
        await clearKey(beneficiary);
        await clearKey(bank);
    })
    before('build sdk and insert payment', async () => {
        sdk = new MerchantSDK().build(settings);
        await insertTestPayment(testPayment);
    });
    after('disconnect redis', async () => {
        sdk.disconnectRedis();
    });
    afterEach('clear test payment', async () => {
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
        await testDbConnector.updateContract({
            id: result.data[0].id,
            merchantAddress: beneficiary
        });

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
        const tokens = MINTED_TOKENS;
        await token.mint(beneficiary, tokens, {
            from: owner
        });
    });
    beforeEach('Issue tokens to the bank', async () => {
        const tokens = MINTED_TOKENS;
        await token.mint(bank, tokens, {
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


    describe('A Funding Controller', async () => {

        describe('successfuly calculate the transfer fee', async () => {
            it('should return calculated value in wei for transfer fee', async () => {
                const amount = await sdk.calculateTransferFee(beneficiary, bank, 400000, token.address);
                expect(amount).to.be.greaterThan(0);
            });
        });

        describe('successfuly calculate the max execution fee', async () => {
            it('should return calculated value in wei for execution fee', async () => {
                const amount = await sdk.calculateMaxExecutionFee(masterPullPayment.address);
                expect(amount).to.be.greaterThan(0);
            });
        });

        describe('successfuly calculate the amount needed to fund', async () => {
            it('should return calculated value in wei for final calculation', async () => {
                const amount = await sdk.calculateWeiToFund(recurringPullPayment.numberOfPayments, recurringPullPayment.paymentID, bank, token.address, masterPullPayment.address);
                expect(amount).to.be.greaterThan(0);
            });
        });

        describe('successfuly funding the beneficiary address', async () => {
            it('should transfer calculated ETH to the beneficiary', async () => {
                const oldBeneficiaryBalance = await web3API.eth.getBalance(beneficiary);
                await sdk.fund(bank, beneficiary, recurringPullPayment.paymentID, token.address, masterPullPayment.address);
                const newBeneficiaryBalance = await web3API.eth.getBalance(beneficiary);
                Number(newBeneficiaryBalance).should.be.greaterThan(Number(oldBeneficiaryBalance));
            });
        });
        // TODO: Add failling tests when all the flow is in place.
    });
});