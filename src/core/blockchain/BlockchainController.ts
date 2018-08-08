import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './SmartContractReader';
import { BlockchainHelper } from './BlockchainHelper';
import { RawTransactionSerializer } from './signatureHelper/RawTransactionSerializer';
import { Scheduler } from '../scheduler/Scheduler';
import { PaymentDbConnector } from '../../connector/dbconnector/PaymentDbConnector';
import { IPaymentUpdateDetails } from '../payment/models';
import { ErrorHandler } from '../../utils/handlers/ErrorHandler';

export class BlockchainController extends PaymentDbConnector {

    private static queueLimit = 100;
    private static queueCount = 0;

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
                    await this.updatePayment(<IPaymentUpdateDetails>{
                        id: paymentID,
                        registerTxStatus: status
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
    * @description Method for actual execution of pull payment
    * @returns {object} null
    */
    protected async executePullPayment(paymentID?: string) {
        const payment: IPaymentUpdateDetails = (await this.getPayment(paymentID)).data[0];
        ErrorHandler.validatePullPaymentExecution(payment);
        const blockchainHelper: BlockchainHelper = new BlockchainHelper();
        const contract: any = await new SmartContractReader('PullPaymentAccount').readContract(payment.pullPaymentAccountAddress);
        const txCount: number = await blockchainHelper.getTxCount(payment.merchantAddress);
        const data: string = contract.methods.executePullPayment().encodeABI();
        const serializedTx: string = await new RawTransactionSerializer(data, payment.pullPaymentAccountAddress, txCount).getSerializedTx();

        await blockchainHelper.executeSignedTransaction(serializedTx).on('transactionHash', async (hash) => {
            const status = Globals.GET_TRANSACTION_STATUS_ENUM().pending;

            await this.updatePayment(<IPaymentUpdateDetails>{
                id: payment.id,
                executeTxHash: hash,
                executeTxStatus: status
            });
        }).on('receipt', async (receipt) => {
            const status = receipt.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;
            const numberOfPayments = receipt.status ? payment.numberOfPayments - 1 : payment.numberOfPayments;

            await this.updatePayment(<IPaymentUpdateDetails>{
                id: payment.id,
                executeTxStatus: status,
                lastPaymentDate: payment.nextPaymentDate,
                numberOfPayments: numberOfPayments,
                nextPaymentDate: Number(payment.nextPaymentDate) + Number(payment.frequency)
            });

            if (BlockchainController.queueCount > 0 && status == Globals.GET_TRANSACTION_STATUS_ENUM().success) BlockchainController.queueCount--;
        }).catch(() => {
            if (BlockchainController.queueCount < BlockchainController.queueLimit) {
                BlockchainController.queueCount++;
                this.executePullPayment(paymentID);
            }
        });
    }
}
