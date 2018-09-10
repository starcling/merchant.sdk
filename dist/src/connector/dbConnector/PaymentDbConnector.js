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
class PaymentDbConnector {
    createPayment(insertDetails) {
        const sqlQuery = {
            text: 'SELECT * FROM fc_create_payment($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            values: [
                insertDetails.title,
                insertDetails.description,
                insertDetails.amount,
                insertDetails.currency,
                insertDetails.startTimestamp,
                insertDetails.endTimestamp,
                insertDetails.numberOfPayments,
                insertDetails.startTimestamp,
                insertDetails.type,
                insertDetails.frequency,
                insertDetails.merchantAddress,
                insertDetails.networkID
            ]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery, true);
    }
    updatePayment(updateDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlQuery = {
                text: 'SELECT * FROM fc_update_payment($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)',
                values: [
                    updateDetails.id,
                    updateDetails.title,
                    updateDetails.description,
                    updateDetails.promo,
                    updateDetails.status,
                    updateDetails.customerAddress,
                    updateDetails.amount,
                    updateDetails.currency,
                    updateDetails.startTimestamp,
                    updateDetails.endTimestamp,
                    updateDetails.numberOfPayments,
                    updateDetails.nextPaymentDate,
                    updateDetails.lastPaymentDate,
                    updateDetails.type,
                    updateDetails.frequency,
                    updateDetails.registerTxHash,
                    updateDetails.registerTxStatus,
                    updateDetails.executeTxHash,
                    updateDetails.executeTxStatus,
                    updateDetails.cancelTxHash,
                    updateDetails.cancelTxStatus,
                    updateDetails.merchantAddress,
                    updateDetails.pullPaymentAddress,
                    updateDetails.userId,
                    updateDetails.networkID
                ]
            };
            var response = yield new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
            if (response.data.length === 0 || !response.data[0].id) {
                response.success = false;
                response.status = 400;
                response.message = 'No record found with provided id.';
            }
            return response;
        });
    }
    getPayment(paymentID) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_get_payment_details($1);',
            values: [paymentID]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
    getAllPayments() {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_get_all_payment_details();'
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
    deletePayment(paymentId) {
        const sqlQuery = {
            text: 'SELECT * FROM public.fc_delete_payment($1);',
            values: [paymentId]
        };
        return new DataService_1.DataService().executeQueryAsPromise(sqlQuery);
    }
}
exports.PaymentDbConnector = PaymentDbConnector;
//# sourceMappingURL=PaymentDbConnector.js.map