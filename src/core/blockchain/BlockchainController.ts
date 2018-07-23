import { DefaultConfig } from '../../config/default.config';
import { HTTPHelper } from '../../utils/web/HTTPHelper';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './SmartContractReader';
import { BlockchainHelper } from './BlockchainHelper';
import { RawTransactionSerializer } from './signatureHelper/RawTransactionSerializer';

export class BlockchainController {
    private debitAddress: string = '0x15f79A4247cD2e9898dD45485683a0B26855b646';

    private blockchainHelper: BlockchainHelper;

    constructor() {
        this.blockchainHelper = new BlockchainHelper();
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
                const result = await this.blockchainHelper.getProvider().getTransactionReceipt(txHash);
                if(result && result.status === 1) {
                    clearInterval(sub);
                    new HTTPHelper().request(requestURL, 'PATCH');
                    this.executePullPayment();
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
    private async executePullPayment(debitAddress?: string) {
        const contract = await new SmartContractReader('DebitAccount').readContract(this.debitAddress);
        const ownerAddress = await contract.methods.owner().call();
        const txCount = await this.blockchainHelper.getTxCount(ownerAddress);
        const data = contract.methods.executePullPayment().encodeABI();
        const serializedTx = await new RawTransactionSerializer(data, this.debitAddress, txCount).getSerializedTx();

        return this.blockchainHelper.executeSignedTransaction(serializedTx);
    }
}
