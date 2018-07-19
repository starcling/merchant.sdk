import { HTTPRequestFactory } from '../../utils/web/HTTPRequestFactory';
import { DefaultConfig } from '../../config/default.config';

export class AuthenticationController {
    public constructor() { }

    /**
    * @description return pma-user-token
    * @param {string} username: Username
    * @param {string} password: Password
	* @code <b>200</b>: Returns the pma-user-token.
    * @code <b>400</b>: If the login fails i.e. username/password is incorrect.
    * @code <b>404</b>: If the username specified does not exists.
	* @code <b>500</b>: When internal error while processing request.
	* @response token, merchant {token:String, merchant:String}
    */
    public async getPMAUserToken(username: string, password: string): Promise<any> {
        const httpRequest = new HTTPRequestFactory()
            .create(`${DefaultConfig.settings.apiUrl}${DefaultConfig.settings.loginUrl}`, {
                'Content-Type': 'application/json'
            }, 'POST', { username, password });
        try {
            const httpResponse = await httpRequest.getResponse();
            if (httpResponse.isSuccessfulRequest()) {
                return { token: JSON.parse(httpResponse.body).token, merchant: JSON.parse(httpResponse.body).data };
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    /**
    * @description return pma-api-key
    * @param {string} pmaUserToken: pma User Token
    * @code <b>200</b>: Returns the pma-api-key.
    * @code <b>404</b>: If invalid pma user token.
	* @code <b>500</b>: When internal error while processing request.
	* @response pma-api-key {String}
    */
    public async getPMAApiKey(pmaUserToken: string): Promise<any> {
        const httpRequest = new HTTPRequestFactory()
            .create(`${DefaultConfig.settings.apiUrl}${DefaultConfig.settings.generateApiKeyUrl}`, {
                'Content-Type': 'application/json',
                'pma-user-token': pmaUserToken
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

    /**
    * @description return pma-access-token
    * @param {string} pmaApiKey: api key
    * @param {string} pmaUserToken: user token
    * @param {object} requestQuery: request query
    * @code <b>200</b>: Returns the pma-access-token.
    * @code <b>404</b>: If invalid pma user token.
	* @code <b>500</b>: When internal error while processing request.
	* @response pma-api-key {String}
    */
    public async getPMAAccessToken(pmaApiKey: string, pmaUserToken: string, requestQuery: object): Promise<any> {
        const httpRequest = new HTTPRequestFactory()
            .create(`${DefaultConfig.settings.apiUrl}${DefaultConfig.settings.generateAccessTokenUrl}`, {
                'Content-Type': 'application/json',
                'pma-api-key': pmaApiKey,
                'pma-user-token': pmaUserToken
            }, 'POST', requestQuery);
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
        try {
            const { token } = await this.getPMAUserToken(username, password);
            DefaultConfig.settings.pmaUserToken = token;

            if (!DefaultConfig.settings.pmaUserToken) {
                return Promise.reject('Authentication Failed!');
            }
            if (!DefaultConfig.settings.pmaApiKey) {
                DefaultConfig.settings.pmaApiKey = await this.getPMAApiKey(DefaultConfig.settings.pmaUserToken);
            }
            return { pmaUserToken: DefaultConfig.settings.pmaUserToken, pmaApiKey: DefaultConfig.settings.pmaApiKey }
        } catch (err) {
            return Promise.reject(err);
        }
    }

}
