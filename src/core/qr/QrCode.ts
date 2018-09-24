import { DefaultConfig } from '../../config/default.config';

export class QrCode {

    /**
    * @description generate QR Code Url
    * @param {string} pullPaymentModelID: ID of the specific payment
    * @returns {string} qr code url
    */
    private generateURL(callUrl: string, pullPaymentModelID: string) {
        return `${DefaultConfig.settings.merchantApiUrl}${callUrl}/${pullPaymentModelID}`;
    }

    /**
    * @description generate QR Code object
    * @param {string} paymentModelID: ID of the specific payment
    * @returns {object} QR code object
    */
    public generateQRCode(paymentModelID: string) {
        return {
            pullPaymentModelURL: this.generateURL(DefaultConfig.settings.pullPaymentModelURL, paymentModelID),
            pullPaymentURL: this.generateURL(DefaultConfig.settings.pullPaymentURL, ''),
            transactionURL: this.generateURL(DefaultConfig.settings.transactionURL, '')
        };
    }
}
