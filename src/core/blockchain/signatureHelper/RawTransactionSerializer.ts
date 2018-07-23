import {Globals} from '../../../utils/globals';
import * as ethers from 'ethers';
const TX = require('ethereumjs-tx');

/**
 * @description Serializes a Raw Transaction
 * @constructor {any} data The encoded ABI of the transaction
 * @constructor {string} contractAddress The smart contract address which will execute the function
 * @constructor {number} txCount The nonce of the account that is executing the transaction
 * @private {Buffer} privateKey - The private key of the account that is executing the transaction
 * */
export class RawTransactionSerializer {
    private privateKey: Buffer = Buffer.from(Globals.GET_MERCHANT_PRIVATE_KEY(), 'hex');

    public constructor(private data: any, private contractAddress: string, private txCount: number) {
    }

    /**
     * @description Serializes a Raw Transaction
     * @returns {string} Returns the serialized raw transaction
     * */
    public getSerializedTx(): string {
        const rawTx = {
            gasPrice: '0x3b9aca00',
            gasLimit: ethers.utils.toHex(210000),
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