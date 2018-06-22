import { HTTPRequestFactory } from '../utils/web/HTTPRequestFactory';

export class AuthenticationController {
    public constructor(private apiUrl: string) {
    }
    /**
    * @description return pma-user-token
    * @param {string} username: Username
    * @param {string} password: Password
	* @code <b>200</b>: Returns the pma-user-token.
    * @code <b>400</b>: If the login fails i.e. username/password is incorrect.
    * @code <b>404</b>: If the username specified does not exists.
	* @code <b>500</b>: When internal error while processing request.
	* @response pma-user-token {String}
    */
    public async getPMAUserToken(username: string, password: string): Promise<any> {
        const httpRequest = new HTTPRequestFactory()
            .create(`${this.apiUrl}/login`, {
                'Content-Type': 'application/json'
            }, 'POST', {username, password});
        try {
            const httpResponse = await httpRequest.getResponse();
            if (httpResponse.isSuccessfulRequest()) {
                return JSON.parse(httpResponse.body);
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }
}
