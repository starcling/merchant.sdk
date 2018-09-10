"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../../config/default.config");
class BlockchainHelper {
    constructor(provider) {
        this.provider = provider ? provider : default_config_1.DefaultConfig.settings.web3;
    }
    getTxCount(address) {
        return this.getProvider().getTransactionCount(address);
    }
    executeSignedTransaction(serializedTx, callback) {
        return this.getProvider().sendSignedTransaction(serializedTx, callback);
    }
    getProvider() {
        return this.provider.eth ? this.provider.eth : this.provider;
    }
    isValidRegisterTx(receipt, payment_id) {
        try {
            const data = this.getProvider().abi.decodeLog(['address', 'address', 'string'], receipt.logs[0].data, receipt.logs.topics);
            return data[2] === payment_id ? true : false;
        }
        catch (err) {
            return false;
        }
    }
}
exports.BlockchainHelper = BlockchainHelper;
//# sourceMappingURL=BlockchainHelper.js.map