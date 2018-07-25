import { Globals } from "../utils/globals";

export class DefaultConfig {

    private static _settings: any = {};

    public static set settings(_settings: any) {
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
            pgUser: this._settings.pgUser ? this._settings.pgUser : Globals.GENERATE_PG_USER(),
            pgHost: this._settings.pgHost ? this._settings.pgHost : Globals.GENERATE_PG_HOST(),
            pgDatabase: this._settings.pgDatabase ? this._settings.pgDatabase : Globals.GENERATE_PG_DATABASE(),
            pgPassword: this._settings.pgPassword ? this._settings.pgPassword : Globals.GENERATE_PG_PASSWORD(),
            pgPort: this._settings.pgPort ? this._settings.pgPort : Globals.GENERATE_PG_PORT(),
            generateAccessTokenUrl: this._settings.generateAccessTokenUrl ? this._settings.generateAccessTokenUrl : Globals.GENERATE_ACCESS_TOKEN_URL(),
        };
    }
}
