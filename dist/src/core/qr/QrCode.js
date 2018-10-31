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
const SmartContractReader_1 = require("../blockchain/utils/SmartContractReader");
class QrCode {
    generateURL(callUrl, pullPaymentModelID) {
        return `${default_config_1.DefaultConfig.settings.merchantApiUrl}${callUrl}/${pullPaymentModelID}`;
    }
    generateQRCode(paymentModelID) {
        return {
            pullPaymentModelURL: this.generateURL(default_config_1.DefaultConfig.settings.pullPaymentModelURL, paymentModelID),
            pullPaymentURL: this.generateURL(default_config_1.DefaultConfig.settings.pullPaymentURL, ''),
            transactionURL: this.generateURL(default_config_1.DefaultConfig.settings.transactionURL, '')
        };
    }
    generateEthPushQRCode(address, value, gas) {
        return {
            to: address,
            value: value,
            gas: gas,
            data: null
        };
    }
    generateErc20PushQRCode(tokenAddress, address, value, gas) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contract = yield new SmartContractReader_1.SmartContractReader('ERC20Basic').readContract(tokenAddress);
                const data = contract.methods.transfer(address, value).encodeABI();
                return {
                    to: tokenAddress,
                    value: '0x00',
                    gas: gas,
                    data: data
                };
            }
            catch (e) {
                return e;
            }
        });
    }
}
exports.QrCode = QrCode;
//# sourceMappingURL=QrCode.js.map