import { DefaultConfig } from "../../config/default.config";

export class QrCode {

    /**
    * @description generate QR Code Url
    * @param {string} paymentID: ID of the specific payment
    * @returns {string} qr code url
    */
    private generateURL(paymentID: string) {
        return `${DefaultConfig.settings.merchantApiUrl}${DefaultConfig.settings.paymentsURL}/${paymentID}`;
    }

    /**
    * @description generate QR Code object
    * @param {string} paymentID: ID of the specific payment
    * @returns {object} QR code object
    */
    public generate(paymentID: string) {
        return { url: this.generateURL(paymentID) };
    }
}
