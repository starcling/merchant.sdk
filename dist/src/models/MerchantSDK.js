"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MerchantSDKBuild {
    constructor(buildParams) {
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
        this.keyDbUser = buildParams.keyDbUser ? buildParams.keyDbUser : null;
        this.keyDbHost = buildParams.keyDbHost ? buildParams.keyDbHost : null;
        this.keyDb = buildParams.keyDb ? buildParams.keyDb : null;
        this.keyDbPass = buildParams.keyDbPass ? buildParams.keyDbPass : null;
        this.keyDbPort = buildParams.keyDbPort ? buildParams.keyDbPort : null;
        this.queueLimit = buildParams.queueLimit ? buildParams.queueLimit : null;
        this.getEnums = buildParams.getEnums;
        this.getContract = buildParams.getContract;
        this.updateContract = buildParams.updateContract;
        this.getTransactions = buildParams.getTransactions;
        this.createTransaction = buildParams.createTransaction;
        this.updateTransaction = buildParams.updateTransaction;
        this.getPrivateKey = buildParams.getPrivateKey;
        this.bankAddress = buildParams.bankAddress;
    }
}
exports.MerchantSDKBuild = MerchantSDKBuild;
//# sourceMappingURL=MerchantSDK.js.map