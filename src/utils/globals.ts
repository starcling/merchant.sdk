export class Globals {

    /**
     * @description Method for getting core backend api url 
     * @returns {string} url
     */
    public static GET_DEFAULT_CORE_API_URL(): string {
        return 'http://52.29.233.47:8081/api/v1/';
    }

    /**
     * @description Method for getting merchant backend api url 
     * @returns {string} url
     */
    public static GET_DEFAULT_MERCHANT_API_URL(): string {
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

    public static GET_DEFAULT_REDIS_HOST(): string {
        return 'localhost';
    }

    public static GET_DEFAULT_REDIS_PORT(): string {
        return '6379';
    }
    
    public static GET_DEFAULT_PG_HOST(): string {
        return 'localhost';
    }

    public static GET_DEFAULT_PG_USER(): string {
        return 'local_user';
    }

    public static GET_DEFAULT_PG_PASSWORD(): string {
        return 'local_pass';
    }

    public static GET_DEFAULT_PG_DATABASE(): string {
        return 'local_merchant_server';
    }

    public static GET_DEFAULT_PG_PORT(): string {
        return '5431';
    }

    /**
     * @description Method for getting network used
     * @returns {string} url
     */
    public static GET_DEFAULT_NETWORK(): string {
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
        return `${__dirname.substring(0, __dirname.length - 15)}/contracts/Contracts.sol`;
    }

    public static GET_TRANSACTION_STATUS_ENUM(): any {
        return TransactionStatusEnum;
    }

    public static GET_PAYMENT_STATUS_ENUM(): any {
        return PaymentStatusEnum;
    }

    public static GET_PAYMENT_TYPE_ENUM(): any {
        return PaymentTypeEnum;
    }

    public static GET_MERCHANT_PRIVATE_KEY(): string {
        return '4E9632F0D020E8BDD50A6055CC0904C5D866FC14081B48500352A914E02EF387'; // Acc 4
    }

    public static GET_PULL_PAYMENT_CONTRACT_NAME(): string {
        return 'MasterPullPayment';
    }

    public static GET_SCHEDULE_QUEUE_INTERVAL(): number {
        return 10;
    }

    public static GET_PULL_FAILED_QUEUE_LIMIT(): number {
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

enum PaymentTypeEnum {
    push = 0,
    singlePull = 1,
    recurringPull = 2,
    recurringWithInitial = 3
}