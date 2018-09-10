"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPResponseCodes_1 = require("../../utils/web/HTTPResponseCodes");
class ErrorHandler extends Error {
    constructor(_message, _error, _status) {
        super(_error);
        this.message = _message;
        this.status = _status ? _status : HTTPResponseCodes_1.HTTPResponseCodes.BAD_REQUEST();
        this.error = _error;
    }
    static validateBuildParams(buildParams) {
        const errors = {};
        if (!buildParams || Object.keys(buildParams).length === 0) {
            errors['merchant_sdk'] = 'No build parameters provided';
        }
        try {
        }
        catch (err) {
            errors['merchantApiUrl'] = 'Incorrect merchantApiUrl. Cannot connect';
        }
        if (Object.keys(errors).length > 0) {
            throw new ErrorHandler('Incorrect build parameters.', errors);
        }
    }
    static validatePullPaymentExecution(contract) {
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
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map