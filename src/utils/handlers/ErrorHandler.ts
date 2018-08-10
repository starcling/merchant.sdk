import { HTTPResponseCodes } from '../../utils/web/HTTPResponseCodes';
import { MerchantSDKBuild } from '../../models/MerchantSDK';
import { IPaymentUpdateDetails } from '../../core/payment/models';

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
     * @param {IPaymentUpdateDetails} payment - payment to be executed
     */
    public static validatePullPaymentExecution(payment: IPaymentUpdateDetails): any {
        const errors = {};

        if (!payment.id) {
            errors['payment_id'] = 'No payment ID provided.';
        }

        if (!payment.pullPaymentAccountAddress) {
            errors['pull_payment_address'] = 'No pull payment address provided.';
        }

        if (!payment.merchantAddress) {
            errors['merchant_address'] = 'No merchant address provided.';
        }

        if (!payment.nextPaymentDate) {
            errors['next_payment_date'] = 'No next payment date provided.';
        }

        if (!payment.frequency) {
            errors['payment_frequency'] = 'No payment frequency provided.';
        }

        if (Object.keys(errors).length > 0) {
            throw new ErrorHandler('Incorrect pull payment execution parameters.', errors);
        }
    }
}