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
const default_config_1 = require("../../config/default.config");
const HTTPRequestFactory_1 = require("./HTTPRequestFactory");
const AuthenticationController_1 = require("../../core/authentication/AuthenticationController");
class HTTPHelper {
    getApiNameFromEndpoint(endpoint) {
        return endpoint.replace(/^\//g, '').split('/')[0];
    }
    getFullUrl(apiUrl, endpoint) {
        return `${apiUrl}/${endpoint.replace(/^\//g, '')}`;
    }
    postRequest(endpoint, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!default_config_1.DefaultConfig.settings.pmaApiKey) {
                return { error: 'No provided ApiKey!' };
            }
            if (!default_config_1.DefaultConfig.settings.pmaUserToken) {
                return { error: 'No provided User Token!' };
            }
            const apiName = this.getApiNameFromEndpoint(endpoint);
            const requestUrl = this.getFullUrl(default_config_1.DefaultConfig.settings.apiUrl, endpoint);
            const pmaAccessKey = yield new AuthenticationController_1.AuthenticationController()
                .getPMAAccessToken(default_config_1.DefaultConfig.settings.pmaApiKey, default_config_1.DefaultConfig.settings.pmaUserToken, {
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
                'pma-api-key': default_config_1.DefaultConfig.settings.pmaApiKey,
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
            if (!default_config_1.DefaultConfig.settings.pmaApiKey) {
                return { error: 'No provided ApiKey!' };
            }
            if (!default_config_1.DefaultConfig.settings.pmaUserToken) {
                return { error: 'No provided User Token!' };
            }
            const apiName = this.getApiNameFromEndpoint(endpoint);
            const requestUrl = this.getFullUrl(default_config_1.DefaultConfig.settings.apiUrl, endpoint);
            const pmaAccessKey = yield new AuthenticationController_1.AuthenticationController()
                .getPMAAccessToken(default_config_1.DefaultConfig.settings.pmaApiKey, default_config_1.DefaultConfig.settings.pmaUserToken, {
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
                'pma-api-key': default_config_1.DefaultConfig.settings.pmaApiKey,
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
    request(requestUrl, method, payload = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const httpRequest = new HTTPRequestFactory_1.HTTPRequestFactory()
                .create(requestUrl, {
                'Content-Type': 'application/json'
            }, method, payload);
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
}
exports.HTTPHelper = HTTPHelper;
//# sourceMappingURL=HTTPHelper.js.map