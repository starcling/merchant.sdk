import * as ethers from 'ethers';
import { DefaultConfig } from '../../config/default.config';

export class BlockchainController {

    private provider: any;

    constructor() {
        this.provider = ethers.providers.getDefaultProvider([DefaultConfig.settings.network]);
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @returns {boolean} success/fail response
    */
    protected monitorTransaction(txHash: string) {

        const sub = setInterval(() => {
            const receipt = this.getTransactionStatus(txHash);
            if (receipt) {
                clearInterval(sub);
                //TODO: do something with receipt, update payment DB or something...
                console.log(receipt);
            }
        }, DefaultConfig.settings.txStatusInterval);

        return true;
    }

    /**
    * @description Method for actuall execution of pull payment
    * @returns {object} null
    */
    private executePullPayment() {
        return null;
    }

    private getTransactionStatus(txHash: string) {
        return this.provider.getTransactionReceipt(txHash);
    }
}
