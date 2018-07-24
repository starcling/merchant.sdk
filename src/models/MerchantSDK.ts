import * as ethers from 'ethers';
import { Globals } from '../utils/globals';

export interface MerchantSDKSettings extends MerchantSDKBuild {
    apiUrl?: string;
    apiKey?: string;
    pmaApiKey?: string;
    pmaUserToken?: string;
    generateQRApiUrl?: string;
    paymentsURL?: string;
    loginUrl?: string;
    generateApiKeyUrl?: string;
    generateAccessTokenUrl?: string;
    txStatusInterval?: number;
}

export class MerchantSDKBuild {
    web3?: any;
    merchantApiUrl?: string;
    network?: string;

    public constructor(buildParams: MerchantSDKBuild) {
        if (buildParams) {
            this.web3 = buildParams.web3 ? buildParams.web3 : new ethers.providers.JsonRpcProvider(Globals.GET_SPECIFIC_INFURA_URL(), Globals.GET_NETWORK());
            this.merchantApiUrl = buildParams.merchantApiUrl ? buildParams.merchantApiUrl : null;
            this.network = buildParams.network ? buildParams.network : null;
        }
        
    }
    
}