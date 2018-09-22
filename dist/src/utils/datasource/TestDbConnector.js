"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataService_1 = require("../../utils/datasource/DataService");
class TestDbConnector {
    createPayment(insertDetails) {
        const sqlQuery = {
            text: 'SELECT * FROM fc_create_payment_contract($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            values: [
                insertDetails.hdWalletIndex,
                insertDetails.paymentID,
                insertDetails.numberOfPayments,
                insertDetails.nextPaymentDate,
                insertDetails.startTimestamp,
                insertDetails.customerAddress,
                insertDetails.merchantAddress,
                insertDetails.pullPaymentAddress,
                insertDetails.userID
            ]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery, true);
    }
    updatePayment(updateDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlQuery = {
                text: 'SELECT * FROM fc_update_payment_contract($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                values: [
                    updateDetails.id,
                    updateDetails.hdWalletIndex,
                    updateDetails.numberOfPayments,
                    updateDetails.nextPaymentDate,
                    updateDetails.lastPaymentDate,
                    updateDetails.startTimestamp,
                    updateDetails.merchantAddress,
                    updateDetails.statusID,
                    updateDetails.userID
                ]
            };
            const response = yield new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
            if (response.data.length === 0 || !response.data[0].id) {
                response.success = false;
                response.status = 400;
                response.message = 'No record found with provided id.';
            }
            return response;
        });
    }
    getPayment(contractID) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_get_payment_contract($1);',
            values: [contractID]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
    createPaymentTemplate(insertDetails) {
        const sqlQuery = {
            text: 'SELECT * FROM fc_create_payment($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            values: [
                insertDetails.merchantID,
                insertDetails.title,
                insertDetails.description,
                insertDetails.promo,
                insertDetails.amount,
                insertDetails.initialPaymentAmount,
                insertDetails.trialPeriod,
                insertDetails.currency,
                insertDetails.numberOfPayments,
                insertDetails.frequency,
                insertDetails.typeID,
                insertDetails.networkID
            ]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery, true);
    }
    updatePaymentTemplate(updateDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlQuery = {
                text: 'SELECT * FROM fc_update_payment($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                values: [
                    updateDetails.id,
                    updateDetails.title,
                    updateDetails.description,
                    updateDetails.promo,
                    updateDetails.amount,
                    updateDetails.initialPaymentAmount,
                    updateDetails.trialPeriod,
                    updateDetails.currency,
                    updateDetails.numberOfPayments,
                    updateDetails.frequency,
                    updateDetails.typeID,
                    updateDetails.networkID
                ]
            };
            const response = yield new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
            if (response.data.length === 0 || !response.data[0].id) {
                response.success = false;
                response.status = 400;
                response.message = 'No record found with provided id.';
            }
            return response;
        });
    }
    getPaymentTemplate(paymentID) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_get_payment_details($1);',
            values: [paymentID]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
    deletePaymentTemplate(paymentId) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_delete_payment($1);',
            values: [paymentId]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
    createTransaction(transaction) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_create_transaction($1, $2, $3, $4);',
            values: [
                transaction.hash,
                transaction.typeID,
                transaction.contractID,
                transaction.timestamp
            ]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery, true);
    }
    updateTransaction(transaction) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_update_transaction($1, $2);',
            values: [
                transaction.hash,
                transaction.statusID
            ]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
    deleteTransaction(transaction) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_delete_transaction($1);',
            values: [
                transaction.hash
            ]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
    getTransaction(transaction) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_get_transaction($1);',
            values: [
                transaction.hash
            ]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
    getTransactionsByContractID(transaction) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_get_transactions_by_contract_id($1, $2, $3);',
            values: [
                transaction.contractID,
                transaction.statusID,
                transaction.typeID
            ]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
}
exports.TestDbConnector = TestDbConnector;
//# sourceMappingURL=TestDbConnector.js.map