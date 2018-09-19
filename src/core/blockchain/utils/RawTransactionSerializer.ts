import { DefaultConfig } from '../../../config/default.config';
const TX = require('ethereumjs-tx');

/**
 * @description Serializes a Raw Transaction
 * @constructor {any} data The encoded ABI of the transaction
 * @constructor {string} contractAddress The smart contract address which will execute the function
 * @constructor {number} txCount The nonce of the account that is executing the transaction
 * @private {Buffer} privateKey - The private key of the account that is executing the transaction
 * */
export class RawTransactionSerializer {
    private privateKey: Buffer;

    public constructor(private data: any, private contractAddress: string, private txCount: number, privateKey: string, private limit: number = 500000) {
        this.privateKey = Buffer.from(privateKey, 'hex');
    }

    /**
     * @description Serializes a Raw Transaction
     * @returns {string} Returns the serialized raw transaction
     * */
    public getSerializedTx(): string {
        const rawTx = {
            gasPrice: DefaultConfig.settings.web3.utils.toHex(DefaultConfig.settings.web3.utils.toWei('10', 'Gwei')),
            gasLimit: DefaultConfig.settings.web3.utils.toHex(this.limit),
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