"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HTTPResponseHandler {
    handleSuccess(message, data, status, token) {
        return {
            success: true,
            status: status ? status : 200,
            message: message,
            data: data,
            token: token
        };
    }
    handleFailed(message, error, status) {
        return {
            success: false,
            status: status ? status : 500,
            message: message,
            error: error
        };
    }
}
exports.HTTPResponseHandler = HTTPResponseHandler;
//# sourceMappingURL=HTTPResponseHandler.js.map