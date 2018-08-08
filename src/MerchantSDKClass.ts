import { AuthenticationController } from './core/authentication/AuthenticationController';
import { DefaultConfig } from './config/default.config';
import { QrCode } from './core/qr/QrCode';
import { MerchantSDKBuild, MerchantSDKSettings } from './models/MerchantSDK';
import { HTTPHelper } from './utils/web/HTTPHelper';
import { PaymentController } from './core/payment/PaymentController';
import { BlockchainController } from './core/blockchain/BlockchainController';
import { MultipleInheritance } from './utils/multipleinheritance/MultipleInheritance';
import { ErrorHandler } from './utils/handlers/ErrorHandler';
import { Scheduler } from './core/scheduler/Scheduler';

export class MerchantSDK extends MultipleInheritance(HTTPHelper, QrCode, BlockchainController, AuthenticationController, PaymentController) {

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
