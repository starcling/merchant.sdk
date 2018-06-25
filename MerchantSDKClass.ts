import { AuthenticationController } from './authentication';
import { IResponseMessage } from './utils/web/HTTPResponseHandler';

const defaultAPIUrl = 'http://localhost:8081/api/v1';
interface MerchantSDKParam {
    apiUrl: string;
}

export class MerchantSDK {
    private apiUrl: string;
    private pmaUserToken: string;
    private pmaApiKey: string;
    public constructor(param: MerchantSDKParam) {
        this.apiUrl = param.apiUrl || defaultAPIUrl;
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
        return this.pmaUserToken;
    }
}
