import * as ethers from 'ethers';
import { DefaultConfig } from '../../config/default.config';

export class BlockchainHelper {
    private provider: any;

    public constructor() {
        this.provider = DefaultConfig.settings.web3;
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
     * @returns {Promise<any>} Returns the PromiEvent from the ethereum network
     * */
    public executeSignedTransaction(serializedTx: string, callback?: any): Promise<any> {
        return this.getProvider().sendSignedTransaction(serializedTx, callback);
    }

    public getProvider(url?: string, network: string = 'ropsten') {
        if (url) this.provider = new ethers.providers.JsonRpcProvider(url, network);
        return this.provider.eth ? this.provider.eth : this.provider;
    }

}