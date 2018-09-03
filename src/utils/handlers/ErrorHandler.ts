import { HTTPResponseCodes } from '../../utils/web/HTTPResponseCodes';
import { MerchantSDKBuild } from '../../models/MerchantSDK';
import { IPaymentContractView } from '../../core/database/models';

export class ErrorHandler extends Error {
    public message: string;
    public status: number;
    public error: any;

    constructor(_message: string, _error: any, _status?: number) {
        super(_error);
        this.message = _message;
        this.status = _status ? _status : HTTPResponseCodes.BAD_REQUEST();
        this.error = _error;
    }

    /**
     * @description Validates build parameters, throws error if there vere any errors found
     * @param {MerchantSDKBuild} buildParams build parameters for the sdk
     */
    public static validateBuildParams(buildParams: MerchantSDKBuild): any {
        const errors = {};

        if (!buildParams || Object.keys(buildParams).length === 0) {
            errors['merchant_sdk'] = 'No build parameters provided';
        }

        try {
            // new HTTPHelper().request(buildParams.merchantApiUrl + Globals.GET_PAYMENT_URL(), 'GET');
        } catch (err) {
            errors['merchantApiUrl'] = 'Incorrect merchantApiUrl. Cannot connect';
        }

        if (Object.keys(errors).length > 0) {
            throw new ErrorHandler('Incorrect build parameters.', errors);
        }
    }

    /**
     * @description Validates executePullPayment parameters, throws error if there vere any errors found
     * @param {IPaymentUpdateDetails} contract - contract to be executed
     */
    public static validatePullPaymentExecution(contract: IPaymentContractView): any {
        const errors = {};

        if (!contract.id) {
            errors['contract_id'] = 'No contract ID provided.';
        }

        if (!contract.customerAddress) {
            errors['customer_address'] = 'No customer address provided.';
        }
        
        if (!contract.merchantAddress) {
            errors['merchant_address'] = 'No merchant address provided.';
        }
        
        if (!contract.nextPaymentDate) {
            errors['next_payment_date'] = 'No next contract date provided.';
        }
        
        if (!contract.frequency) {
            errors['payment_frequency'] = 'No contract frequency provided.';
        }
        
        if (Object.keys(errors).length > 0) {
            throw new ErrorHandler('Incorrect pull contract execution parameters.', errors);
        }
    }
}