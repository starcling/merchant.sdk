import * as ethers from 'ethers';
import { DefaultConfig } from '../../config/default.config';
import { HTTPHelper } from '../../utils/web/HTTPHelper';
import { Globals } from '../../utils/globals';
// const Web3 = require('web3');

export class BlockchainController {

    private provider: any;
    // private web3: any;

    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(`https://${DefaultConfig.settings.network}.infura.io/ZDNEJN22wNXziclTLijw`, DefaultConfig.settings.network);
        // this.web3 = new Web3(new Web3.providers.HttpProvider(Globals.GET_SPECIFIC_INFURA_URL()));
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} paymentID: ID of the payment which status is to be updated
    * @returns {boolean} success/fail response
    */
    protected monitorTransaction(txHash: string, paymentID: string) {
        const requestURL = `${DefaultConfig.settings.merchantApiUrl}${DefaultConfig.settings.paymentsURL}/${paymentID}?status=${Globals.GET_TRANSACTION_STATUS_ENUM().success}`;
        try {
            const sub = setInterval( async () => {
                const result = await this.provider.getTransactionReceipt(txHash);
                if(result && result.status === 1) {
                    clearInterval(sub);
                    new HTTPHelper().request(requestURL, 'PATCH');
                }
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
