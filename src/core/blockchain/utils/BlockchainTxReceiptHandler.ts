
import { Globals } from '../../../utils/globals';
import { IPaymentView, ITransactionUpdate, IPaymentUpdate } from '../../database/models';
import { TransactionController } from '../../database/TransactionController';
import { PaymentController } from '../../database/PaymentController';
import { CashOutController } from '../CashOutController';

export class BlockchainTxReceiptHandler {
    public async handleRecurringPaymentReceipt(payment: IPaymentView, transactionHash: string, receipt: any): Promise<void> {
        let numberOfPayments = payment.numberOfPayments;
        let lastPaymentDate = payment.lastPaymentDate;
        let nextPaymentDate = payment.nextPaymentDate;
        let executeTxStatusID;
        let statusID;

        if (receipt.status) {
            numberOfPayments = numberOfPayments - 1;
            lastPaymentDate = Math.floor(new Date().getTime() / 1000); // TODO: get from BC ?
            nextPaymentDate = Number(payment.nextPaymentDate) + Number(payment.frequency);
            executeTxStatusID = Globals.GET_TRANSACTION_STATUS_ENUM().success;
            statusID = numberOfPayments == 0 ? Globals.GET_CONTRACT_STATUS_ENUM().done : Globals.GET_CONTRACT_STATUS_ENUM()[payment.status]
        } else {
            executeTxStatusID = Globals.GET_TRANSACTION_STATUS_ENUM().failed;
        }

        await new PaymentController().updatePayment(<IPaymentUpdate>{
            id: payment.id,
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
            await cashOutController.cashOutPMA(payment.id);
            await cashOutController.cashOutETH(payment.id);
        }
    }

    public async handleRecurringPaymentWithInitialReceipt(payment: IPaymentView, transactionHash: string, receipt: any): Promise<void> {
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