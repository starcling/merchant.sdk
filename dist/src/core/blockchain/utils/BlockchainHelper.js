"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../../../config/default.config");
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
    utils() {
        return this.provider.utils;
    }
    toWei(value) {
        return this.provider.utils.toWei(value);
    }
    toBN(value) {
        return this.provider.utils.toBN(value);
    }
    isValidRegisterTx(receipt, pull_payment_id) {
        return true;
    }
    parseUnits(value, decimals) {
        if (typeof (value) !== 'string' || !value.match(/^-?[0-9.,]+$/)) {
            throw new Error('invalid value');
        }
        let _value = value.replace(/,/g, '');
        const negative = (_value.substring(0, 1) === '-');
        if (negative) {
            _value = _value.substring(1);
        }
        if (_value === '.') {
            throw new Error('invalid value');
        }
        const comps = _value.split('.');
        if (comps.length > 2) {
            throw new Error('too many decimal points');
        }
        let whole = comps[0], fraction = comps[1];
        if (!whole) {
            whole = '0';
        }
        if (!fraction) {
            fraction = '0';
        }
        if (fraction.length > decimals) {
            throw new Error('too many decimal places');
        }
        while (fraction.length < decimals) {
            fraction += '0';
        }
        whole = this.provider.utils.toBN(whole);
        fraction = this.provider.utils.toBN(fraction);
        const tenPower = this.provider.utils.toBN('1' + Array(decimals + 1).join('0'));
        let res = (whole.mul(tenPower)).add(fraction);
        if (negative) {
            res = res.mul(this.provider.utils.toBN(-1));
        }
        return res;
    }
}
exports.BlockchainHelper = BlockchainHelper;
//# sourceMappingURL=BlockchainHelper.js.map