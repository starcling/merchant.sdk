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
const globals_1 = require("../../utils/globals");
const TransactionController_1 = require("../database/TransactionController");
const PaymentContractController_1 = require("../database/PaymentContractController");
class BlockchainTxReceiptHandler {
    handleRecurringPaymentReceipt(paymentContract, transactionHash, receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            let numberOfPayments = paymentContract.numberOfPayments;
            let lastPaymentDate = paymentContract.lastPaymentDate;
            let nextPaymentDate = paymentContract.nextPaymentDate;
            let executeTxStatusID;
            let statusID;
            if (receipt.status) {
                numberOfPayments = numberOfPayments - 1;
                lastPaymentDate = Math.floor(new Date().getTime() / 1000);
                nextPaymentDate = Number(paymentContract.nextPaymentDate) + Number(paymentContract.frequency);
                executeTxStatusID = globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().success;
                statusID = numberOfPayments == 0 ? globals_1.Globals.GET_PAYMENT_STATUS_ENUM().done : globals_1.Globals.GET_PAYMENT_STATUS_ENUM()[paymentContract.status];
            }
            else {
                executeTxStatusID = globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().failed;
            }
            yield new PaymentContractController_1.PaymentContractController().updateContract({
                id: paymentContract.id,
                numberOfPayments: numberOfPayments,
                lastPaymentDate: lastPaymentDate,
                nextPaymentDate: nextPaymentDate,
                statusID: statusID
            });
            yield new TransactionController_1.TransactionController().updateTransaction({
                hash: transactionHash,
                statusID: executeTxStatusID
            });
        });
    }
    handleRecurringPaymentWithInitialReceipt(paymentContract, transactionHash, receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            let initialPaymentTxStatus;
            if (receipt.status) {
                initialPaymentTxStatus = globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().success;
            }
            else {
                initialPaymentTxStatus = globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().failed;
            }
            yield new TransactionController_1.TransactionController().updateTransaction({
                hash: transactionHash,
                statusID: initialPaymentTxStatus
            });
        });
    }
}
exports.BlockchainTxReceiptHandler = BlockchainTxReceiptHandler;
//# sourceMappingURL=BlockchainTxReceiptHandler.js.map