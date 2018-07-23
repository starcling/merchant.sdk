import * as solc from 'solc';
import fs = require('fs');
import { Globals } from '../../utils/globals';
import { BlockchainHelper } from './BlockchainHelper';

/**
 * @description Smart Contract Reader
 * @constructor {string} smartContractName The name of the smart contract that needs to be read
 * @private {string} smartContractPath The path for the smart contract solidity file
 * @private {any} contract The Debit Account contract on the blockchain
 * @private {string} contractAddress The address of Debit Account contract on the blockchain
 * */
export class SmartContractReader {
    private readonly smartContractPath: string;
    private blockchainHelper: BlockchainHelper;

    public constructor(private smartContractName: string) {
        this.smartContractPath = Globals.GET_SOLIDITY_FILE();
        this.blockchainHelper = new BlockchainHelper();
    }

    /**
     * @description Reads the ABI of the smart contract specified
     * @returns {any} Returns the ABI of the smart contract
     * */
    public readABI(): any {
        const input = fs.readFileSync(this.smartContractPath, 'utf-8');
        const output = solc.compile(input.toString(), 1);

        return  JSON.parse(output.contracts[`:${this.smartContractName}`].interface);
    }

    /**
     * @description Reads the smart contract specified
     * @param {string} address - The smart contract address on ethereum
     * @returns {any} Returns the smart contract instance on that address
     * */
    public readContract(address: string): Promise<any> {
        const provider = this.blockchainHelper.getProvider();
        const contractABI = this.readABI();

        return new provider.Contract(contractABI, address);
    }
}