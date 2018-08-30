import { DataService, ISqlQuery } from "./DataService";
import { IPaymentContractUpdate, ITransactionInsert, ITransactionUpdate, ITransactionGet } from "../../core/database/models";


export class TestDbConnector {
  public async updateContract(updateDetails: IPaymentContractUpdate) {
    const sqlQuery: ISqlQuery = {
      // tslint:disable-next-line:max-line-length
      text: 'SELECT * FROM fc_update_payment_contract($1, $2, $3, $4, $5, $6, $7, $8)',
      values: [
        updateDetails.id,
        updateDetails.hdWalletIndex,
        updateDetails.numberOfPayments,
        updateDetails.nextPaymentDate,
        updateDetails.lastPaymentDate,
        updateDetails.startTimestamp,
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

  public createPayment(insertDetails: any) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM fc_create_payment($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      values: [
        insertDetails.title,
        insertDetails.description,
        insertDetails.promo,
        insertDetails.amount,
        insertDetails.initialPaymentAmount,
        insertDetails.currency,
        insertDetails.numberOfPayments,
        insertDetails.frequency,
        insertDetails.typeID,
        insertDetails.networkID
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery, true);
  }

  public createContract(insertDetails: any) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM fc_create_payment_contract($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      values: [
        insertDetails.hdWalletIndex,
        insertDetails.paymentID,
        insertDetails.numberOfPayments,
        insertDetails.nextPaymentDate,
        insertDetails.lastPaymentDate,
        insertDetails.startTimestamp,
        insertDetails.customerAddress,
        insertDetails.merchantAddress,
        insertDetails.pullPaymentAddress,
        insertDetails.statusID,
        insertDetails.userID
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery, true);
  }

  public getContract(contractID: string) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_get_payment_contract($1);',
      values: [contractID]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }

  public createTransaction(transaction: ITransactionInsert) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_create_transaction($1, $2, $3, $4);',
      values: [
        transaction.hash,
        transaction.typeID,
        transaction.contractID,
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

  public getTransactionsByContractID(transaction: ITransactionGet) {
    const sqlQuery: ISqlQuery = {
      text: 'SELECT * FROM public.fc_get_transactions_by_contract_id($1, $2, $3);',
      values: [
        transaction.contractID,
        transaction.statusID,
        transaction.typeID
      ]
    };

    return new DataService().executeQueryAsPromise(sqlQuery);
  }
}