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
    web3: any;
    merchantApiUrl: string;
    network?: string;
    pgUser?: string;
    pgHost?: string;
    pgPort?: string;
    pgDatabase?: string;
    pgPassword?: string;
    redisHost?: string;
    redisPort?: string;
    queueLimit?: number;
    createPayment: any;
    deletePayment: any;
    getAllPayments: any;
    getPayment: any;
    updatePayment: any;
    
    public constructor(buildParams: MerchantSDKBuild) {
        this.web3 = buildParams.web3;
        this.merchantApiUrl = buildParams.merchantApiUrl;
        this.network = buildParams.network ? buildParams.network : null;
        this.pgUser = buildParams.pgUser ? buildParams.pgUser : null;
        this.pgHost = buildParams.pgHost ? buildParams.pgHost : null;
        this.pgPort = buildParams.pgPort ? buildParams.pgPort : null;
        this.pgDatabase = buildParams.pgDatabase ? buildParams.pgDatabase : null;
        this.pgPassword = buildParams.pgPassword ? buildParams.pgPassword : null;
        this.redisHost = buildParams.redisHost ? buildParams.redisHost : null;
        this.redisPort = buildParams.redisPort ? buildParams.redisPort : null;
        this.queueLimit = buildParams.queueLimit ? buildParams.queueLimit : null;
        this.createPayment = buildParams.createPayment;
        this.deletePayment = buildParams.deletePayment;
        this.getAllPayments = buildParams.getAllPayments;
        this.getPayment = buildParams.getPayment;
        this.updatePayment = buildParams.updatePayment;
    }
}