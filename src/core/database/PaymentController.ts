import { DefaultConfig } from '../../config/default.config';
import { IPaymentUpdate } from './models';

export class PaymentController {

  /**
  * @description Method for getting contract from to the database
  * @param {string} contractID: ID of the contract
  * @returns {boolean} success/fail response
  */
  public async getPayment(contractID: string) {
    return await DefaultConfig.settings.getPayment(contractID);
  }

  /**
   * @description Method for updating a contract in DB
   * @param {IPaymentUpdateDetails} contract contract object
   * @returns {HTTPResponse} Returns success feedback
   */
  public async updatePayment(contract: IPaymentUpdate) {
    return await DefaultConfig.settings.updatePayment(contract);
  }
}
