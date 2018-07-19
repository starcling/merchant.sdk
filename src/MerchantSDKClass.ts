import { AuthenticationController } from './core/authentication/AuthenticationController';
import { DefaultConfig } from './config/default.config';
import { QrCode } from './core/qr/QrCode';
import { MerchantSDKSettings } from './models/MerchantSDK';
import { HTTPHelper } from './utils/web/HTTPHelper';
import { BlockchainController } from './core/blockchain/BlockchainController';
import { MultipleInheritance } from './utils/MultipleInheritance/MultipleInheritance';

export class MerchantSDK extends MultipleInheritance(HTTPHelper, QrCode, BlockchainController, AuthenticationController) {

    public constructor(param: MerchantSDKSettings) {
        super();
        DefaultConfig.settings = { apiUrl: ((param && param.apiUrl) || DefaultConfig.settings.apiUrl).replace(/\/$/g, '') };
        DefaultConfig.settings = { pmaApiKey: (param && param.apiKey) || null};

    }

    /**
     * @description Method used to build the SDK with with new parameters
     * @param {MerchantSDKSettings} param Parameters to be build
     * @returns {MerchantSDK} MerchantSDK object - this
     */
    public build(param: MerchantSDKSettings): MerchantSDK {
        DefaultConfig.settings = { apiUrl: ((param && param.apiUrl) || DefaultConfig.settings.apiUrl).replace(/\/$/g, '') };
        DefaultConfig.settings = { pmaApiKey: (param && param.apiKey) || null};

        return this;
    }
}
