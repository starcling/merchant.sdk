import { Globals } from '../utils/globals';
import { MerchantSDKSettings } from '../models/MerchantSDK';

export class DefaultConfig {

    private static _settings: MerchantSDKSettings = {
        web3: null, merchantApiUrl: null, createPayment: null, deletePayment: null,
        getAllPayments: null, getPayment: null, updatePayment: null, getPrivateKey: null
    };

    public static set settings(buildParams: MerchantSDKSettings) {
        Object.assign(this._settings, buildParams);
    }

    public static get settings() {
        return {
            web3: this._settings.web3,
            merchantApiUrl: this._settings.merchantApiUrl,
            apiUrl: this._settings.apiUrl ? this._settings.apiUrl : Globals.GET_DEFAULT_CORE_API_URL(),
            generateQRApiUrl: this._settings.generateQRApiUrl ? this._settings.generateQRApiUrl : Globals.GET_QR_API_URL(),
            paymentsURL: this._settings.paymentsURL ? this._settings.paymentsURL : Globals.GET_PAYMENT_URL(),
            loginUrl: this._settings.loginUrl ? this._settings.loginUrl : Globals.GET_LOGIN_URL(),
            generateApiKeyUrl: this._settings.generateApiKeyUrl ? this._settings.generateApiKeyUrl : Globals.GET_API_KEY_URL(),
            pgUser: this._settings.pgUser ? this._settings.pgUser : Globals.GET_DEFAULT_PG_USER(),
            pgHost: this._settings.pgHost ? this._settings.pgHost : Globals.GET_DEFAULT_PG_HOST(),
            pgPort: this._settings.pgPort ? this._settings.pgPort : Globals.GET_DEFAULT_PG_PORT(),
            pgDatabase: this._settings.pgDatabase ? this._settings.pgDatabase : Globals.GET_DEFAULT_PG_DATABASE(),
            pgPassword: this._settings.pgPassword ? this._settings.pgPassword : Globals.GET_DEFAULT_PG_PASSWORD(),
            redisHost: this._settings.redisHost ? this._settings.redisHost : Globals.GET_DEFAULT_REDIS_HOST(),
            redisPort: this._settings.redisPort ? this._settings.redisPort : Globals.GET_DEFAULT_REDIS_PORT(),
            keyDbUser: this._settings.keyDbUser ? this._settings.keyDbUser : Globals.GET_DEFAULT_MYSQL_USER(),
            keyDbHost: this._settings.keyDbHost ? this._settings.keyDbHost : Globals.GET_DEFAULT_MYSQL_HOST(),
            keyDb: this._settings.keyDb ? this._settings.keyDb : Globals.GET_DEFAULT_MYSQL_DATABASE(),
            keyDbPass: this._settings.keyDbPass ? this._settings.keyDbPass : Globals.GET_DEFAULT_MYSQL_PASSWORD(),
            keyDbPort: this._settings.keyDbPort ? this._settings.keyDbPort : Globals.GET_DEFAULT_MYSQL_PORT(),
            generateAccessTokenUrl: this._settings.generateAccessTokenUrl ? this._settings.generateAccessTokenUrl : Globals.GET_ACCESS_TOKEN_URL(),
            network: this._settings.network ? this._settings.network : Globals.GET_DEFAULT_NETWORK(),
            txStatusInterval: this._settings.txStatusInterval ? this._settings.txStatusInterval : Globals.GET_TX_STATUS_INTERVAL(),
            queueLimit: this._settings.queueLimit ? this._settings.queueLimit : Globals.GET_PULL_FAILED_QUEUE_LIMIT(),
            createPayment: this._settings.createPayment,
            deletePayment: this._settings.deletePayment,
            getAllPayments: this._settings.getAllPayments,
            getPayment: this._settings.getPayment,
            updatePayment: this._settings.updatePayment,
            getPrivateKey: this._settings.getPrivateKey
        };
    }
}