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
        this.merchantApiUrl = buildParams.merchantApiUrl;
        this.network = buildParams.network;
    }
    
}