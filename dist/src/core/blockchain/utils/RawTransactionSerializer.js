"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../../../config/default.config");
const TX = require('ethereumjs-tx');
class RawTransactionSerializer {
    constructor(data, contractAddress, txCount, privateKey, limit = 500000) {
        this.data = data;
        this.contractAddress = contractAddress;
        this.txCount = txCount;
        this.limit = limit;
        this.privateKey = Buffer.from(privateKey, 'hex');
    }
    getSerializedTx() {
        const rawTx = {
            gasPrice: default_config_1.DefaultConfig.settings.web3.utils.toHex(default_config_1.DefaultConfig.settings.web3.utils.toWei('10', 'Gwei')),
            gasLimit: default_config_1.DefaultConfig.settings.web3.utils.toHex(this.limit),
            to: this.contractAddress,
            value: '0x00',
            data: this.data,
            nonce: this.txCount
        };
        const tx = new TX(rawTx);
        tx.sign(this.privateKey);
        this.privateKey = null;
        return '0x' + tx.serialize().toString('hex');
    }
}
exports.RawTransactionSerializer = RawTransactionSerializer;
//# sourceMappingURL=RawTransactionSerializer.js.map