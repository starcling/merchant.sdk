"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HTTPResponse {
    constructor(body, headers, statusCode) {
        this._statusCode = statusCode;
        this._body = body;
        this._headers = headers;
    }
    get statusCode() {
        return this._statusCode;
    }
    get body() {
        return this._body;
    }
    get headers() {
        return this._headers;
    }
    isSuccessfulRequest() {
        return this._statusCode >= 200 && this._statusCode < 300;
    }
    isSuccessfulEtherscanRequest() {
        return this.isSuccessfulRequest() && JSON.parse(this._body).status !== 0 && JSON.parse(this._body).message !== 'NOTOK';
    }
}
exports.HTTPResponse = HTTPResponse;
//# sourceMappingURL=HTTPResponse.js.map