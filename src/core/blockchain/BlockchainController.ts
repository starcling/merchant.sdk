import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './SmartContractReader';
import { BlockchainHelper } from './BlockchainHelper';
import { RawTransactionSerializer } from './signatureHelper/RawTransactionSerializer';
import { Scheduler } from '../scheduler/Scheduler';
import { IPaymentUpdateDetails } from '../payment/models';
import { ErrorHandler } from '../../utils/handlers/ErrorHandler';
import { PaymentController } from '../payment/PaymentController';

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
                    let status = Globals.GET_TRANSACTION_STATUS_ENUM().failed;

                    if (receipt.status && bcHelper.isValidRegisterTx(receipt, paymentID)) {
                        status = Globals.GET_TRANSACTION_STATUS_ENUM().success;
                        new Scheduler(paymentID, async () => {
                            this.executePullPayment(paymentID);
                        }).start();
                    }

                    await this.paymentDB.updatePayment(<IPaymentUpdateDetails>{
                        id: paymentID,
                        registerTxStatus: status
                    });
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
            const result = await new BlockchainHelper().getProvider().getTransactionReceipt(txHash);
            if (result) {
                clearInterval(sub);
                const status = result.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;
                await this.paymentDB.updatePayment(<IPaymentUpdateDetails>{
                    id: paymentID,
                    cancelTxStatus: status
                });
                if (result.status) {
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
        const serializedTx: string = await new RawTransactionSerializer(data, payment.pullPaymentAddress, txCount).getSerializedTx();
        await blockchainHelper.executeSignedTransaction(serializedTx).on('transactionHash', async (hash) => {
            const status = Globals.GET_TRANSACTION_STATUS_ENUM().pending;
            await paymentDbConnector.updatePayment(<IPaymentUpdateDetails>{
                id: payment.id,
                executeTxHash: hash,
                executeTxStatus: status
            });
        }).on('receipt', async (receipt) => {
            let numberOfPayments = payment.numberOfPayments;
            let lastPaymentDate = payment.lastPaymentDate;
            let nextPaymentDate = payment.nextPaymentDate;
            let executeTxStatus = payment.executeTxStatus;
            let status = payment.status;

            if (receipt.status) {
                numberOfPayments = numberOfPayments - 1;
                lastPaymentDate = nextPaymentDate;
                nextPaymentDate = Number(payment.nextPaymentDate) + Number(payment.frequency);
                executeTxStatus = Globals.GET_TRANSACTION_STATUS_ENUM().success;
                status = numberOfPayments == 0 ? Globals.GET_PAYMENT_STATUS_ENUM().done : status;
            } else {
                executeTxStatus = Globals.GET_TRANSACTION_STATUS_ENUM().failed;
            }

            await paymentDbConnector.updatePayment(<IPaymentUpdateDetails>{
                id: payment.id,
                numberOfPayments: numberOfPayments,
                lastPaymentDate: lastPaymentDate,
                nextPaymentDate: nextPaymentDate,
                executeTxStatus: executeTxStatus,
                status: status
            });
        }).catch((err) => {
            // TODO: Proper error handling 
            console.debug(err);
        });
    }
}
