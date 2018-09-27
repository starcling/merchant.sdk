import { DefaultConfig } from '../../../config/default.config';
import { PromiEvent } from 'web3/types';

export class BlockchainHelper {
    private provider: any;

    public constructor(provider?: any) {
        this.provider = provider ? provider : DefaultConfig.settings.web3;
    }

    /**
     * @description Retrieves the transaction count (nonce) of an ethereum address
     * @param {string} address - The ethereum address
     * @returns {Promise<number>} Returns the transaction count (nonce) of an ethereum address
     * */
    public getTxCount(address: string): Promise<number> {
        return this.getProvider().getTransactionCount(address);
    }

    /**
     * @description Executes a Singed Transaction using web3.eth.sendSignedTransaction()
     * @returns {PromiEvent<any>} Returns the PromiEvent from the ethereum network
     * */
    public executeSignedTransaction(serializedTx: string, callback?: any): PromiEvent<any> {
        return this.getProvider().sendSignedTransaction(serializedTx, callback);
    }

    /**
     * @description Gets the provider that is used to communicate to the blockchain
     * @returns {PromiEvent<any>} Returns the PromiEvent from the ethereum network
     * */
    public getProvider() {
        return this.provider.eth ? this.provider.eth : this.provider;
    }

    /**
     * @description Method for getting provider utils
     * @returns {any} Returns utils
     * */
    public utils() {
        return this.provider.utils;
    }

    /**
     * @description Converts provided number as string to wei
     * @param {string} value value to be converted
     * @returns {PromiEvent<any>} Returns the PromiEvent from the ethereum network
     * */
    public toWei(value: string) {
        return this.provider.utils.toWei(value);
    }

    /**
     * @description Converts provided number to big number
     * @param {number} value value to be converted
     * @returns {PromiEvent<any>} Returns the PromiEvent from the ethereum network
     * */
    public toBN(value: number) {
        return this.provider.utils.toBN(value);
    }

    /**
     * @description Validates the receipt that the tx hash provided is actually a pull payment
     * @returns {boolean} true if the receipt is from pull payment
     * */
    public isValidRegisterTx(receipt: any, pull_payment_id: string) {
        try {
            const data = this.getProvider().abi.decodeLog(['address', 'address', 'string'], receipt.logs[0].data, receipt.logs.topics);
            return data[2] === pull_payment_id ? true : false;
        } catch (err) {
            return false;
        }
    }


    public parseUnits(value, decimals: number) {
        if (typeof (value) !== 'string' || !value.match(/^-?[0-9.,]+$/)) {
            throw new Error('invalid value');
        }
        // Remove commas
        let _value = value.replace(/,/g, '');
        // Is it negative?
        const negative = (_value.substring(0, 1) === '-');
        if (negative) { _value = _value.substring(1); }
        if (_value === '.') { throw new Error('invalid value'); }
        // Split it into a whole and fractional part
        const comps = _value.split('.');
        if (comps.length > 2) { throw new Error('too many decimal points'); }
        let whole: any = comps[0], fraction: any = comps[1];
        if (!whole) { whole = '0'; }
        if (!fraction) { fraction = '0'; }
        // Prevent underflow
        if (fraction.length > decimals) {
            throw new Error('too many decimal places');
        }
        while (fraction.length < decimals) { fraction += '0'; }

        whole = this.provider.utils.toBN(whole);
        fraction = this.provider.utils.toBN(fraction);
        const tenPower = this.provider.utils.toBN('1' + Array(decimals + 1).join('0'));
        let res = (whole.mul(tenPower)).add(fraction);

        if (negative) { res = res.mul(this.provider.utils.toBN(-1)); }

        return res;
    }
}