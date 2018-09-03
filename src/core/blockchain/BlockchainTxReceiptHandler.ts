
import { Globals } from '../../utils/globals';
import { IPaymentContractView, ITransactionUpdate, IPaymentContractUpdate } from '../database/models';
import { TransactionController } from '../database/TransactionController';
import { PaymentContractController } from '../database/PaymentContractController';

export class BlockchainTxReceiptHandler {
    public async handleRecurringPaymentReceipt(paymentContract: IPaymentContractView, transactionHash: string, receipt: any): Promise<void> {
        let numberOfPayments = paymentContract.numberOfPayments;
        let lastPaymentDate = paymentContract.lastPaymentDate;
        let nextPaymentDate = paymentContract.nextPaymentDate;
        let executeTxStatusID;
        let statusID;

        if (receipt.status) {
            numberOfPayments = numberOfPayments - 1;
            lastPaymentDate = Math.floor(new Date().getTime() / 1000); // TODO: get from BC ?
            nextPaymentDate = Number(paymentContract.nextPaymentDate) + Number(paymentContract.frequency);
            executeTxStatusID = Globals.GET_TRANSACTION_STATUS_ENUM().success;
            statusID = numberOfPayments == 0 ? Globals.GET_CONTRACT_STATUS_ENUM().done : Globals.GET_CONTRACT_STATUS_ENUM()[paymentContract.status]
        } else {
            executeTxStatusID = Globals.GET_TRANSACTION_STATUS_ENUM().failed;
        }

        await new PaymentContractController().updateContract(<IPaymentContractUpdate>{
            id: paymentContract.id,
            numberOfPayments: numberOfPayments,
            lastPaymentDate: lastPaymentDate,
            nextPaymentDate: nextPaymentDate,
            statusID: statusID
        });

        await new TransactionController().updateTransaction(<ITransactionUpdate>{
            hash: transactionHash,
            statusID: executeTxStatusID
        });
    }

    public async handleRecurringPaymentWithInitialReceipt(paymentContract: IPaymentContractView, transactionHash: string, receipt: any): Promise<void> {
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