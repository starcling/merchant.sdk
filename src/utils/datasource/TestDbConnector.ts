import { IPullPaymentUpdate, ITransactionInsert, ITransactionUpdate, ITransactionGet } from "../../core/database/models";
import { ISqlQuery, DataService } from '../../utils/datasource/DataService';

export class TestDbConnector {
  public createPullPayment(insertDetails: any) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM fc_create_payment($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      values: [
        insertDetails.hdWalletIndex,
        insertDetails.pullPaymentID,
        insertDetails.numberOfPayments,
        insertDetails.nextPaymentDate,
        insertDetails.startTimestamp,
        insertDetails.customerAddress,
        insertDetails.merchantAddress,
        insertDetails.pullPaymentAddress,
        insertDetails.userID
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery, true);
  }

  public async updatePullPayment(updateDetails: IPullPaymentUpdate) {
    const sqlQuery: ISqlQuery = {
      // tslint:disable-next-line:max-line-length
      text: 'SELECT * FROM fc_update_payment($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      values: [
        updateDetails.id,
        updateDetails.hdWalletIndex,
        updateDetails.numberOfPayments,
        updateDetails.nextPaymentDate,
        updateDetails.lastPaymentDate,
        updateDetails.startTimestamp,
        updateDetails.merchantAddress,
        updateDetails.statusID,
        updateDetails.userID
      ]
    };
    // Handling the case when no record exists with provided id
    const response = await new DataService().executeQueryAsPromise(sqlQuery);
    if (response.data.length === 0 || !response.data[0].id) {
      response.success = false;
      response.status = 400;
      response.message = 'No record found with provided id.';
    }

    return response;
  }

  public getPullPayment(pullPaymentID: string) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_get_payment_by_id($1);',
      values: [pullPaymentID]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public createPullPaymentModel(insertDetails: any) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM fc_create_payment_model($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
      values: [
        insertDetails.merchantID,
        insertDetails.title,
        insertDetails.description,
        insertDetails.promo,
        insertDetails.amount,
        insertDetails.initialPaymentAmount,
        insertDetails.trialPeriod,
        insertDetails.currency,
        insertDetails.numberOfPayments,
        insertDetails.frequency,
        insertDetails.typeID,
        insertDetails.networkID,
        insertDetails.automatedCashOut,
        insertDetails.cashOutFrequency
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery, true);
  }

  public async updatePullPaymentModel(updateDetails: any) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM fc_update_payment_model($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
      values: [
        updateDetails.id,
        updateDetails.title,
        updateDetails.description,
        updateDetails.promo,
        updateDetails.amount,
        updateDetails.initialPaymentAmount,
        updateDetails.trialPeriod,
        updateDetails.currency,
        updateDetails.numberOfPayments,
        updateDetails.frequency,
        updateDetails.typeID,
        updateDetails.networkID,
        updateDetails.automatedCashOut,
        updateDetails.cashOutFrequency
      ]
    };
    // Handling the case when no record exists with provided id
    const response = await new DataService().executeQueryAsPromise(sqlQuery);
    if (response.data.length === 0 || !response.data[0].id) {
      response.success = false;
      response.status = 400;
      response.message = 'No record found with provided id.';
    }

    return response;
  }

  public getPullPaymentModel(pullPaymentID: string) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_get_payment_details($1);',
      values: [pullPaymentID]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public deletePullPaymentModel(pullPaymentID: string) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_delete_payment($1);',
      values: [pullPaymentID]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public createTransaction(transaction: ITransactionInsert) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_create_transaction($1, $2, $3, $4);',
      values: [
        transaction.hash,
        transaction.typeID,
        transaction.paymentID,
        transaction.timestamp
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery, true);
  }

  public updateTransaction(transaction: ITransactionUpdate) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_update_transaction($1, $2);',
      values: [
        transaction.hash,
        transaction.statusID
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public deleteTransaction(transaction: ITransactionGet) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_delete_transaction($1);',
      values: [
        transaction.hash
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public getTransaction(transaction: ITransactionGet) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_get_transaction($1);',
      values: [
        transaction.hash
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public getTransactionsByContractID(transaction: ITransactionGet) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_get_transactions_by_contract_id($1, $2, $3);',
      values: [
        transaction.paymentID,
        transaction.statusID,
        transaction.typeID
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }
}