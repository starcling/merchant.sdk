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
const default_config_1 = require("../../config/default.config");
const globals_1 = require("../../utils/globals");
const SmartContractReader_1 = require("./utils/SmartContractReader");
const BlockchainHelper_1 = require("./utils/BlockchainHelper");
const RawTransactionSerializer_1 = require("./utils/RawTransactionSerializer");
const Scheduler_1 = require("../scheduler/Scheduler");
const ErrorHandler_1 = require("../../utils/handlers/ErrorHandler");
const BlockchainTxReceiptHandler_1 = require("./utils/BlockchainTxReceiptHandler");
const TransactionController_1 = require("../database/TransactionController");
const PaymentController_1 = require("../database/PaymentController");
const FundingController_1 = require("./FundingController");
const CashOutController_1 = require("./CashOutController");
class BlockchainController {
    constructor() {
        this.transactionController = new TransactionController_1.TransactionController();
        this.paymentController = new PaymentController_1.PaymentController();
    }
    monitorRegistrationTransaction(txHash, paymentID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sub = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    const bcHelper = new BlockchainHelper_1.BlockchainHelper();
                    const receipt = yield bcHelper.getProvider().getTransactionReceipt(txHash);
                    if (receipt) {
                        clearInterval(sub);
                        const status = receipt.status ? globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().success : globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().failed;
                        const paymentResponse = yield this.transactionController.updateTransaction({
                            hash: receipt.transactionHash,
                            statusID: status
                        });
                        const contract = (yield this.paymentController.getPayment(paymentID)).data;
                        const payment = paymentResponse.data[0];
                        if (receipt.status && bcHelper.isValidRegisterTx(receipt, paymentID)) {
                            if (contract.type == globals_1.Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[globals_1.Globals.GET_PAYMENT_TYPE_ENUM().singlePull] ||
                                contract.type == globals_1.Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[globals_1.Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {
                                this.executePullPayment(paymentID);
                            }
                            if (payment.type !== globals_1.Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[globals_1.Globals.GET_PAYMENT_TYPE_ENUM().singlePull]) {
                                new Scheduler_1.Scheduler(paymentID, () => __awaiter(this, void 0, void 0, function* () {
                                    this.executePullPayment(paymentID);
                                })).start();
                            }
                        }
                        else {
                            return false;
                        }
                    }
                }), default_config_1.DefaultConfig.settings.txStatusInterval);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    monitorCancellationTransaction(txHash, paymentID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sub = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    const receipt = yield new BlockchainHelper_1.BlockchainHelper().getProvider().getTransactionReceipt(txHash);
                    if (receipt) {
                        clearInterval(sub);
                        const status = receipt.status ? globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().success : globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().failed;
                        yield this.transactionController.updateTransaction({
                            hash: receipt.transactionHash,
                            statusID: status
                        });
                        if (receipt.status) {
                            const contract = (yield this.paymentController.getPayment(paymentID)).data[0];
                            Scheduler_1.Scheduler.stop(contract.id);
                        }
                    }
                }), default_config_1.DefaultConfig.settings.txStatusInterval);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    executePullPayment(contractID) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionController = new TransactionController_1.TransactionController();
            const contractController = new PaymentController_1.PaymentController();
            const paymentContract = (yield contractController.getPayment(contractID)).data[0];
            ErrorHandler_1.ErrorHandler.validatePullPaymentExecution(paymentContract);
            const contract = yield new SmartContractReader_1.SmartContractReader(globals_1.Globals.GET_PULL_PAYMENT_CONTRACT_NAME()).readContract(paymentContract.pullPaymentAddress);
            const blockchainHelper = new BlockchainHelper_1.BlockchainHelper();
            const txCount = yield blockchainHelper.getTxCount(paymentContract.merchantAddress);
            const data = contract.methods.executePullPayment(paymentContract.customerAddress, paymentContract.id).encodeABI();
            let privateKey = (yield default_config_1.DefaultConfig.settings.getPrivateKey(paymentContract.merchantAddress)).data[0]['@accountKey'];
            const gasLimit = yield new FundingController_1.FundingController().calculateMaxExecutionFee();
            const serializedTx = yield new RawTransactionSerializer_1.RawTransactionSerializer(data, paymentContract.pullPaymentAddress, txCount, privateKey, gasLimit * 3).getSerializedTx();
            privateKey = null;
            yield blockchainHelper.executeSignedTransaction(serializedTx).on('transactionHash', (hash) => __awaiter(this, void 0, void 0, function* () {
                let typeID = globals_1.Globals.GET_TRANSACTION_TYPE_ENUM().execute;
                if (paymentContract.type == globals_1.Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[globals_1.Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {
                    try {
                        yield transactionController.getTransactions({
                            contractID: paymentContract.id,
                            typeID: globals_1.Globals.GET_TRANSACTION_TYPE_ENUM().initial
                        });
                    }
                    catch (err) {
                        typeID = globals_1.Globals.GET_TRANSACTION_TYPE_ENUM().initial;
                    }
                }
                yield transactionController.createTransaction({
                    hash: hash,
                    typeID: typeID,
                    contractID: paymentContract.id,
                    timestamp: Math.floor(new Date().getTime() / 1000)
                });
            })).on('receipt', (receipt) => __awaiter(this, void 0, void 0, function* () {
                if (paymentContract.type == globals_1.Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[globals_1.Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {
                    try {
                        yield transactionController.getTransactions({
                            contractID: paymentContract.id,
                            typeID: globals_1.Globals.GET_TRANSACTION_TYPE_ENUM().initial,
                            statusID: globals_1.Globals.GET_TRANSACTION_STATUS_ENUM().success
                        });
                        yield new BlockchainTxReceiptHandler_1.BlockchainTxReceiptHandler().handleRecurringPaymentReceipt(paymentContract, receipt.transactionHash, receipt);
                    }
                    catch (err) {
                        yield new BlockchainTxReceiptHandler_1.BlockchainTxReceiptHandler().handleRecurringPaymentWithInitialReceipt(paymentContract, receipt.transactionHash, receipt);
                    }
                }
                else {
                    yield new BlockchainTxReceiptHandler_1.BlockchainTxReceiptHandler().handleRecurringPaymentReceipt(paymentContract, receipt.transactionHash, receipt);
                }
                if (paymentContract.automatedCashOut && receipt.status) {
                    yield new CashOutController_1.CashOutController().cashOutPMA(contractID);
                }
            })).catch((err) => {
                console.debug(err);
            });
        });
    }
}
exports.BlockchainController = BlockchainController;
//# sourceMappingURL=BlockchainController.js.map