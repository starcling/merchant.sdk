"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../../../config/default.config");
const TX = require('ethereumjs-tx');
class RawTransactionSerializer {
    constructor(data, contractAddress, txCount, privateKey) {
        this.data = data;
        this.contractAddress = contractAddress;
        this.txCount = txCount;
        this.privateKey = Buffer.from(privateKey, 'hex');
    }
    getSerializedTx() {
        const rawTx = {
            gasPrice: default_config_1.DefaultConfig.settings.web3.utils.toHex(default_config_1.DefaultConfig.settings.web3.utils.toWei('10', 'Gwei')),
            gasLimit: default_config_1.DefaultConfig.settings.web3.utils.toHex(4000000),
            to: this.contractAddress,
            value: '0x00',
            data: this.data,
            nonce: this.txCount
        };
        const tx = new TX(rawTx);
        tx.sign(this.privateKey);
        return '0x' + tx.serialize().toString('hex');
    }
}
exports.RawTransactionSerializer = RawTransactionSerializer;
//# sourceMappingURL=RawTransactionSerializer.js.map