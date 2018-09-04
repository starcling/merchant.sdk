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
    * @param {string} paymentID: ID of the specific payment
    * @returns {object} QR code object
    */
    public generateQRCode(paymentID: string) {
        return {
            paymentURL: this.generateURL(DefaultConfig.settings.paymentsURL, paymentID),
            contractURL: this.generateURL(DefaultConfig.settings.contractURL, ''),
            transactionURL: this.generateURL(DefaultConfig.settings.transactionURL, '')
        };
    }
}
