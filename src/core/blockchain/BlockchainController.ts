import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './SmartContractReader';
import { BlockchainHelper } from './BlockchainHelper';
import { RawTransactionSerializer } from './signatureHelper/RawTransactionSerializer';
import { Scheduler } from '../scheduler/Scheduler';
import { PaymentDbConnector } from '../../connector/dbConnector/paymentsDbConnector';
import { IPaymentUpdateDetails } from '../payment/models';

export class BlockchainController extends PaymentDbConnector {
    //TODO: add these addresses dynamically
    private debitAddress: string = '0x15f79A4247cD2e9898dD45485683a0B26855b646';
    private merchantAddress: string = '0x9d11DDd84198B30E56E31Aa89227344Cdb645e34';

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain and upon receiving receipt 
    * to create a scheduler that will execute the pull payment
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} paymentID: ID of the payment which status is to be updated
    * @returns {boolean} success/fail response
    */
    protected async monitorTransaction(txHash: string, paymentID: string) {
        try {
            const sub = setInterval(async () => {
                const result = await new BlockchainHelper().getProvider().getTransactionReceipt(txHash);
                if (result) {
                    clearInterval(sub);
                    const status = result.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;
                    this.updatePayment(<IPaymentUpdateDetails>{
                        id: paymentID,
                        regiserTxStatus: status
                    });
                    if (result.status) {
                        const payment = (await this.getPayment(paymentID)).data[0];
                        new Scheduler(payment, () => {
                            this.executePullPayment(paymentID);
                        }).start();
                    }
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
    private async executePullPayment(paymentID?: string) {
        const payment = (await this.getPayment(paymentID)).data[0];
        const blockchainHelper = new BlockchainHelper();
        const contract = await new SmartContractReader('DebitAccount').readContract(payment.debitAddress ? payment.debitAddress : this.debitAddress);
        const txCount = await blockchainHelper.getTxCount(payment.merchantAddress ? payment.merchantAddress : this.merchantAddress);
        const data = contract.methods.executePullPayment().encodeABI();
        const serializedTx = await new RawTransactionSerializer(data, payment.debitAddress ? payment.debitAddress : this.debitAddress, txCount).getSerializedTx();

        blockchainHelper.executeSignedTransaction(serializedTx).on('transactionHash', (hash) => {
            const status = Globals.GET_TRANSACTION_STATUS_ENUM().pending;

            this.updatePayment(<IPaymentUpdateDetails>{
                id: payment.id,
                executeTxHash: hash,
                executeTxStatus: status
            });
        }).on('receipt', (receipt) => {
            const status = receipt.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;

            this.updatePayment(<IPaymentUpdateDetails>{
                id: payment.id,
                executeTxStatus: status,
                lastPaymentDate: payment.nextPaymentDate,
                nextPaymentDate: Number(payment.nextPaymentDate) + Number(payment.frequency)
            });

        });
    }
}
