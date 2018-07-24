import { Globals } from "../utils/globals";
import { MerchantSDKSettings } from "../models/MerchantSDK";

export class DefaultConfig {

    private static _settings: MerchantSDKSettings = {};

    public static set settings(buildParams: MerchantSDKSettings) {
        Object.assign(this._settings, buildParams);
    }

    public static get settings() {
        return {
            web3: this._settings.web3,
            apiUrl: this._settings.apiUrl ? this._settings.apiUrl : Globals.GET_CORE_API_URL(),
            merchantApiUrl: this._settings.merchantApiUrl ? this._settings.merchantApiUrl : Globals.GET_MERCHANT_API_URL(),
            generateQRApiUrl: this._settings.generateQRApiUrl ? this._settings.generateQRApiUrl : Globals.GET_GENERATE_QR_API_URL(),
            paymentsURL: this._settings.paymentsURL ? this._settings.paymentsURL : Globals.GET_PAYMENT_URL(),
            loginUrl: this._settings.loginUrl ? this._settings.loginUrl : Globals.GET_LOGIN_URL(),
            generateApiKeyUrl: this._settings.generateApiKeyUrl ? this._settings.generateApiKeyUrl : Globals.GET_GENERATE_API_KEY_URL(),
            generateAccessTokenUrl: this._settings.generateAccessTokenUrl ? this._settings.generateAccessTokenUrl : Globals.GET_GENERATE_ACCESS_TOKEN_URL(),
            network: this._settings.network ? this._settings.network : Globals.GET_NETWORK(),
            txStatusInterval: this._settings.txStatusInterval ? this._settings.txStatusInterval : Globals.GET_TX_STATUS_INTERVAL()
        };
    }
}
