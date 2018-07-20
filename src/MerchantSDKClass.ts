import { AuthenticationController } from './core/authentication/AuthenticationController';
import { DefaultConfig } from './config/default.config';
import { QrCode } from './core/qr/QrCode';
import { MerchantSDKBuild } from './models/MerchantSDK';
import { HTTPHelper } from './utils/web/HTTPHelper';
import { BlockchainController } from './core/blockchain/BlockchainController';
import { MultipleInheritance } from './utils/MultipleInheritance/MultipleInheritance';

export class MerchantSDK extends MultipleInheritance(HTTPHelper, QrCode, BlockchainController, AuthenticationController) {

    public constructor(buildParams: MerchantSDKBuild) {
        super();
        this.build(buildParams);
    }

    /**
     * @description Method used to build the SDK with with new parameters
     * @param {MerchantSDKBuild} buildParams Parameters to be build
     * @returns {MerchantSDK} MerchantSDK object - this
     */
    public build(buildParams: MerchantSDKBuild) {
        // DefaultConfig.settings = new MerchantSDKBuild(buildParams);

        return DefaultConfig.settings;
    }
}
