import { DefaultConfig } from "../config/default.config";

export class Globals {
    static GET_PAYMENT_STATUS_ENUM(): any {
        throw new Error("Method not implemented.");
    }

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
    public static GET_PULL_PAYMENT_MODEL_URL(): string {
        return '/pull-payment-models';
    }

    /**
     * @description Method for getting payment api url 
     * @returns {string} url
     */
    public static GET_PAYMENT_URL(): string {
        return '/pull-payments';
    }

    /**
     * @description Method for getting payment api url 
     * @returns {string} url
     */
    public static GET_TRANSACTION_URL(): string {
        return '/transactions';
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

    /**
     * @description Method for getting decimals for parsing units
     * @returns {number} time in seconds
     */
    public static GET_DEFAULT_VALUE_DECIMALS(): number {
        return 13;
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

    public static GET_DEFAULT_MYSQL_HOST(): string {
        return 'localhost';
    }

    public static GET_DEFAULT_MYSQL_USER(): string {
        return 'db_service';
    }

    public static GET_DEFAULT_MYSQL_PASSWORD(): string {
        return 'db_pass';
    }

    public static GET_DEFAULT_MYSQL_DATABASE(): string {
        return 'keys';
    }

    public static GET_DEFAULT_MYSQL_PORT(): string {
        return '3305';
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

    public static GET_SMART_CONTRACT_ADDRESSES(networkID: number): ISmartContracts {
        switch (networkID) {
            // TODO: Update once deploy to ETH MAINNET
            case (1):
                return {
                    token: '0x11c1e537801cc1c37ad6e1b7d0bdc0e00fcc6dc1',
                    masterPullPayment: '0x7990fc1d2527d00c22db4c2b72e3e74f80b97d9c'
                };
            case (3):
                return {
                    token: '0x11c1e537801cc1c37ad6e1b7d0bdc0e00fcc6dc1',
                    masterPullPayment: '0x7990fc1d2527d00c22db4c2b72e3e74f80b97d9c'
                };
        }
    }

    public static GET_PULL_PAYMENT_TOPICS(networkID: number): IPullPaymentContract {
        switch (networkID) {
            // TODO: Update once deploy to ETH MAINNET
            case (1):
                return {
                    execute: ['0x13492443fb72a9a7d56cc1aa2e262bcf2442d4b084def464b7934b3485114e59']
                };
            case (3):
                return {
                    execute: ['0x13492443fb72a9a7d56cc1aa2e262bcf2442d4b084def464b7934b3485114e59']
                };
        }

    }

    public static GET_PMA_ESTIMATE_ADDRESS(networkID: number): string {
        switch (networkID) {
            // TODO: Update once deploy to ETH MAINNET
            case (1):
                return '0xc5b42db793CB60B4fF9e4c1bD0c2c633Af90aCFb';
            case (3):
                return '0xc5b42db793CB60B4fF9e4c1bD0c2c633Af90aCFb';
        }

    }

    public static GET_SOLIDITY_FILE(): string {
        return `${__dirname.substring(0, __dirname.length - 15)}/contracts/contracts.sol`;
    }

    public static GET_CRYPTOCOMPARE_URL(): string {
        return 'https://min-api.cryptocompare.com/';
    }

    public static GET_TRANSACTION_STATUS_ENUM(): any {
        return TransactionStatusEnum;
    }

    public static GET_PULL_PAYMENT_STATUS_ENUM(): any {
        return ContractStatusEnum;
    }

    public static GET_PAYMENT_TYPE_ENUM(): any {
        return PaymentTypeEnum;
    }

    public static GET_TRANSACTION_TYPE_ENUM(): any {
        return TransactionTypeEnum;
    }

    public static GET_TRANSACTION_STATUS_ENUM_NAMES(): any {
        return [
            '',
            'pending',
            'failed',
            'success'
        ];
    }

    public static GET_PULL_PAYMENT_STATUS_ENUM_NAMES(): any {
        return [
            '',
            'initial',
            'running',
            'stopped',
            'cancelled',
            'done',
        ];
    }

    public static GET_PULL_PAYMENT_TYPE_ENUM_NAMES(): any {
        return [
            '',
            'push',
            'singlePull',
            'recurringPull',
            'recurringWithInitial'
        ];
    }

    public static GET_TRANSACTION_TYPE_ENUM_NAMES(): any {
        return [
            '',
            'register',
            'initial',
            'execute',
            'cancel'
        ];
    }

    public static GET_MAX_GAS_FEE(): number {
        return 90000;
    }

    public static GET_TOKEN_CONTRACT_NAME(): string {
        return 'PumaPayToken';
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

    public static async REFRESH_ENUMS(): Promise<any> {
        return DefaultConfig.settings.getEnums();
    }

}

enum TransactionStatusEnum {
    pending = 1,
    failed = 2,
    success = 3
}

enum TransactionTypeEnum {
    register = 1,
    initial = 2,
    execute = 3,
    cancel = 4
}

enum ContractStatusEnum {
    initial = 1,
    running = 2,
    stopped = 3,
    cancelled = 4,
    done = 4,
}

enum PaymentTypeEnum {
    push = 1,
    singlePull = 2,
    recurringPull = 3,
    recurringWithInitial = 4
}

interface ISmartContracts {
    token: string;
    masterPullPayment: string;
}

interface IPullPaymentContract {
    execute: string[];
}