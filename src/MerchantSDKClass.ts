import { AuthenticationController } from './authentication/AuthenticationController';
import { HTTPRequestFactory } from '@utils/web/HTTPRequestFactory';
import { DefaultConfig } from '@config/default.config';

interface MerchantSDKParam {
    apiUrl?: string;
    apiKey?: string;
}

export class MerchantSDK {
    private apiUrl: string;
    private pmaUserToken: string;
    private pmaApiKey: string;
    public constructor(param: MerchantSDKParam) {
        this.apiUrl = ((param && param.apiUrl) || DefaultConfig.settings.apiUrl).replace(/\/$/g, '');
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
	* @response pma-user-token, pma-api-key {Object}
    */
    public async authenticate(username: string, password: string): Promise<any> {
        this.pmaUserToken = await new AuthenticationController(this.apiUrl).getPMAUserToken(username, password);
        if (!this.pmaUserToken) {
            return Promise.reject('Authentication Failed!');
        }
        if (!this.pmaApiKey) {
            this.pmaApiKey = await new AuthenticationController(this.apiUrl).getPMAApiKey(this.pmaUserToken);
        }
        return {pmaUserToken: this.pmaUserToken, pmaApiKey: this.pmaApiKey}
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
        if (!this.pmaApiKey) {
            return {error: 'No provided ApiKey!'}
        }
        if (!this.pmaUserToken) {
            return {error: 'No provided User Token!'}
        }
        const apiName = await this.getApiNameFromEndpoint(endpoint);
        const requestUrl = await this.getFullUrl(this.apiUrl, endpoint);
        const pmaAccessKey = await new AuthenticationController(this.apiUrl)
            .getPMAAccessToken(this.pmaApiKey, this.pmaUserToken, {
                "apiName": apiName,
                "query": requestUrl,
                "body": payload
            });
        if (!pmaAccessKey) {
            return {error: 'Invalid ApiKey or UserToken provided!'}
        }
        const httpRequest = new HTTPRequestFactory()
            .create(requestUrl, {
                'Content-Type': 'application/json',
                'pma-api-key': this.pmaApiKey,
                'pma-access-token': pmaAccessKey
            }, 'POST', payload);
        try {
            const httpResponse = await httpRequest.getResponse();
            if (httpResponse.isSuccessfulRequest()) {
                return JSON.parse(httpResponse.body);
            } else {
                try {
                    return JSON.parse(httpResponse.body)
                } catch (e) {
                    return {error: httpResponse.body};
                }
            }
        } catch (err) {
            return err;
        }
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
        if (!this.pmaApiKey) {
            return {error: 'No provided ApiKey!'}
        }
        if (!this.pmaUserToken) {
            return {error: 'No provided User Token!'}
        }
        const apiName = await this.getApiNameFromEndpoint(endpoint);
        const requestUrl = await this.getFullUrl(this.apiUrl, endpoint);
        const pmaAccessKey = await new AuthenticationController(this.apiUrl)
            .getPMAAccessToken(this.pmaApiKey, this.pmaUserToken, {
                "apiName": apiName,
                "query": requestUrl,
                "body": {}
            });
        if (!pmaAccessKey) {
            return {error: 'Invalid ApiKey or UserToken provided!'}
        }
        const httpRequest = new HTTPRequestFactory()
            .create(requestUrl, {
                'Content-Type': 'application/json',
                'pma-api-key': this.pmaApiKey,
                'pma-access-token': pmaAccessKey
            }, 'GET');
        try {
            const httpResponse = await httpRequest.getResponse();
            if (httpResponse.isSuccessfulRequest()) {
                return JSON.parse(httpResponse.body);
            } else {
                try {
                    return JSON.parse(httpResponse.body)
                } catch (e) {
                    return {error: httpResponse.body};
                }
            }
        } catch (err) {
            return err;
        }
    }

    private async getApiNameFromEndpoint(endpoint: string): Promise<any> {
        return endpoint.replace(/^\//g, '').split('/')[0]
    }

    private async getFullUrl(apiUrl: string, endpoint: string): Promise<any> {
        return `${apiUrl.replace(/\/$/g, '')}/${endpoint.replace(/^\//g, '')}`
    }
}
