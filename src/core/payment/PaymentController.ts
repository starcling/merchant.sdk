import { IPaymentInsertDetails, IPaymentUpdateDetails } from './models';
import { DefaultConfig } from '../../config/default.config';

export class PaymentController {

  /**
  * @description Method for adding new payment to the database
  * @param {IPaymentInsertDetails} payment: New payment details
  * @returns {boolean} success/fail response
  */
  public async createPayment(payment: IPaymentInsertDetails) {
    //TODO: create a new merchant Address for every payment
    return await DefaultConfig.settings.createPayment(payment);
  }

  /**
   * @description Get method for getting single payment from DB
   * @param {string} paymentID ID of the payment
   * @returns {HTTPResponse} Returns response with payment object in data
   */
  public async getPayment(paymentID: string) {
    return await DefaultConfig.settings.getPayment(paymentID);
  }

  /**
   * @description Get method for getting single payment from DB
   * @param {string} paymentID ID of the payment
   * @returns {HTTPResponse} Returns success/fail response
   */
  public async deletePayment(paymentID: string) {
    return await DefaultConfig.settings.deletePayment(paymentID);
  }

  /**
  * @description Get method for getting all payments from DB
  * @returns {HTTPResponse} Returns response with array of payments in data
  */
  public async getAllPayments() {
    return await DefaultConfig.settings.getAllPayments();
  }

  /**
   * @description Create method for updating a payment in DB
   * @param {IPaymentUpdateDetails} payment payment object
   * @returns {HTTPResponse} Returns success feedback
   */
  public async updatePayment(payment: IPaymentUpdateDetails) {
    return await DefaultConfig.settings.updatePayment(payment);
  }
}
