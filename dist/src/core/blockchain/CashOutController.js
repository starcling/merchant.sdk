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
const PullPaymentController_1 = require("../database/PullPaymentController");
const FundingController_1 = require("./FundingController");
const default_config_1 = require("../../config/default.config");
const SmartContractReader_1 = require("./utils/SmartContractReader");
const globals_1 = require("../../utils/globals");
const BlockchainHelper_1 = require("./utils/BlockchainHelper");
class CashOutController {
    constructor() {
        this.min = 20000;
        this.max = 50000;
        this.paymentController = new PullPaymentController_1.PullPaymentController();
    }
    cashOutPMA(paymentID, tokenAddress = null, forceCashOut = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = (yield this.paymentController.getPullPayment(paymentID)).data[0];
            if ((!((payment.initialNumberOfPayments - payment.numberOfPayments) % payment.cashOutFrequency)) || forceCashOut) {
                const balance = yield this.getBalance(payment.merchantAddress, tokenAddress);
                const bankAddress = (yield default_config_1.DefaultConfig.settings.bankAddress()).bankAddress;
                yield new FundingController_1.FundingController().fundPMA(payment.merchantAddress, bankAddress, balance, tokenAddress);
            }
        });
    }
    cashOutETH(paymentID, tokenAddress = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = (yield this.paymentController.getPullPayment(paymentID)).data[0];
            const fundingController = new FundingController_1.FundingController();
            const balance = yield new BlockchainHelper_1.BlockchainHelper().getProvider().getBalance(payment.merchantAddress);
            const initalFee = Math.floor(Math.random() * (this.max - this.min) + this.min) * default_config_1.DefaultConfig.settings.web3.utils.toWei('10', 'Gwei');
            const gasFee = default_config_1.DefaultConfig.settings.web3.utils.toWei('10', 'Gwei') * 21000;
            const fundETH = (gasFee) => __awaiter(this, void 0, void 0, function* () {
                const bankAddress = (yield default_config_1.DefaultConfig.settings.bankAddress()).bankAddress;
                yield fundingController.fundETH(payment.merchantAddress, bankAddress, null, balance - gasFee, tokenAddress, null, 21000).catch((err) => __awaiter(this, void 0, void 0, function* () {
                    yield fundETH(gasFee + gasFee / 50);
                }));
            });
            yield fundETH(gasFee + initalFee);
        });
    }
    getBalance(address, tokenAddress = null) {
        return __awaiter(this, void 0, void 0, function* () {
            tokenAddress = tokenAddress ? tokenAddress : globals_1.Globals.GET_SMART_CONTRACT_ADDRESSES(default_config_1.DefaultConfig.settings.networkID).token;
            const contract = yield new SmartContractReader_1.SmartContractReader(globals_1.Globals.GET_TOKEN_CONTRACT_NAME()).readContract(tokenAddress);
            return yield contract.methods.balanceOf(address).call({ from: address });
        });
    }
}
exports.CashOutController = CashOutController;
//# sourceMappingURL=CashOutController.js.map