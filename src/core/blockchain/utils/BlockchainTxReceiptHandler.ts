
import { Globals } from '../../../utils/globals';
import { IPullPaymentView, ITransactionUpdate, IPullPaymentUpdate } from '../../database/models';
import { TransactionController } from '../../database/TransactionController';
import { PullPaymentController } from '../../database/PullPaymentController';
import { CashOutController } from '../CashOutController';

export class BlockchainTxReceiptHandler {
    public async handleRecurringPaymentReceipt(pullPayment: IPullPaymentView, transactionHash: string, receipt: any): Promise<void> {
        let numberOfPayments = pullPayment.numberOfPayments;
        let lastPaymentDate = pullPayment.lastPaymentDate;
        let nextPaymentDate = pullPayment.nextPaymentDate;
        let executeTxStatusID;
        let statusID;

        if (receipt.status) {
            numberOfPayments = numberOfPayments - 1;
            lastPaymentDate = Math.floor(new Date().getTime() / 1000); // TODO: get from BC ?
            nextPaymentDate = Number(pullPayment.nextPaymentDate) + Number(pullPayment.frequency);
            executeTxStatusID = Globals.GET_TRANSACTION_STATUS_ENUM().success;
            statusID = numberOfPayments == 0 ? Globals.GET_PULL_PAYMENT_STATUS_ENUM().done : Globals.GET_PULL_PAYMENT_STATUS_ENUM()[pullPayment.status]
        } else {
            executeTxStatusID = Globals.GET_TRANSACTION_STATUS_ENUM().failed;
        }

        await new PullPaymentController().updatePullPayment(<IPullPaymentUpdate>{
            id: pullPayment.id,
            numberOfPayments: numberOfPayments,
            lastPaymentDate: lastPaymentDate,
            nextPaymentDate: nextPaymentDate,
            statusID: statusID
        });

        await new TransactionController().updateTransaction(<ITransactionUpdate>{
            hash: transactionHash,
            statusID: executeTxStatusID
        });


        if (numberOfPayments === 0) { // Payment is done, time to cash out.
            const cashOutController = new CashOutController();
            await cashOutController.cashOutPMA(pullPayment.id);
            await cashOutController.cashOutETH(pullPayment.id);
        }
    }

    public async handleRecurringPaymentWithInitialReceipt(payment: IPullPaymentView, transactionHash: string, receipt: any): Promise<void> {
        let initialPaymentTxStatus: number;
        
        if (receipt.status) {
            initialPaymentTxStatus = Globals.GET_TRANSACTION_STATUS_ENUM().success;
        } else {
            initialPaymentTxStatus = Globals.GET_TRANSACTION_STATUS_ENUM().failed;
        }

        await new TransactionController().updateTransaction(<ITransactionUpdate>{
            hash: transactionHash,
            statusID: initialPaymentTxStatus
        });
    }
}