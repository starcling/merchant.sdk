"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../../config/default.config");
class QrCode {
    generateURL(callUrl, paymentID) {
        return `${default_config_1.DefaultConfig.settings.merchantApiUrl}${callUrl}/${paymentID}`;
    }
    generateQRCode(paymentID) {
        return {
            paymentURL: this.generateURL(default_config_1.DefaultConfig.settings.paymentsURL, paymentID),
            contractURL: this.generateURL(default_config_1.DefaultConfig.settings.contractURL, ''),
            transactionURL: this.generateURL(default_config_1.DefaultConfig.settings.transactionURL, '')
        };
    }
}
exports.QrCode = QrCode;
//# sourceMappingURL=QrCode.js.map