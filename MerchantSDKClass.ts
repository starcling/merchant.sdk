import { AuthenticationController } from './authentication/AuthenticationController';
import { HTTPRequestFactory } from '@utils/web/HTTPRequestFactory';
const defaultAPIUrl = 'http://localhost:8081/api/v1';
interface MerchantSDKParam {
    apiUrl?: string;
    apiKey?: string;
}

export class MerchantSDK {
    private apiUrl: string;
    private pmaUserToken: string;
    private pmaApiKey: string;
    public constructor(param: MerchantSDKParam) {
        this.apiUrl = (param && param.apiUrl) || defaultAPIUrl;
        this.pmaApiKey = (param && param.apiKey) || null;
    }

    /**
    * @description Authenticate to api with username and password
    * @param {string} username: Username
    * @param {string} password: Password
	* @code <b>200</b>: Returns the pma-user-token.
    * @code <b>400</b>: If the login fails i.e. username/password is incorrect.
    * @code <b>404</b>: If the username specified does not exists.
	* @code <b>500</b>: When internal error while processing request.
	* @response pma-user-token {String}
    */
    public async authenticate(username: string, password: string): Promise<any> {
        this.pmaUserToken = await new AuthenticationController(this.apiUrl).getPMAUserToken(username, password);
        if (!this.pmaApiKey) {
            this.pmaApiKey = await new AuthenticationController(this.apiUrl).getPMAApiKey(this.pmaUserToken);
        }
        return {pmaUserToken: this.pmaUserToken, pmaApiKey: this.pmaApiKey}
    }

    /**
    * @description post request to puma core api
    * @param {string} apiName: apiName
    * @param {string} endpoint: endpoint
    * @param {string} payload: payload
	* @code <b>200</b>: Returns response.
    * @code <b>400</b>: Validate failed.
    * @code <b>404</b>: Invalid or No access token.
	* @code <b>500</b>: When internal error while processing request.
	* @response pma-user-token {String}
    */
    public async postRequest(apiName: string, endpoint: string, payload: object): Promise<any> {
        const accessKey = await new AuthenticationController(this.apiUrl)
            .getPMAAccessToken(this.pmaApiKey, this.pmaUserToken, {
                "apiName": apiName,
                "query": `${this.apiUrl}${endpoint}`,
                "body": payload
            });
        const httpRequest = new HTTPRequestFactory()
            .create(`${this.apiUrl}${endpoint}`, {
                'Content-Type': 'application/json',
                'pma-api-key': this.pmaApiKey,
                'pma-access-token': accessKey
            }, 'POST', payload);
        try {
            const httpResponse = await httpRequest.getResponse();
            if (httpResponse.isSuccessfulRequest()) {
                return JSON.parse(httpResponse.body).data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    /**
    * @description get response to puma core api
    * @param {string} apiName: apiName
    * @param {string} endpoint: endpoint
	* @code <b>200</b>: Returns response.
    * @code <b>400</b>: Validate failed.
    * @code <b>404</b>: Invalid or No access token.
	* @code <b>500</b>: When internal error while processing request.
	* @response pma-user-token {String}
    */
    public async getRequest(apiName: string, endpoint: string): Promise<any> {
        const accessKey = await new AuthenticationController(this.apiUrl)
            .getPMAAccessToken(this.pmaApiKey, this.pmaUserToken, {
                "apiName": apiName,
                "query": `${this.apiUrl}${endpoint}`,
                "body": {}
            });
        const httpRequest = new HTTPRequestFactory()
            .create(`${this.apiUrl}${endpoint}`, {
                'Content-Type': 'application/json',
                'pma-api-key': this.pmaApiKey,
                'pma-access-token': accessKey
            }, 'GET');
        try {
            const httpResponse = await httpRequest.getResponse();
            if (httpResponse.isSuccessfulRequest()) {
                return JSON.parse(httpResponse.body).data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }
}
