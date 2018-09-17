"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../../utils/globals");
const PaymentContractController_1 = require("../database/PaymentContractController");
const SmartContractReader_1 = require("./SmartContractReader");
const BlockchainHelper_1 = require("./BlockchainHelper");
const default_config_1 = require("../../config/default.config");
const redis = require('redis');
const bluebird = require('bluebird');
class FundingController {
    constructor() {
        this.maxGasFeeName = "k_max_gas_fee";
        this.lastBlock = "k_last_block";
    }
    calculateEth(numberOfPayments, paymentID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const paymentContract = (yield new PaymentContractController_1.PaymentContractController().getContract(paymentID)).data[0];
                const contract = yield new SmartContractReader_1.SmartContractReader(globals_1.Globals.GET_PULL_PAYMENT_CONTRACT_NAME()).readContract(paymentContract.pullPaymentAddress);
                const blockchainHelper = new BlockchainHelper_1.BlockchainHelper();
                const data = contract.methods.executePullPayment(paymentContract.customerAddress, paymentContract.id).encodeABI();
                try {
                    blockchainHelper.getProvider().estimateGas({
                        to: paymentContract.pullPaymentAddress,
                        from: paymentContract.merchantAddress,
                        data: data,
                    }).then((res) => {
                        resolve(res);
                    }).catch(err => {
                        reject(err);
                    });
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    calculateMaxGasFee() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const rclient = redis.createClient({
                    port: default_config_1.DefaultConfig.settings.redisPort,
                    host: default_config_1.DefaultConfig.settings.redisHost
                });
                bluebird.promisifyAll(redis);
                const bcHelper = new BlockchainHelper_1.BlockchainHelper();
                let max = Number(yield rclient.getAsync(this.maxGasFeeName));
                let fromBlock = Number(yield rclient.getAsync(this.lastBlock));
                if (!fromBlock) {
                    fromBlock = 0;
                    yield rclient.setAsync(this.lastBlock, fromBlock);
                }
                max = max ? max : 0;
                yield rclient.setAsync(this.maxGasFeeName, max);
                const latestBlock = Number(yield bcHelper.getProvider().getBlockNumber());
                bcHelper.getProvider().getPastLogs({
                    fromBlock: default_config_1.DefaultConfig.settings.web3.utils.toHex(fromBlock),
                    toBlock: latestBlock ? default_config_1.DefaultConfig.settings.web3.utils.toHex(latestBlock) : 'latest',
                    address: globals_1.Globals.GET_SMART_CONTRACT_ADDRESSES(default_config_1.DefaultConfig.settings.networkID).masterPullPayment,
                    topics: globals_1.Globals.GET_PULL_PAYMENT_TOPICS(default_config_1.DefaultConfig.settings.networkID).execute
                }, (err, res) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        reject(err);
                    }
                    for (const log of res) {
                        const receipt = yield bcHelper.getProvider().getTransactionReceipt(log.transactionHash);
                        if (receipt) {
                            if (receipt.gasUsed > max)
                                max = receipt.gasUsed;
                        }
                    }
                    rclient.setAsync(this.lastBlock, latestBlock ? latestBlock : res[0].blockNumber);
                    resolve(Number(yield rclient.getAsync(this.maxGasFeeName)));
                    rclient.quit();
                }));
            }));
        });
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                resolve('TESTING 3');
            }));
        });
    }
}
exports.FundingController = FundingController;
//# sourceMappingURL=FundingController.js.map