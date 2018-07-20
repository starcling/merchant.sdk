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
    public static GET_MERCHANT_API_URL(): string {
        return 'http://merchant:3000/api/v1';
    }

    /**
     * @description Method for getting generate qr api url 
     * @returns {string} url
     */
    public static GET_GENERATE_QR_API_URL(): string {
        return '/qr/url/';
    }

    /**
     * @description Method for getting payment api url 
     * @returns {string} url
     */
    public static GET_PAYMENT_URL(): string {
        return '/payments';
    }

    /**
     * @description Method for getting login api url 
     * @returns {string} url
     */
    public static GET_LOGIN_URL(): string {
        return '/login';
    }

    /**
     * @description Method for getting generate api key url 
     * @returns {string} url
     */
    public static GET_GENERATE_API_KEY_URL(): string {
        return '/auth/generate-api-key';
    }

    /**
     * @description Method for getting access token url 
     * @returns {string} url
     */
    public static GET_GENERATE_ACCESS_TOKEN_URL(): string {
        return '/auth/token/generate';
    }

    /**
     * @description Method for getting network used
     * @returns {string} url
     */
    public static GET_NETWORK(): string {
        return 'ropsten';
    }

    /**
     * @description Method for getting tx status interval
     * @returns {number} interval
     */
    public static GET_TX_STATUS_INTERVAL(): number {
        return 5000;
    }

    public static GET_LOCAL_ETHNODE_URL(): string {
        return 'http://127.0.0.1:7545';
    }

    public static GET_TRANSACTION_STATUS_ENUM(): any {
        return TransactionStatusEnum;
    }
}

enum TransactionStatusEnum {
    failed = 0,
    initial = 1,
    scaned = 2,
    pending = 3,
    success = 4
}