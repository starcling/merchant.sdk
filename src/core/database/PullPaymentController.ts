import { DefaultConfig } from '../../config/default.config';
import { IPullPaymentUpdate } from './models';

export class PullPaymentController {

  /**
  * @description Method for getting contract from to the database
  * @param {string} pullPaymentID: ID of the contract
  * @returns {boolean} success/fail response
  */
  public async getPullPayment(pullPaymentID: string) {
    return await DefaultConfig.settings.getPullPayment(pullPaymentID);
  }

  /**
   * @description Method for updating a contract in DB
   * @param {IPaymentUpdateDetails} pullPayment contract object
   * @returns {HTTPResponse} Returns success feedback
   */
  public async updatePullPayment(pullPayment: IPullPaymentUpdate) {
    return await DefaultConfig.settings.updatePullPayment(pullPayment);
  }
}
