"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../../config/default.config");
class QrCode {
    generateURL(callUrl, paymentID) {
        return `${default_config_1.DefaultConfig.settings.merchantApiUrl}${callUrl}/${paymentID}`;
    }
    generateQRCode(paymentModelID) {
        return {
            paymentModelURL: this.generateURL(default_config_1.DefaultConfig.settings.paymentModelURL, paymentModelID),
            paymentURL: this.generateURL(default_config_1.DefaultConfig.settings.paymentURL, ''),
            transactionURL: this.generateURL(default_config_1.DefaultConfig.settings.transactionURL, '')
        };
    }
}
exports.QrCode = QrCode;
//# sourceMappingURL=QrCode.js.map