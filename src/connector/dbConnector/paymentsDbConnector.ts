import { ISqlQuery, DataService } from '../../utils/datasource/DataService';
import { IPaymentInsertDetails, IPaymentUpdateDetails } from '../../core/payment/models';
import { reject } from '../../../node_modules/@types/bluebird';

export class PaymentDbConnector {
  public createPayment(insertDetails: IPaymentInsertDetails) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM fc_create_payment($1, $2, $3, $4, $5, $6, $7, $8)',
      values: [
        insertDetails.title,
        insertDetails.description,
        insertDetails.amount,
        insertDetails.currency,
        insertDetails.startTimestamp,
        insertDetails.endTimestamp,
        insertDetails.type,
        insertDetails.frequency
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery, true);
  }

  public async updatePayment(updateDetails: IPaymentUpdateDetails) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM fc_update_payment($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)',
      values: [
        updateDetails.id,
        updateDetails.title,
        updateDetails.description,
        updateDetails.promo,
        updateDetails.status,
        updateDetails.customerAddress,
        updateDetails.amount,
        updateDetails.currency,
        updateDetails.startTimestamp,
        updateDetails.endTimestamp,
        updateDetails.type,
        updateDetails.frequency,
        updateDetails.registerTxHash,
        updateDetails.executeTxHash,
        updateDetails.executeTxStatus,
        updateDetails.debitAccount,
        updateDetails.merchantAddress
      ]
    };
    // Handling the case when no record exists with provided id
    var response = await new DataService().executeQueryAsPromise(sqlQuery);
    if(response.data.length === 0 || !response.data[0].id){
      response.success = false;
      response.status = 400;
      response.message = 'No record found with provided id.'
    }
    return response;
    
  }

  public getPayment(paymentid: string) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_get_payment_details($1);',
      values: [paymentid]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public getAllPayments() {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_get_all_payment_details();'
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public deletePayment(paymentId: string) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_delete_payment($1);',
      values: [paymentId]
    };
    return new DataService().executeQueryAsPromise(sqlQuery);
  }
}