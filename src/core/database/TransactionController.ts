import { ITransactionInsert, ITransactionUpdate, ITransactionGet } from './models';
import { DefaultConfig } from '../../config/default.config';

export class TransactionController {

  /**
  * @description Method for adding new transaction to the database
  * @param {ITransactionInsert} transaction: New transaction details
  * @returns {boolean} success/fail response
  */
  public async createTransaction(transaction: ITransactionInsert) {
    //TODO: create a new merchant Address for every transaction
    return await DefaultConfig.settings.createTransaction(transaction);
  }

  /**
   * @description Method for updating a transaction in DB
   * @param {ITransactionGet} transaction transaction object
   * @returns {HTTPResponse} Returns success feedback
   */
  public async getTransactions(transaction: ITransactionGet) {
    return await DefaultConfig.settings.getTransactions(transaction);
  }

  /**
   * @description Method for updating a transaction in DB
   * @param {ITransactionUpdate} transaction transaction object
   * @returns {HTTPResponse} Returns success feedback
   */
  public async updateTransaction(transaction: ITransactionUpdate) {
    return await DefaultConfig.settings.updateTransaction(transaction);
  }
}
