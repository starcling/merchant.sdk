import {DefaultConfig} from '../../config/default.config';
import {IEtheremTransaction} from "./models";
import {SmartContractReader} from "../blockchain/utils/SmartContractReader";

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

    /**
     * @description generate QR Code object
     * @param {string} paymentModelID: ID of the specific payment
     * @returns {object} QR code object
     */
    public generateEthPushQRCode(address: string, value: string, gas: number) {

        return <IEtheremTransaction>{
            to: address,
            value: value,
            gas: gas,
            data: null
        };
    }

    /**
     * @description generate QR Code object
     * @param {string} paymentModelID: ID of the specific payment
     * @returns {object} QR code object
     */
    public async generateErc20PushQRCode(tokenAddress: string, address: string, value: string, gas: number) {
        try {
            const contract: any = await new SmartContractReader('ERC20Basic').readContract(tokenAddress);
            const data: string = contract.methods.transfer(address, value).encodeABI();

            return <IEtheremTransaction>{
                to: tokenAddress,
                value: '0x00',
                gas: gas,
                data: data
            };
        } catch (e) {
            return e;
        }

    }
}
