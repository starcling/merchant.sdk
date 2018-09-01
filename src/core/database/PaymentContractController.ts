import { DefaultConfig } from '../../config/default.config';
import { IPaymentContractUpdate } from './models';

export class PaymentContractController {

  /**
  * @description Method for getting contract from to the database
  * @param {string} contractID: ID of the contract
  * @returns {boolean} success/fail response
  */
  public async getContract(contractID: string) {
    return await DefaultConfig.settings.getContract(contractID);
  }

  /**
   * @description Method for updating a contract in DB
   * @param {IPaymentUpdateDetails} contract contract object
   * @returns {HTTPResponse} Returns success feedback
   */
  public async updateContract(contract: IPaymentContractUpdate) {
    return await DefaultConfig.settings.updateContract(contract);
  }
}
