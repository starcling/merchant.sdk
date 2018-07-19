import { Globals } from "../utils/globals";
import { MerchantSDKSettings } from "../models/MerchantSDK";

export class DefaultConfig {

    private static _settings: MerchantSDKSettings = {};

    public static set settings(_settings: MerchantSDKSettings) {
        Object.assign(this._settings, _settings);
    }

    public static get settings() {
        return {
            apiUrl: this._settings.apiUrl ? this._settings.apiUrl : Globals.GET_CORE_API_URL(),
            merchantApiUrl: this._settings.merchantApiUrl ? this._settings.merchantApiUrl : Globals.MERCHANT_API_URL(),
            generateQRApiUrl: this._settings.generateQRApiUrl ? this._settings.generateQRApiUrl : Globals.GENERATE_QR_API_URL(),
            paymentsURL: this._settings.paymentsURL ? this._settings.paymentsURL : Globals.PAYMENT_URL(),
            loginUrl: this._settings.loginUrl ? this._settings.loginUrl : Globals.LOGIN_URL(),
            generateApiKeyUrl: this._settings.generateApiKeyUrl ? this._settings.generateApiKeyUrl : Globals.GENERATE_API_KEY_URL(),
            generateAccessTokenUrl: this._settings.generateAccessTokenUrl ? this._settings.generateAccessTokenUrl : Globals.GENERATE_ACCESS_TOKEN_URL(),
        };
    }
}
