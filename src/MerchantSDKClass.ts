import { AuthenticationController } from './core/authentication/AuthenticationController';
import { DefaultConfig } from './config/default.config';
import { QrCode } from './core/qr/QrCode';
import { MerchantSDKSettings } from './models/MerchantSDK';
import { HTTPHelper } from './utils/web/HTTPHelper';

export class MerchantSDK {
    private http: HTTPHelper;
    private authenticationController: AuthenticationController;

    public constructor(param: MerchantSDKSettings) {
        DefaultConfig.settings = { apiUrl: ((param && param.apiUrl) || DefaultConfig.settings.apiUrl).replace(/\/$/g, '') };
        DefaultConfig.settings = { pmaApiKey: (param && param.apiKey) || null};

        this.http = new HTTPHelper();
        this.authenticationController = new AuthenticationController();
    }

    /**
     * @description Method used to build the SDK with with new parameters
     * @param {MerchantSDKSettings} param Parameters to be build
     * @returns {MerchantSDK} MerchantSDK object - this
     */
    public build(param: MerchantSDKSettings): MerchantSDK {
        DefaultConfig.settings = { apiUrl: ((param && param.apiUrl) || DefaultConfig.settings.apiUrl).replace(/\/$/g, '') };
        DefaultConfig.settings = { pmaApiKey: (param && param.apiKey) || null};

        return this;
    }

    /**
    * @description Authenticate to api with username and password
    * @param {string} username: Username
    * @param {string} password: Password
	* @code <b>200</b>: Returns the pma-user-token.
    * @code <b>400</b>: If the login fails i.e. username/password is incorrect.
    * @code <b>404</b>: If the username specified does not exists.
	* @code <b>500</b>: When internal error while processing request.
	* @response pma-user-token, pma-api-key {Object}
    */
    public async authenticate(username: string, password: string): Promise<any> {
        this.authenticationController.authenticate(username, password);
    }

    /**
    * @description post request to puma core api
    * @param {string} endpoint: endpoint
    * @param {string} payload: payload
	* @code <b>200</b>: Returns response.
    * @code <b>401</b>: Invalid or No access token.
	* @code <b>500</b>: When internal error while processing request.
	* @response {any}
    */
    public async postRequest(endpoint: string, payload: object): Promise<any> {
        return this.http.postRequest(endpoint, payload);
    }

    /**
    * @description get response to puma core api
    * @param {string} endpoint: endpoint
	* @code <b>200</b>: Returns response.
    * @code <b>401</b>: Invalid or No access token.
	* @code <b>500</b>: When internal error while processing request.
	* @response {any}
    */
    public async getRequest(endpoint: string): Promise<any> {
        return this.http.getRequest(endpoint);
    }


    /**
   * @description generate QR Code object
   * @param {string} paymentID: ID of the specific payment
   * @returns {object} QR code object
   */
    public generateQRCode(paymentID: string) {
        return { url: new QrCode().generate(paymentID) };
    }
}
