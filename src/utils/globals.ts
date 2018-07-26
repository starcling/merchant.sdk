export class Globals {

    /**
     * @description Method for getting core backend api url 
     * @returns {string} url
     */
    public static GET_CORE_API_URL(): string {
        return 'http://52.29.233.47:8081/api/v1/';
    }

    /**
     * @description Method for getting merchant backend api url 
     * @returns {string} url
     */
    public static MERCHANT_API_URL(): string {
        return 'http://merchant:3000/api/v1';
    }

    /**
     * @description Method for getting generate qr api url 
     * @returns {string} url
     */
    public static GENERATE_QR_API_URL(): string {
        return '/qr/url/';
    }

    /**
     * @description Method for getting payment api url 
     * @returns {string} url
     */
    public static PAYMENT_URL(): string {
        return '/payments';
    }

    /**
     * @description Method for getting login api url 
     * @returns {string} url
     */
    public static LOGIN_URL(): string {
        return '/login';
    }

    /**
     * @description Method for getting generate api key url 
     * @returns {string} url
     */
    public static GENERATE_API_KEY_URL(): string {
        return '/auth/generate-api-key';
    }

    /**
     * @description Method for getting access token url 
     * @returns {string} url
     */
    public static GENERATE_ACCESS_TOKEN_URL(): string {
        return '/auth/token/generate';
    }
    
    public static GENERATE_PG_HOST(): string {
        return 'localhost';
    }

    public static GENERATE_PG_USER(): string {
        return 'local_user';
    }

    public static GENERATE_PG_PASSWORD(): string {
        return 'local_pass';
    }

    public static GENERATE_PG_DATABASE(): string {
        return 'local_merchant_server';
    }

    public static GENERATE_PG_PORT(): string {
        return '5431';
    }
}