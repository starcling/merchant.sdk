import { DefaultConfig } from '../../config/default.config';

export class QrCode {

    /**
    * @description generate QR Code Url
    * @param {string} paymentID: ID of the specific payment
    * @returns {string} qr code url
    */
    private generateURL(callUrl: string, paymentID: string) {
        return `${DefaultConfig.settings.merchantApiUrl}${callUrl}/${paymentID}`;
    }

    /**
    * @description generate QR Code object
    * @param {string} paymentTemplateID: ID of the specific payment
    * @returns {object} QR code object
    */
    public generateQRCode(paymentTemplateID: string) {
        return {
            paymentTemplateURL: this.generateURL(DefaultConfig.settings.paymentTemplateURL, paymentTemplateID),
            paymentURL: this.generateURL(DefaultConfig.settings.paymentURL, ''),
            transactionURL: this.generateURL(DefaultConfig.settings.transactionURL, '')
        };
    }
}
