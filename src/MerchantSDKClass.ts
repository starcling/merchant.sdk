import { AuthenticationController } from './core/authentication/AuthenticationController';
import { DefaultConfig } from './config/default.config';
import { QrCode } from './core/qr/QrCode';
import { MerchantSDKBuild, MerchantSDKSettings } from './models/MerchantSDK';
import { HTTPHelper } from './utils/web/HTTPHelper';
import { BlockchainController } from './core/blockchain/BlockchainController';
import { MultipleInheritance } from './utils/MultipleInheritance/MultipleInheritance';
import { ErrorHandler } from './utils/handlers/ErrorHandler';
import { Scheduler } from './core/scheduler/Scheduler';
import { SchedulerBuffer } from './core/scheduler/ScheduleBuffer';
import { PullPaymentController } from './core/database/PullPaymentController';
import { TransactionController } from './core/database/TransactionController';
import { FundingController } from './core/blockchain/FundingController';
import { CashOutController } from './core/blockchain/CashOutController';

export class MerchantSDK extends MultipleInheritance(BlockchainController, HTTPHelper, QrCode, AuthenticationController, PullPaymentController, TransactionController, FundingController, CashOutController) {

    public constructor() {
        super();
    }

    /**
     * @description Method used to build the SDK with with new parameters
     * @param {MerchantSDKBuild} buildParams Parameters to be build
     * @returns {MerchantSDK} MerchantSDK object - this
     */
    public build(buildParams: MerchantSDKBuild): MerchantSDK {
        ErrorHandler.validateBuildParams(buildParams);
        DefaultConfig.settings = <MerchantSDKSettings>new MerchantSDKBuild(buildParams);
        SchedulerBuffer.sync(this.executePullPayment);

        return this;
    }

    /**
     * @description Method to retrieve Scheduler
     * @returns {Scheduler} Scheduler class with static methods {stop} and {restart}
     */
    public get Scheduler() {
        return Scheduler;
    }

}