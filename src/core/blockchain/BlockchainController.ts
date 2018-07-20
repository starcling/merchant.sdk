import * as ethers from 'ethers';
import { DefaultConfig } from '../../config/default.config';

export class BlockchainController {

    private provider: any;

    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(`https://${DefaultConfig.settings.network}.infura.io/ZDNEJN22wNXziclTLijw`, DefaultConfig.settings.network);
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @returns {boolean} success/fail response
    */
    protected monitorTransaction(txHash: string) {

        try {
            const sub = setInterval(() => {
                this.provider.getTransactionReceipt(txHash, (error, result) => {
                    if(!error) {
                        console.log(result);
                        clearInterval(sub);
                        return 'asd';
                    } 
                    console.log(error);
                    return 'asfas';
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
