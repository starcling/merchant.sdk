"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../config/default.config");
class Globals {
    static GET_DEFAULT_CORE_API_URL() {
        return 'http://52.29.233.47:8081/api/v1/';
    }
    static GET_DEFAULT_MERCHANT_API_URL() {
        return 'http://merchant:3000/api/v1';
    }
    static GET_QR_API_URL() {
        return '/qr/url/';
    }
    static GET_PAYMENT_URL() {
        return '/payments';
    }
    static GET_CONTRACT_URL() {
        return '/contracts';
    }
    static GET_TRANSACTION_URL() {
        return '/transactions';
    }
    static GET_LOGIN_URL() {
        return '/login';
    }
    static GET_API_KEY_URL() {
        return '/auth/generate-api-key';
    }
    static GET_ACCESS_TOKEN_URL() {
        return '/auth/token/generate';
    }
    static GET_START_SCHEDULER_TIME_WINDOW() {
        return 300;
    }
    static GET_DEFAULT_REDIS_HOST() {
        return 'localhost';
    }
    static GET_DEFAULT_REDIS_PORT() {
        return '6379';
    }
    static GET_DEFAULT_PG_HOST() {
        return 'localhost';
    }
    static GET_DEFAULT_PG_USER() {
        return 'local_user';
    }
    static GET_DEFAULT_PG_PASSWORD() {
        return 'local_pass';
    }
    static GET_DEFAULT_PG_DATABASE() {
        return 'local_merchant_server';
    }
    static GET_DEFAULT_PG_PORT() {
        return '5431';
    }
    static GET_DEFAULT_MYSQL_HOST() {
        return 'localhost';
    }
    static GET_DEFAULT_MYSQL_USER() {
        return 'db_service';
    }
    static GET_DEFAULT_MYSQL_PASSWORD() {
        return 'db_pass';
    }
    static GET_DEFAULT_MYSQL_DATABASE() {
        return 'keys';
    }
    static GET_DEFAULT_MYSQL_PORT() {
        return '3305';
    }
    static GET_DEFAULT_NETWORK() {
        return 'ropsten';
    }
    static GET_TX_STATUS_INTERVAL() {
        return 2000;
    }
    static GET_SOLIDITY_FILE() {
        return `${__dirname.substring(0, __dirname.length - 15)}/contracts/contracts.sol`;
    }
    static GET_TRANSACTION_STATUS_ENUM() {
        return TransactionStatusEnum;
    }
    static GET_PAYMENT_STATUS_ENUM() {
        return PaymentStatusEnum;
    }
    static GET_PAYMENT_TYPE_ENUM() {
        return PaymentTypeEnum;
    }
    static GET_TRANSACTION_TYPE_ENUM() {
        return TransactionTypeEnum;
    }
    static GET_TRANSACTION_STATUS_ENUM_NAMES() {
        return [
            '',
            'pending',
            'failed',
            'success'
        ];
    }
    static GET_CONTRACT_STATUS_ENUM_NAMES() {
        return [
            '',
            'initial',
            'running',
            'stopped',
            'cancelled',
            'done',
        ];
    }
    static GET_PAYMENT_TYPE_ENUM_NAMES() {
        return [
            '',
            'push',
            'singlePull',
            'recurringPull',
            'recurringWithInitial'
        ];
    }
    static GET_TRANSACTION_TYPE_ENUM_NAMES() {
        return [
            '',
            'register',
            'initial',
            'execute',
            'cancel'
        ];
    }
    static GET_PULL_PAYMENT_CONTRACT_NAME() {
        return 'PumaPayPullPayment';
    }
    static GET_SCHEDULE_QUEUE_INTERVAL() {
        return 10;
    }
    static GET_PULL_FAILED_QUEUE_LIMIT() {
        return 100;
    }
    static REFRESH_ENUMS() {
        return __awaiter(this, void 0, void 0, function* () {
            return default_config_1.DefaultConfig.settings.getEnums();
        });
    }
}
exports.Globals = Globals;
var TransactionStatusEnum;
(function (TransactionStatusEnum) {
    TransactionStatusEnum[TransactionStatusEnum["pending"] = 1] = "pending";
    TransactionStatusEnum[TransactionStatusEnum["failed"] = 2] = "failed";
    TransactionStatusEnum[TransactionStatusEnum["success"] = 3] = "success";
})(TransactionStatusEnum || (TransactionStatusEnum = {}));
var TransactionTypeEnum;
(function (TransactionTypeEnum) {
    TransactionTypeEnum[TransactionTypeEnum["register"] = 1] = "register";
    TransactionTypeEnum[TransactionTypeEnum["initial"] = 2] = "initial";
    TransactionTypeEnum[TransactionTypeEnum["execute"] = 3] = "execute";
    TransactionTypeEnum[TransactionTypeEnum["cancel"] = 4] = "cancel";
})(TransactionTypeEnum || (TransactionTypeEnum = {}));
var PaymentStatusEnum;
(function (PaymentStatusEnum) {
    PaymentStatusEnum[PaymentStatusEnum["initial"] = 1] = "initial";
    PaymentStatusEnum[PaymentStatusEnum["running"] = 2] = "running";
    PaymentStatusEnum[PaymentStatusEnum["stopped"] = 3] = "stopped";
    PaymentStatusEnum[PaymentStatusEnum["cancelled"] = 4] = "cancelled";
    PaymentStatusEnum[PaymentStatusEnum["done"] = 4] = "done";
})(PaymentStatusEnum || (PaymentStatusEnum = {}));
var PaymentTypeEnum;
(function (PaymentTypeEnum) {
    PaymentTypeEnum[PaymentTypeEnum["push"] = 1] = "push";
    PaymentTypeEnum[PaymentTypeEnum["singlePull"] = 2] = "singlePull";
    PaymentTypeEnum[PaymentTypeEnum["recurringPull"] = 3] = "recurringPull";
    PaymentTypeEnum[PaymentTypeEnum["recurringWithInitial"] = 4] = "recurringWithInitial";
})(PaymentTypeEnum || (PaymentTypeEnum = {}));
//# sourceMappingURL=globals.js.map