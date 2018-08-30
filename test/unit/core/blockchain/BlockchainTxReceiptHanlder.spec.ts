import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BlockchainTxReceiptHandler } from '../../../../src/core/Blockchain/BlockchainTxReceiptHandler';
import { Globals } from '../../../../src/utils/globals';
import { IPaymentInsertDetails } from '../../../../src/core/payment/models';

chai.use(chaiAsPromised);
const expect = chai.expect;
const paymentsTestData: any = require('../../../../resources/testData.json').payments;
let testPayment: IPaymentInsertDetails = paymentsTestData['insertTestPayment'];
const successfullRecurringPayment = {
    numberOfPayments: 10,
    lastPaymentDate: Math.floor(new Date().getTime() / 1000),
    nextPaymentDate: Math.floor((new Date().getTime() + 300000) / 1000),
    executeTxStatus: Globals.GET_TRANSACTION_STATUS_ENUM().success,
    status: Globals.GET_PAYMENT_STATUS_ENUM().running
}

const successfullSinglePayment = {
    numberOfPayments: 1,
    lastPaymentDate: Math.floor(new Date().getTime() / 1000),
    nextPaymentDate: Math.floor((new Date().getTime() + 300000) / 1000),
    executeTxStatus: Globals.GET_TRANSACTION_STATUS_ENUM().success,
    status: Globals.GET_PAYMENT_STATUS_ENUM().running
}

const blockchainTxReceiptHandler = new BlockchainTxReceiptHandler();

describe('A Blockchain Tx Receipt Handler', async () => {
    describe('Single Pull Payment', () => {
        it('update the payment when succesfull', async () => {
            // blockchainTxReceiptHandler.handleRecurringPaymentReceipt(successfullSinglePayment, true);
        });
    });

    describe('Recurring Pull Payment', () => {
        it('update the payment when succesfull', async () => {
       
        });
    });

    describe('Recurring Pull Payment with Initial amount', () => {
        it('update the payment when succesfull', async () => {
       
        });
    });
});