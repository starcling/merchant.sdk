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
    pgUser?: string;
    pgHost?: string;
    pgPort?: string;
    pgDatabase?: string;
    pgPassword?: string;
    
    public constructor(buildParams: MerchantSDKBuild) {

        //Do error handling here if wrong parameters
        if (buildParams) {
            this.web3 = buildParams.web3 ? buildParams.web3 : new ethers.providers.JsonRpcProvider(Globals.GET_SPECIFIC_INFURA_URL(), Globals.GET_NETWORK());
            this.merchantApiUrl = buildParams.merchantApiUrl ? buildParams.merchantApiUrl : null;
            this.network = buildParams.network ? buildParams.network : null;
            this.pgUser = buildParams.pgUser ? buildParams.pgUser : null;
            this.pgHost = buildParams.pgHost ? buildParams.pgHost : null;
            this.pgPort = buildParams.pgPort ? buildParams.pgPort : null;
            this.pgDatabase = buildParams.pgDatabase ? buildParams.pgDatabase : null;
            this.pgPassword = buildParams.pgPassword ? buildParams.pgPassword : null;
            
        }
        
    }
    
}