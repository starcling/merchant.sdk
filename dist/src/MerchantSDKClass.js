"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthenticationController_1 = require("./authentication/AuthenticationController");
const HTTPRequestFactory_1 = require("./utils/web/HTTPRequestFactory");
const default_config_1 = require("./config/default.config");
class MerchantSDK {
    constructor(param) {
        this.apiUrl = ((param && param.apiUrl) || default_config_1.DefaultConfig.settings.apiUrl).replace(/\/$/g, '');
        this.pmaApiKey = (param && param.apiKey) || null;
    }
    getApiNameFromEndpoint(endpoint) {
        return endpoint.replace(/^\//g, '').split('/')[0];
    }
    getFullUrl(apiUrl, endpoint) {
        return `${apiUrl}/${endpoint.replace(/^\//g, '')}`;
    }
    authenticate(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = yield new AuthenticationController_1.AuthenticationController(this.apiUrl)
                    .getPMAUserToken(username, password);
                this.pmaUserToken = token;
                if (!this.pmaUserToken) {
                    return Promise.reject('Authentication Failed!');
                }
                if (!this.pmaApiKey) {
                    this.pmaApiKey = yield new AuthenticationController_1.AuthenticationController(this.apiUrl).getPMAApiKey(this.pmaUserToken);
                }
                return { pmaUserToken: this.pmaUserToken, pmaApiKey: this.pmaApiKey };
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
    postRequest(endpoint, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.pmaApiKey) {
                return { error: 'No provided ApiKey!' };
            }
            if (!this.pmaUserToken) {
                return { error: 'No provided User Token!' };
            }
            const apiName = this.getApiNameFromEndpoint(endpoint);
            const requestUrl = this.getFullUrl(this.apiUrl, endpoint);
            const pmaAccessKey = yield new AuthenticationController_1.AuthenticationController(this.apiUrl)
                .getPMAAccessToken(this.pmaApiKey, this.pmaUserToken, {
                "apiName": apiName,
                "query": requestUrl,
                "body": payload
            });
            if (!pmaAccessKey) {
                return { error: 'Invalid ApiKey or UserToken provided!' };
            }
            const httpRequest = new HTTPRequestFactory_1.HTTPRequestFactory()
                .create(requestUrl, {
                'Content-Type': 'application/json',
                'pma-api-key': this.pmaApiKey,
                'pma-access-token': pmaAccessKey
            }, 'POST', payload);
            try {
                const httpResponse = yield httpRequest.getResponse();
                if (httpResponse.isSuccessfulRequest()) {
                    return JSON.parse(httpResponse.body);
                }
                else {
                    try {
                        return JSON.parse(httpResponse.body);
                    }
                    catch (e) {
                        return { error: httpResponse.body };
                    }
                }
            }
            catch (err) {
                return err;
            }
        });
    }
    getRequest(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.pmaApiKey) {
                return { error: 'No provided ApiKey!' };
            }
            if (!this.pmaUserToken) {
                return { error: 'No provided User Token!' };
            }
            const apiName = this.getApiNameFromEndpoint(endpoint);
            const requestUrl = this.getFullUrl(this.apiUrl, endpoint);
            const pmaAccessKey = yield new AuthenticationController_1.AuthenticationController(this.apiUrl)
                .getPMAAccessToken(this.pmaApiKey, this.pmaUserToken, {
                "apiName": apiName,
                "query": requestUrl,
                "body": {}
            });
            if (!pmaAccessKey) {
                return { error: 'Invalid ApiKey or UserToken provided!' };
            }
            const httpRequest = new HTTPRequestFactory_1.HTTPRequestFactory()
                .create(requestUrl, {
                'Content-Type': 'application/json',
                'pma-api-key': this.pmaApiKey,
                'pma-access-token': pmaAccessKey
            }, 'GET');
            try {
                const httpResponse = yield httpRequest.getResponse();
                if (httpResponse.isSuccessfulRequest()) {
                    return JSON.parse(httpResponse.body);
                }
                else {
                    try {
                        return JSON.parse(httpResponse.body);
                    }
                    catch (e) {
                        return { error: httpResponse.body };
                    }
                }
            }
            catch (err) {
                return err;
            }
        });
    }
    generateQRCodeURL(qrCodeDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            let urlParams = "";
            for (let key in qrCodeDetails) {
                if (urlParams != "") {
                    urlParams += "&";
                }
                urlParams += key + "=" + encodeURIComponent(qrCodeDetails[key]);
            }
            return `${this.getFullUrl(this.apiUrl, default_config_1.DefaultConfig.settings.generateQRApiUrl)}?${urlParams}`;
        });
    }
}
exports.MerchantSDK = MerchantSDK;
//# sourceMappingURL=MerchantSDKClass.js.map