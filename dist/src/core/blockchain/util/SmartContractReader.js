"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const solc = __importStar(require("solc"));
const fs = require("fs");
const globals_1 = require("../../../utils/globals");
const BlockchainHelper_1 = require("./BlockchainHelper");
class SmartContractReader {
    constructor(smartContractName) {
        this.smartContractName = smartContractName;
        this.smartContractPath = globals_1.Globals.GET_SOLIDITY_FILE();
    }
    readABI() {
        const input = fs.readFileSync(this.smartContractPath, 'utf-8');
        const output = solc.compile(input.toString(), 1);
        return JSON.parse(output.contracts[`:${this.smartContractName}`].interface);
    }
    readContract(address) {
        const contractABI = this.readABI();
        return new (new BlockchainHelper_1.BlockchainHelper().getProvider()).Contract(contractABI, address);
    }
}
exports.SmartContractReader = SmartContractReader;
//# sourceMappingURL=SmartContractReader.js.map