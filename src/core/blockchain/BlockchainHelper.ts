import { DefaultConfig } from '../../config/default.config';
import { PromiEvent } from 'web3/types';

export class BlockchainHelper {
    private provider: any;

    public constructor(provider?: any) {
        this.provider = provider? provider : DefaultConfig.settings.web3;
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
}