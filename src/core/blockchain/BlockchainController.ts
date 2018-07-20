import * as ethers from 'ethers';
import { DefaultConfig } from '../../config/default.config';
import { HTTPHelper } from '../../utils/web/HTTPHelper';
import { Globals } from '../../utils/globals';

export class BlockchainController {

    private provider: any;

    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(`https://${DefaultConfig.settings.network}.infura.io/ZDNEJN22wNXziclTLijw`, DefaultConfig.settings.network);
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} paymentID: ID of the payment which status is to be updated
    * @returns {boolean} success/fail response
    */
    protected monitorTransaction(txHash: string, paymentID: string) {
        const requestURL = `${DefaultConfig.settings.merchantApiUrl}${DefaultConfig.settings.paymentsURL}?status=454`;
                        new HTTPHelper().request(requestURL, 'PATCH');
        try {
            const sub = setInterval(() => {
                this.provider.getTransactionReceipt(txHash, (error, result) => {
                    if(!error) {
                        const requestURL = `${DefaultConfig.settings.merchantApiUrl}${DefaultConfig.settings.paymentsURL}?status=${Globals.GET_TRANSACTION_STATUS_ENUM().success}`;
                        new HTTPHelper().request(requestURL, 'PATCH');
                        clearInterval(sub);
                    }
                });
            }, DefaultConfig.settings.txStatusInterval);
    
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
    * @description Method for actuall execution of pull payment
    * @returns {object} null
    */
    protected executePullPayment() {
        return null;
    }

    // private getTransactionStatus(txHash: string, callback?: any) {
    //     return this.provider.getTransactionReceipt(txHash, callback);
    // }
}
