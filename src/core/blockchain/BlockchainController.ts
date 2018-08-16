import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './SmartContractReader';
import { BlockchainHelper } from './BlockchainHelper';
import { RawTransactionSerializer } from './signatureHelper/RawTransactionSerializer';
import { Scheduler } from '../scheduler/Scheduler';
import { IPaymentUpdateDetails } from '../payment/models';
import { ErrorHandler } from '../../utils/handlers/ErrorHandler';
import { PaymentDbConnector } from '../../connector/dbConnector/PaymentDbConnector';

export class BlockchainController {
    private static queueCount = 0;
    private paymentDB;

    public constructor() {
        this.paymentDB = new PaymentDbConnector();
    }

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
                const bcHelper = new BlockchainHelper();
                const receipt = await bcHelper.getProvider().getTransactionReceipt(txHash);
                if (receipt) {
                    clearInterval(sub);
                    let status = Globals.GET_TRANSACTION_STATUS_ENUM().failed;

                    if (receipt.status && bcHelper.isValidRegisterTx(receipt, paymentID)) {
                        status = Globals.GET_TRANSACTION_STATUS_ENUM().success;
                        new Scheduler(paymentID, async () => {
                            BlockchainController.executePullPayment(paymentID);
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
    * @description Method for actual execution of pull payment
    * @returns {object} null
    */
    protected static async executePullPayment(paymentID?: string) {
        const paymentDbConnector = new PaymentDbConnector();
        const payment: IPaymentUpdateDetails = (await paymentDbConnector.getPayment(paymentID)).data[0];
        ErrorHandler.validatePullPaymentExecution(payment);
        const blockchainHelper: BlockchainHelper = new BlockchainHelper();
        const contract: any = await new SmartContractReader(Globals.GET_PULL_PAYMENT_CONTRACT_NAME()).readContract(Globals.GET_MASTER_PULL_PAYMENT_ADDRESSES(payment.networkID));
        const txCount: number = await blockchainHelper.getTxCount(payment.merchantAddress);
        const data: string = contract.methods.executePullPayment(payment.customerAddress, payment.id).encodeABI();
        const serializedTx: string = await new RawTransactionSerializer(data, Globals.GET_MASTER_PULL_PAYMENT_ADDRESSES(payment.networkID), txCount).getSerializedTx();

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

            if (BlockchainController.queueCount > 0 && executeTxStatus == Globals.GET_TRANSACTION_STATUS_ENUM().success) BlockchainController.queueCount--;
        }).catch(() => {
            if (BlockchainController.queueCount < DefaultConfig.settings.queueLimit) {
                BlockchainController.queueCount++;
                BlockchainController.executePullPayment(paymentID);
            }
        });
    }

    protected executePullPayment(paymentID?: string) {
        BlockchainController.executePullPayment(paymentID);
    }

}
