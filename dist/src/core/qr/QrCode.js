"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../../config/default.config");
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
}
exports.QrCode = QrCode;
//# sourceMappingURL=QrCode.js.map