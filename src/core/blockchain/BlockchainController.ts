import { DefaultConfig } from '../../config/default.config';
import { HTTPHelper } from '../../utils/web/HTTPHelper';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './SmartContractReader';
import { BlockchainHelper } from './BlockchainHelper';
import { RawTransactionSerializer } from './signatureHelper/RawTransactionSerializer';

export class BlockchainController {
    //TODO: add these addresses dynamically
    private debitAddress: string = '0x15f79A4247cD2e9898dD45485683a0B26855b646';
    private merchantAddress: string = '0x9d11DDd84198B30E56E31Aa89227344Cdb645e34';

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} paymentID: ID of the payment which status is to be updated
    * @returns {boolean} success/fail response
    */
    protected monitorTransaction(txHash: string, paymentID: string) {
        let requestURL = `${DefaultConfig.settings.merchantApiUrl}${DefaultConfig.settings.paymentsURL}/${paymentID}?status=`;

        try {
            const sub = setInterval( async () => {
                const result = await new BlockchainHelper().getProvider().getTransactionReceipt(txHash);
                if(result) {
                    clearInterval(sub);
                    const status = result.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed; 
                    if (result.status) {
                        //TODO: create scheduler instead of executing pull payment
                        this.executePullPayment(this.debitAddress, paymentID);
                    }
                    new HTTPHelper().request(requestURL + status, 'PATCH');
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
    private async executePullPayment(debitAddress?: string, paymentID?: string) {
        const blockchainHelper = new BlockchainHelper();
        const contract = await new SmartContractReader('DebitAccount').readContract(debitAddress);
        const txCount = await blockchainHelper.getTxCount(this.merchantAddress);
        const data = contract.methods.executePullPayment().encodeABI();
        const serializedTx = await new RawTransactionSerializer(data, debitAddress, txCount).getSerializedTx();

        blockchainHelper.executeSignedTransaction(serializedTx).on('transactionHash', (hash) => {
            //TODO: Some callback that pull payment transaction is submited
            new HTTPHelper().request(`${DefaultConfig.settings.merchantApiUrl}${DefaultConfig.settings.paymentsURL}/${paymentID}?promo=` + hash, 'PATCH');
        }).on('receipt', (receipt) => {
            //TODO: Some callback that pull payment is completed/failed
        });
    }
}
