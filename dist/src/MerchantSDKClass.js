"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthenticationController_1 = require("./core/authentication/AuthenticationController");
const default_config_1 = require("./config/default.config");
const QrCode_1 = require("./core/qr/QrCode");
const MerchantSDK_1 = require("./models/MerchantSDK");
const HTTPHelper_1 = require("./utils/web/HTTPHelper");
const BlockchainController_1 = require("./core/blockchain/BlockchainController");
const MultipleInheritance_1 = require("./utils/MultipleInheritance/MultipleInheritance");
const ErrorHandler_1 = require("./utils/handlers/ErrorHandler");
const Scheduler_1 = require("./core/scheduler/Scheduler");
const ScheduleBuffer_1 = require("./core/scheduler/ScheduleBuffer");
const PullPaymentController_1 = require("./core/database/PullPaymentController");
const TransactionController_1 = require("./core/database/TransactionController");
const FundingController_1 = require("./core/blockchain/FundingController");
const CashOutController_1 = require("./core/blockchain/CashOutController");
const EncryptionController_1 = require("./core/encryption/EncryptionController");
class MerchantSDK extends MultipleInheritance_1.MultipleInheritance(BlockchainController_1.BlockchainController, HTTPHelper_1.HTTPHelper, QrCode_1.QrCode, AuthenticationController_1.AuthenticationController, PullPaymentController_1.PullPaymentController, TransactionController_1.TransactionController, FundingController_1.FundingController, CashOutController_1.CashOutController, EncryptionController_1.EncryptionController) {
    constructor() {
        super();
    }
    build(buildParams) {
        ErrorHandler_1.ErrorHandler.validateBuildParams(buildParams);
        default_config_1.DefaultConfig.settings = new MerchantSDK_1.MerchantSDKBuild(buildParams);
        ScheduleBuffer_1.SchedulerBuffer.sync(this.executePullPayment);
        return this;
    }
    get Scheduler() {
        return Scheduler_1.Scheduler;
    }
}
exports.MerchantSDK = MerchantSDK;
//# sourceMappingURL=MerchantSDKClass.js.map