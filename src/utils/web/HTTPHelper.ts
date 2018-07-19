import { DefaultConfig } from '../../config/default.config';
import { HTTPRequestFactory } from './HTTPRequestFactory';
import { AuthenticationController } from '../../core/authentication/AuthenticationController';

export class HTTPHelper {

    private getApiNameFromEndpoint(endpoint: string): string {
        return endpoint.replace(/^\//g, '').split('/')[0]
    }

    private getFullUrl(apiUrl: string, endpoint: string): string {
        return `${apiUrl}/${endpoint.replace(/^\//g, '')}`
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
        if (!DefaultConfig.settings.pmaApiKey) {
            return { error: 'No provided ApiKey!' }
        }
        if (!DefaultConfig.settings.pmaUserToken) {
            return { error: 'No provided User Token!' }
        }
        const apiName = this.getApiNameFromEndpoint(endpoint);
        const requestUrl = this.getFullUrl(DefaultConfig.settings.apiUrl, endpoint);
        const pmaAccessKey = await new AuthenticationController()
            .getPMAAccessToken(DefaultConfig.settings.pmaApiKey, DefaultConfig.settings.pmaUserToken, {
                "apiName": apiName,
                "query": requestUrl,
                "body": payload
            });
        if (!pmaAccessKey) {
            return { error: 'Invalid ApiKey or UserToken provided!' }
        }
        const httpRequest = new HTTPRequestFactory()
            .create(requestUrl, {
                'Content-Type': 'application/json',
                'pma-api-key': DefaultConfig.settings.pmaApiKey,
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
                    return { error: httpResponse.body };
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
        if (!DefaultConfig.settings.pmaApiKey) {
            return { error: 'No provided ApiKey!' }
        }
        if (!DefaultConfig.settings.pmaUserToken) {
            return { error: 'No provided User Token!' }
        }
        const apiName = this.getApiNameFromEndpoint(endpoint);
        const requestUrl = this.getFullUrl(DefaultConfig.settings.apiUrl, endpoint);
        const pmaAccessKey = await new AuthenticationController()
            .getPMAAccessToken(DefaultConfig.settings.pmaApiKey, DefaultConfig.settings.pmaUserToken, {
                "apiName": apiName,
                "query": requestUrl,
                "body": {}
            });
        if (!pmaAccessKey) {
            return { error: 'Invalid ApiKey or UserToken provided!' }
        }
        const httpRequest = new HTTPRequestFactory()
            .create(requestUrl, {
                'Content-Type': 'application/json',
                'pma-api-key': DefaultConfig.settings.pmaApiKey,
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
                    return { error: httpResponse.body };
                }
            }
        } catch (err) {
            return err;
        }
    }
}