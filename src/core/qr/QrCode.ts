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
    * @param {string} paymentModelID: ID of the specific payment
    * @returns {object} QR code object
    */
    public generateQRCode(paymentModelID: string) {
        return {
            paymentModelURL: this.generateURL(DefaultConfig.settings.paymentModelURL, paymentModelID),
            paymentURL: this.generateURL(DefaultConfig.settings.paymentURL, ''),
            transactionURL: this.generateURL(DefaultConfig.settings.transactionURL, '')
        };
    }
}
