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
const HTTPRequestFactory_1 = require("../../utils/web/HTTPRequestFactory");
const default_config_1 = require("../../config/default.config");
class AuthenticationController {
    constructor() { }
    getPMAUserToken(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const httpRequest = new HTTPRequestFactory_1.HTTPRequestFactory()
                .create(`${default_config_1.DefaultConfig.settings.apiUrl}${default_config_1.DefaultConfig.settings.loginUrl}`, {
                'Content-Type': 'application/json'
            }, 'POST', { username, password });
            try {
                const httpResponse = yield httpRequest.getResponse();
                if (httpResponse.isSuccessfulRequest()) {
                    return { token: JSON.parse(httpResponse.body).token, merchant: JSON.parse(httpResponse.body).data };
                }
                else {
                    return null;
                }
            }
            catch (err) {
                return null;
            }
        });
    }
    getPMAApiKey(pmaUserToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const httpRequest = new HTTPRequestFactory_1.HTTPRequestFactory()
                .create(`${default_config_1.DefaultConfig.settings.apiUrl}${default_config_1.DefaultConfig.settings.generateApiKeyUrl}`, {
                'Content-Type': 'application/json',
                'pma-user-token': pmaUserToken
            }, 'GET');
            try {
                const httpResponse = yield httpRequest.getResponse();
                if (httpResponse.isSuccessfulRequest()) {
                    return JSON.parse(httpResponse.body).data;
                }
                else {
                    return null;
                }
            }
            catch (err) {
                return null;
            }
        });
    }
    getPMAAccessToken(pmaApiKey, pmaUserToken, requestQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const httpRequest = new HTTPRequestFactory_1.HTTPRequestFactory()
                .create(`${default_config_1.DefaultConfig.settings.apiUrl}${default_config_1.DefaultConfig.settings.generateAccessTokenUrl}`, {
                'Content-Type': 'application/json',
                'pma-api-key': pmaApiKey,
                'pma-user-token': pmaUserToken
            }, 'POST', requestQuery);
            try {
                const httpResponse = yield httpRequest.getResponse();
                if (httpResponse.isSuccessfulRequest()) {
                    return JSON.parse(httpResponse.body).data;
                }
                else {
                    return null;
                }
            }
            catch (err) {
                return null;
            }
        });
    }
    authenticate(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = yield this.getPMAUserToken(username, password);
                default_config_1.DefaultConfig.settings.pmaUserToken = token;
                if (!default_config_1.DefaultConfig.settings.pmaUserToken) {
                    return Promise.reject('Authentication Failed!');
                }
                if (!default_config_1.DefaultConfig.settings.pmaApiKey) {
                    default_config_1.DefaultConfig.settings.pmaApiKey = yield this.getPMAApiKey(default_config_1.DefaultConfig.settings.pmaUserToken);
                }
                return { pmaUserToken: default_config_1.DefaultConfig.settings.pmaUserToken, pmaApiKey: default_config_1.DefaultConfig.settings.pmaApiKey };
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
}
exports.AuthenticationController = AuthenticationController;
//# sourceMappingURL=AuthenticationController.js.map