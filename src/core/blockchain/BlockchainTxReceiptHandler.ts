import { IPaymentUpdateDetails } from '../payment/models';
import { Globals } from '../../utils/globals';
import { PaymentController } from '../payment/PaymentController';

export class BlockchainTxReceiptHandler {
    public async handleRecurringPaymentReceipt(payment: IPaymentUpdateDetails, receipt: any): Promise<void> {
        let numberOfPayments = payment.numberOfPayments;
        let lastPaymentDate = payment.lastPaymentDate;
        let nextPaymentDate = payment.nextPaymentDate;
        let executeTxStatus = payment.executeTxStatus;
        let status = payment.status;

        if (receipt.status) {
            numberOfPayments = numberOfPayments - 1;
            lastPaymentDate = Math.floor(new Date().getTime() / 1000); // TODO: get from BC ?
            nextPaymentDate = Number(payment.nextPaymentDate) + Number(payment.frequency);
            executeTxStatus = Globals.GET_TRANSACTION_STATUS_ENUM().success;
            status = numberOfPayments == 0 ? Globals.GET_PAYMENT_STATUS_ENUM().done : status;
        } else {
            executeTxStatus = Globals.GET_TRANSACTION_STATUS_ENUM().failed;
        }

        await new PaymentController().updatePayment(<IPaymentUpdateDetails>{
            id: payment.id,
            numberOfPayments: numberOfPayments,
            lastPaymentDate: lastPaymentDate,
            nextPaymentDate: nextPaymentDate,
            executeTxStatus: executeTxStatus,
            status: status
        });
    }

    public async handleRecurringPaymentWithInitialReceipt(payment: IPaymentUpdateDetails, receipt: any): Promise<void> {
        let initialPaymentTxStatus: number;
        
        if (receipt.status) { 
            initialPaymentTxStatus = Globals.GET_TRANSACTION_STATUS_ENUM().success;
        } else {
            initialPaymentTxStatus = Globals.GET_TRANSACTION_STATUS_ENUM().failed;
        }
        await new PaymentController().updatePayment(<IPaymentUpdateDetails>{
            id: payment.id,
            initialPaymentTxStatus: initialPaymentTxStatus
        });
    }
}