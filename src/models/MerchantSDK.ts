export interface MerchantSDKSettings extends MerchantSDKBuild {
    apiUrl?: string;
    apiKey?: string;
    pmaApiKey?: string;
    pmaUserToken?: string;
    generateQRApiUrl?: string;
    pullPaymentModelURL?: string;
    pullPaymentURL?: string;
    transactionURL?: string;
    loginUrl?: string;
    generateApiKeyUrl?: string;
    generateAccessTokenUrl?: string;
    txStatusInterval?: number;
    networkID?: number;
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
    keyDbUser?: string;
    keyDbHost?: string;
    keyDb?: string;
    keyDbPass?: string;
    keyDbPort?: string;
    queueLimit?: number;
    redisClient?: any;
    getEnums: any;
    getPullPayment: any;
    updatePullPayment: any;
    getTransactions: any;
    createTransaction: any;
    updateTransaction: any;
    getPrivateKey: any;
    bankAddress: any;

    public constructor(buildParams: MerchantSDKBuild) {
        this.web3 = buildParams.web3;
        this.merchantApiUrl = buildParams.merchantApiUrl;
        this.network = buildParams.network ? buildParams.network : null;
        this.pgUser = buildParams.pgUser ? buildParams.pgUser : null;
        this.pgHost = buildParams.pgHost ? buildParams.pgHost : null;
        this.pgPort = buildParams.pgPort ? buildParams.pgPort : null;
        this.pgDatabase = buildParams.pgDatabase ? buildParams.pgDatabase : null;
        this.pgPassword = buildParams.pgPassword ? buildParams.pgPassword : null;
        this.keyDbUser = buildParams.keyDbUser ? buildParams.keyDbUser : null;
        this.keyDbHost = buildParams.keyDbHost ? buildParams.keyDbHost : null;
        this.keyDb = buildParams.keyDb ? buildParams.keyDb : null;
        this.keyDbPass = buildParams.keyDbPass ? buildParams.keyDbPass : null;
        this.keyDbPort = buildParams.keyDbPort ? buildParams.keyDbPort : null;
        this.queueLimit = buildParams.queueLimit ? buildParams.queueLimit : null;
        this.redisClient = buildParams.redisClient ? buildParams.redisClient : null;
        this.getEnums = buildParams.getEnums;
        this.getPullPayment = buildParams.getPullPayment;
        this.updatePullPayment = buildParams.updatePullPayment;
        this.getTransactions = buildParams.getTransactions;
        this.createTransaction = buildParams.createTransaction;
        this.updateTransaction = buildParams.updateTransaction;
        this.getPrivateKey = buildParams.getPrivateKey;
        this.bankAddress = buildParams.bankAddress;
    }
}