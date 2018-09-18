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
const SmartContractReader_1 = require("./utils/SmartContractReader");
const BlockchainHelper_1 = require("./utils/BlockchainHelper");
const default_config_1 = require("../../config/default.config");
const HTTPHelper_1 = require("../../utils/web/HTTPHelper");
const redis = require('redis');
const bluebird = require('bluebird');
class FundingController {
    constructor() {
        this.maxGasFeeName = "k_max_gas_fee";
        this.lastBlock = "k_last_block";
        this.multiplier = 1.5;
    }
    fundEth(fromAddress, toAddress, value = null, paymentID = null, tokenAddress = null, pullPaymentAddress = null) {
        return __awaiter(this, void 0, void 0, function* () {
            tokenAddress = tokenAddress ? tokenAddress : globals_1.Globals.GET_SMART_CONTRACT_ADDRESSES(default_config_1.DefaultConfig.settings.networkID).token;
            pullPaymentAddress = pullPaymentAddress ? pullPaymentAddress : globals_1.Globals.GET_SMART_CONTRACT_ADDRESSES(default_config_1.DefaultConfig.settings.networkID).masterPullPayment;
            value = value ? value : yield this.calculateWeiToFund(paymentID, fromAddress, tokenAddress, pullPaymentAddress);
            const blockchainHelper = new BlockchainHelper_1.BlockchainHelper();
            const rawTx = {
                to: toAddress,
                from: fromAddress,
                value: value
            };
            return blockchainHelper.getProvider().sendTransaction(rawTx);
        });
    }
    calculateWeiToFund(paymentID, bankAddress, tokenAddress = null, pullPaymentAddress = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    tokenAddress = tokenAddress ? tokenAddress : globals_1.Globals.GET_SMART_CONTRACT_ADDRESSES(default_config_1.DefaultConfig.settings.networkID).token;
                    const paymentContract = (yield new PaymentContractController_1.PaymentContractController().getContract(paymentID)).data[0];
                    const blockchainHelper = new BlockchainHelper_1.BlockchainHelper();
                    const rate = yield new HTTPHelper_1.HTTPHelper().request(`${globals_1.Globals.GET_CRYPTOCOMPARE_URL()}data/price?fsym=PMA&tsyms=${paymentContract.currency.toUpperCase()}`, 'GET');
                    const value = blockchainHelper.parseUnits(((Number(paymentContract.amount) / 100) / rate[paymentContract.currency.toUpperCase()]).toString(), 14);
                    const transferFee = yield this.calculateTransferFee(paymentContract.merchantAddress, bankAddress, value, tokenAddress);
                    const executionFee = yield this.calculateMaxExecutionFee(pullPaymentAddress);
                    const calculation = (paymentContract.numberOfPayments * (transferFee + executionFee)) * this.multiplier;
                    resolve(calculation);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    calculateTransferFee(fromAddress, toAddress, value, tokenAddress = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const blockchainHelper = new BlockchainHelper_1.BlockchainHelper();
                tokenAddress = tokenAddress ? tokenAddress : globals_1.Globals.GET_SMART_CONTRACT_ADDRESSES(default_config_1.DefaultConfig.settings.networkID).token;
                const contract = yield new SmartContractReader_1.SmartContractReader(globals_1.Globals.GET_TOKEN_CONTRACT_NAME()).readContract(tokenAddress);
                const data = contract.methods.transfer(toAddress, value).encodeABI();
                try {
                    blockchainHelper.getProvider().estimateGas({
                        to: tokenAddress,
                        from: fromAddress,
                        gasPrice: default_config_1.DefaultConfig.settings.web3.utils.toHex(default_config_1.DefaultConfig.settings.web3.utils.toWei('10', 'Gwei')),
                        gasLimit: default_config_1.DefaultConfig.settings.web3.utils.toHex(4000000),
                        data: data
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
    calculateMaxExecutionFee(pullPaymentAddress = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                pullPaymentAddress = pullPaymentAddress ? pullPaymentAddress : globals_1.Globals.GET_SMART_CONTRACT_ADDRESSES(default_config_1.DefaultConfig.settings.networkID).masterPullPayment;
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
                    address: pullPaymentAddress,
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
                    yield rclient.setAsync(this.maxGasFeeName, Number(max));
                    resolve(Number(yield rclient.getAsync(this.maxGasFeeName)));
                    rclient.quit();
                }));
            }));
        });
    }
}
exports.FundingController = FundingController;
//# sourceMappingURL=FundingController.js.map