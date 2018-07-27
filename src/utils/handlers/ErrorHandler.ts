import { HTTPResponseCodes } from "../../utils/web/HTTPResponseCodes";
import { MerchantSDKBuild } from "../../models/MerchantSDK";
// import { Globals } from "../../utils/globals";
// import { HTTPHelper } from "../../utils/web/HTTPHelper";

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
    public static validate(buildParams: MerchantSDKBuild): any {
        const errors = {};

        if (!buildParams || Object.keys(buildParams).length === 0) {
            errors['merchant_sdk'] = 'No build parameters provided';
        }

        try {
            // new HTTPHelper().request(buildParams.merchantApiUrl + Globals.GET_PAYMENT_URL(), 'GET');
        } catch (err) {
            errors['merchantApiUrl'] = 'Incorrect merchantApiUrl. Cannoct connect';
        }

        if (Object.keys(errors).length > 0) {
            throw new ErrorHandler('Incorrect build parameters.', errors);
        }

    }

}