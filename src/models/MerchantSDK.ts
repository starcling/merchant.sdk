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
    merchantApiUrl?: string;
    network?: string;

    public constructor(buildParams: MerchantSDKBuild) {
        if (buildParams) {
            this.merchantApiUrl = buildParams.merchantApiUrl ? buildParams.merchantApiUrl : null;
            this.network = buildParams.network ? buildParams.network : null;
        }
        
    }
    
}