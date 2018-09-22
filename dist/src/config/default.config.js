"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../utils/globals");
class DefaultConfig {
    static set settings(buildParams) {
        Object.assign(this._settings, buildParams);
    }
    static get settings() {
        return {
            web3: this._settings.web3,
            merchantApiUrl: this._settings.merchantApiUrl,
            apiUrl: this._settings.apiUrl ? this._settings.apiUrl : globals_1.Globals.GET_DEFAULT_CORE_API_URL(),
            generateQRApiUrl: this._settings.generateQRApiUrl ? this._settings.generateQRApiUrl : globals_1.Globals.GET_QR_API_URL(),
            paymentTemplateURL: this._settings.paymentTemplateURL ? this._settings.paymentTemplateURL : globals_1.Globals.GET_PAYMENT_TEMPLATE_URL(),
            paymentURL: this._settings.paymentURL ? this._settings.paymentURL : globals_1.Globals.GET_PAYMENT_URL(),
            transactionURL: this._settings.transactionURL ? this._settings.transactionURL : globals_1.Globals.GET_TRANSACTION_URL(),
            getPayment: this._settings.getPayment,
            updatePayment: this._settings.updatePayment,
            getTransactions: this._settings.getTransactions,
            createTransaction: this._settings.createTransaction,
            updateTransaction: this._settings.updateTransaction,
            getEnums: this._settings.getEnums,
            loginUrl: this._settings.loginUrl ? this._settings.loginUrl : globals_1.Globals.GET_LOGIN_URL(),
            generateApiKeyUrl: this._settings.generateApiKeyUrl ? this._settings.generateApiKeyUrl : globals_1.Globals.GET_API_KEY_URL(),
            pgUser: this._settings.pgUser ? this._settings.pgUser : globals_1.Globals.GET_DEFAULT_PG_USER(),
            pgHost: this._settings.pgHost ? this._settings.pgHost : globals_1.Globals.GET_DEFAULT_PG_HOST(),
            pgPort: this._settings.pgPort ? this._settings.pgPort : globals_1.Globals.GET_DEFAULT_PG_PORT(),
            pgDatabase: this._settings.pgDatabase ? this._settings.pgDatabase : globals_1.Globals.GET_DEFAULT_PG_DATABASE(),
            pgPassword: this._settings.pgPassword ? this._settings.pgPassword : globals_1.Globals.GET_DEFAULT_PG_PASSWORD(),
            redisHost: this._settings.redisHost ? this._settings.redisHost : globals_1.Globals.GET_DEFAULT_REDIS_HOST(),
            redisPort: this._settings.redisPort ? this._settings.redisPort : globals_1.Globals.GET_DEFAULT_REDIS_PORT(),
            keyDbUser: this._settings.keyDbUser ? this._settings.keyDbUser : globals_1.Globals.GET_DEFAULT_MYSQL_USER(),
            keyDbHost: this._settings.keyDbHost ? this._settings.keyDbHost : globals_1.Globals.GET_DEFAULT_MYSQL_HOST(),
            keyDb: this._settings.keyDb ? this._settings.keyDb : globals_1.Globals.GET_DEFAULT_MYSQL_DATABASE(),
            keyDbPass: this._settings.keyDbPass ? this._settings.keyDbPass : globals_1.Globals.GET_DEFAULT_MYSQL_PASSWORD(),
            keyDbPort: this._settings.keyDbPort ? this._settings.keyDbPort : globals_1.Globals.GET_DEFAULT_MYSQL_PORT(),
            generateAccessTokenUrl: this._settings.generateAccessTokenUrl ? this._settings.generateAccessTokenUrl : globals_1.Globals.GET_ACCESS_TOKEN_URL(),
            network: this._settings.network ? this._settings.network : globals_1.Globals.GET_DEFAULT_NETWORK(),
            networkID: this.getNetworkID(this._settings.network ? this._settings.network : globals_1.Globals.GET_DEFAULT_NETWORK()),
            txStatusInterval: this._settings.txStatusInterval ? this._settings.txStatusInterval : globals_1.Globals.GET_TX_STATUS_INTERVAL(),
            queueLimit: this._settings.queueLimit ? this._settings.queueLimit : globals_1.Globals.GET_PULL_FAILED_QUEUE_LIMIT(),
            getPrivateKey: this._settings.getPrivateKey,
            bankAddress: this._settings.bankAddress,
        };
    }
    static getNetworkID(network) {
        switch (network) {
            case ('ropsten'):
                return 1;
            case ('mainnet'):
                return 3;
        }
    }
}
DefaultConfig._settings = {
    web3: null,
    merchantApiUrl: null,
    getPayment: null,
    updatePayment: null,
    getTransactions: null,
    createTransaction: null,
    updateTransaction: null,
    getEnums: null,
    getPrivateKey: null,
    bankAddress: null
};
exports.DefaultConfig = DefaultConfig;
//# sourceMappingURL=default.config.js.map