import { PaymentDbConnector } from '../../connector/dbConnector/paymentsDBconnector';
import { IPaymentInsertDetails, IPaymentUpdateDetails } from './models';

export class PaymentController {
  private paymentDbConnector = new PaymentDbConnector();
  
  /**
  * @description Method for adding new payment to the database
  * @param {IPaymentInsertDetails} payment: New payment details
  * @returns {boolean} success/fail response
  */
  public async createPayment(payment: IPaymentInsertDetails) {
    return await this.paymentDbConnector.createPayment(payment);
  }

  /**
   * @description Get method for getting single payment from DB
   * @param {string} paymentID ID of the payment
   * @returns {HTTPResponse} Returns response with payment object in data
   */
  public async getPayment(paymentID: string) {
    return await this.paymentDbConnector.getPayment(paymentID);
  }

  /**
   * @description Get method for getting single payment from DB
   * @param {string} paymentID ID of the payment
   * @returns {HTTPResponse} Returns success/fail response
   */
  public async deletePayment(paymentID: string) {
    return await this.paymentDbConnector.deletePayment(paymentID);
  }
  
  /**
  * @description Get method for getting all payments from DB
  * @returns {HTTPResponse} Returns response with array of payments in data
  */
  public async getAllPayments() {
    return await this.paymentDbConnector.getAllPayments();
  }

  /**
   * @description Create method for updating a payment in DB
   * @param {IPaymentUpdateDetails} payment payment object
   * @returns {HTTPResponse} Returns success feedback
   */
  public async updatePayment(payment: IPaymentUpdateDetails) {
    return await this.paymentDbConnector.updatePayment(payment);
  }


}
