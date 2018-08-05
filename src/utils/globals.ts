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
    public static GET_QR_API_URL(): string {
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
    public static GET_API_KEY_URL(): string {
        return '/auth/generate-api-key';
    }

    /**
     * @description Method for getting access token url 
     * @returns {string} url
     */
    public static GET_ACCESS_TOKEN_URL(): string {
        return '/auth/token/generate';
    }

    /**
     * @description Method for getting time for which it is allowed the start timestamp of the scheduler 
     * of the recurring payment to be in the past
     * @returns {number} time in seconds
     */
    public static GET_START_SCHEDULER_TIME_WINDOW(): number {
        return 300;
    }
    
    public static GET_PG_HOST(): string {
        return 'localhost';
    }

    public static GET_PG_USER(): string {
        return 'local_user';
    }

    public static GET_PG_PASSWORD(): string {
        return 'local_pass';
    }

    public static GET_PG_DATABASE(): string {
        return 'local_merchant_server';
    }

    public static GET_PG_PORT(): string {
        return '5431';
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
        return 2000;
    }

    public static GET_SOLIDITY_FILE(): string {
        return `${__dirname.substring(0, __dirname.length - 15)}/src/core/blockchain/smartContracts/unified.sol`;
    }

    public static GET_LOCAL_ETHNODE_URL(): string {
        return 'http://127.0.0.1:7545';
    }

    public static GET_SPECIFIC_INFURA_URL(): string {
        return 'https://ropsten.infura.io/ZDNEJN22wNXziclTLijw';
    }

    public static GET_TRANSACTION_STATUS_ENUM(): any {
        return TransactionStatusEnum;
    }

    public static GET_PAYMENT_STATUS_ENUM(): any {
        return PaymentStatusEnum;
    }

    public static GET_MERCHANT_PRIVATE_KEY(): string {
        return '3f455a331a4fdd97f14fe8025cdb6722ac7dffea2b98c5bca5087e26d7ab862c';
    }

    public static GET_SCHEDULE_QUEUE_INTERVAL(): number {
        return 100;
    }
}

enum TransactionStatusEnum {
    failed = 0,
    initial = 1,
    scaned = 2,
    pending = 3,
    success = 4
}

enum PaymentStatusEnum {
    canceled = 0,
    initial = 1,
    running = 2,
    stopped = 3,
    done = 4,
}