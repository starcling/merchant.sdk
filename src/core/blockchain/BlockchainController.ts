import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './SmartContractReader';
import { BlockchainHelper } from './BlockchainHelper';
import { RawTransactionSerializer } from './signatureHelper/RawTransactionSerializer';
import { Scheduler } from '../scheduler/Scheduler';
import { IPaymentUpdateDetails } from '../payment/models';
import { ErrorHandler } from '../../utils/handlers/ErrorHandler';
import { PaymentController } from '../payment/PaymentController';
import { BlockchainTxReceiptHandler } from './BlockchainTxReceiptHandler';

export class BlockchainController {
    private paymentDB;

    public constructor() {
        this.paymentDB = new PaymentController();
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain and upon receiving receipt 
    * to create a scheduler that will execute the pull payment
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} paymentID: ID of the payment registration which status is to be updated
    * @returns {boolean} success/fail response
    */
    protected async monitorRegistrationTransaction(txHash: string, paymentID: string) {
        try {
            const sub = setInterval(async () => {
                const bcHelper = new BlockchainHelper();
                const receipt = await bcHelper.getProvider().getTransactionReceipt(txHash);
                if (receipt) {
                    clearInterval(sub);
                    const status = receipt.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;

                    const paymentResponse = await this.paymentDB.updatePayment(<IPaymentUpdateDetails>{
                        id: paymentID,
                        registerTxStatus: status
                    });
                    const payment = paymentResponse.data[0];

                    if (receipt.status && bcHelper.isValidRegisterTx(receipt, paymentID)) {
                        if ((payment.type == Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial && 
                            payment.initialPaymentTxStatus != Globals.GET_TRANSACTION_STATUS_ENUM().success)
                            || payment.type == Globals.GET_PAYMENT_TYPE_ENUM().singlePull) { 
                                this.executePullPayment(paymentID);
                            }

                        if (payment.type !== Globals.GET_PAYMENT_TYPE_ENUM().singlePull) {
                            new Scheduler(paymentID, async () => {
                                this.executePullPayment(paymentID);
                            }).start();
                        }
                        
                    }
                }
            }, DefaultConfig.settings.txStatusInterval);

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain and upon receiving receipt 
    * to stop the scheduler that executes the pull payment
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} paymentID: ID of the payment which cancellation status is to be updated
    * @returns {boolean} success/fail response
    */
   protected async monitorCancellationTransaction(txHash: string, paymentID: string) {
    try {
        const sub = setInterval(async () => {
            const receipt = await new BlockchainHelper().getProvider().getTransactionReceipt(txHash);
            if (receipt) {
                clearInterval(sub);
                const status = receipt.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;
                await this.paymentDB.updatePayment(<IPaymentUpdateDetails>{
                    id: paymentID,
                    cancelTxStatus: status
                });
                if (receipt.status) {
                    const payment = (await this.paymentDB.getPayment(paymentID)).data[0];
                    Scheduler.stop(payment.id);
                }
            }
        }, DefaultConfig.settings.txStatusInterval);

        return true;
    } catch (error) {
        return false;
    }
}

    /**
    * @description Method for actual execution of pull payment
    * @returns {object} null
    */
    public async executePullPayment(paymentID?: string): Promise<void> {
        const paymentDbConnector = new PaymentController();
        const payment: IPaymentUpdateDetails = (await paymentDbConnector.getPayment(paymentID)).data[0];
        ErrorHandler.validatePullPaymentExecution(payment);

        const contract: any = await new SmartContractReader(Globals.GET_PULL_PAYMENT_CONTRACT_NAME()).readContract(payment.pullPaymentAddress);
        const blockchainHelper: BlockchainHelper = new BlockchainHelper();
        const txCount: number = await blockchainHelper.getTxCount(payment.merchantAddress);
        const data: string = contract.methods.executePullPayment(payment.customerAddress, payment.id).encodeABI();
        let privateKey: string = await this.getPrivateKey(payment.merchantAddress);
        const serializedTx: string = await new RawTransactionSerializer(data, payment.pullPaymentAddress, txCount, privateKey).getSerializedTx();
        privateKey = null;

        await blockchainHelper.executeSignedTransaction(serializedTx).on('transactionHash', async (hash) => {
            if (payment.type == Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial && 
            payment.initialPaymentTxStatus != Globals.GET_TRANSACTION_STATUS_ENUM().success) { 
                await paymentDbConnector.updatePayment(<IPaymentUpdateDetails>{
                    id: payment.id,
                    initialPaymentTxHash: hash,
                    initialPaymentTxStatus: Globals.GET_TRANSACTION_STATUS_ENUM().pending
                });
            } else {
                await paymentDbConnector.updatePayment(<IPaymentUpdateDetails>{
                    id: payment.id,
                    executeTxHash: hash,
                    executeTxStatus: Globals.GET_TRANSACTION_STATUS_ENUM().pending
                });
            }
        }).on('receipt', async (receipt) => {
            if (payment.type == Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial && 
            payment.initialPaymentTxStatus != Globals.GET_TRANSACTION_STATUS_ENUM().success) { 
                await new BlockchainTxReceiptHandler().handleRecurringPaymentWithInitialReceipt(payment, receipt);
            } else {
                await new BlockchainTxReceiptHandler().handleRecurringPaymentReceipt(payment, receipt);
            }
        }).catch((err) => {
            // TODO: Proper error handling 
            paymentDbConnector.updatePayment(<IPaymentUpdateDetails>{
                id: payment.id,
                executeTxHash: 'failed',
                executeTxStatus: Globals.GET_TRANSACTION_STATUS_ENUM().failed
            });
        });
    }

    private async getPrivateKey(address: string): Promise<string> {
        return (await DefaultConfig.settings.getPrivateKey(address)).data[0]['@accountKey'];
    }
}
