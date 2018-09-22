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
const globals_1 = require("../../../utils/globals");
const TransactionController_1 = require("../../database/TransactionController");
const PaymentContractController_1 = require("../../database/PaymentContractController");
const CashOutController_1 = require("../CashOutController");
class BlockchainTxReceiptHandler {
    handleRecurringPaymentReceipt(payment, transactionHash, receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            let numberOfPayments = payment.numberOfPayments;
            let lastPaymentDate = payment.lastPaymentDate;
            let nextPaymentDate = payment.nextPaymentDate;
            let executeTxStatusID;
            let statusID;
            if (receipt.status) {
                numberOfPayments = numberOfPayments - 1;
                lastPaymentDate = Math.floor(new Date().getTime() / 1000);
                nextPaymentDate = Number(payment.nextPaymentDate) + Number(payment.frequency);
                executeTxStatusID = globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().success;
                statusID = numberOfPayments == 0 ? globals_1.Globals.GET_CONTRACT_STATUS_ENUM().done : globals_1.Globals.GET_CONTRACT_STATUS_ENUM()[payment.status];
            }
            else {
                executeTxStatusID = globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().failed;
            }
            yield new PaymentContractController_1.PaymentContractController().updatePayment({
                id: payment.id,
                numberOfPayments: numberOfPayments,
                lastPaymentDate: lastPaymentDate,
                nextPaymentDate: nextPaymentDate,
                statusID: statusID
            });
            yield new TransactionController_1.TransactionController().updateTransaction({
                hash: transactionHash,
                statusID: executeTxStatusID
            });
            if (numberOfPayments === 0) {
                const cashOutController = new CashOutController_1.CashOutController();
                yield cashOutController.cashOutPMA(payment.id);
                yield cashOutController.cashOutETH(payment.id);
            }
        });
    }
    handleRecurringPaymentWithInitialReceipt(payment, transactionHash, receipt) {
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