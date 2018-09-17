import { Globals } from "../../utils/globals";
import { PaymentContractController } from "../database/PaymentContractController";
import { IPaymentContractView } from "../database/models";
import { SmartContractReader } from "./utils/SmartContractReader";
import { BlockchainHelper } from "./utils/BlockchainHelper";
import { DefaultConfig } from "../../config/default.config";
import { HTTPHelper } from "../../utils/web/HTTPHelper";
const redis = require('redis');
const bluebird = require('bluebird');

export class FundingController {

    private maxGasFeeName = "k_max_gas_fee";
    private lastBlock = "k_last_block";

    public async fund() {

    }

    public async calculateEthToFund(numberOfPayments: number, paymentID: string) {


    }

    public async calculateTransferFee(paymentID: string) {
        return new Promise(async (resolve, reject) => {
            const paymentContract: IPaymentContractView = (await new PaymentContractController().getContract(paymentID)).data[0];

            const contract: any = await new SmartContractReader(Globals.GET_TOKEN_CONTRACT_NAME()).readContract(Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token);
            const blockchainHelper: BlockchainHelper = new BlockchainHelper();

            const rate = await new HTTPHelper().request(`${Globals.GET_CRYPTOCOMPARE_URL()}data/price?fsym=PMA&tsyms=${paymentContract.currency.toUpperCase()}`, 'GET');
            const value = blockchainHelper.parseUnits(((Number(paymentContract.amount) / 100) / rate[paymentContract.currency.toUpperCase()]).toString(), 14);
            const data = contract.methods.transfer(paymentContract.customerAddress, value).encodeABI();

            try {
                blockchainHelper.getProvider().estimateGas({
                    to: Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token,
                    from: paymentContract.merchantAddress,
                    data: data,
                }).then((res) => {
                    resolve(res);
                }).catch(err => {
                    reject(err);
                })
            } catch (err) {
                reject(err);
            }

        });
    }

    public async calculateMaxExecutionFee() {

        return new Promise(async (resolve, reject) => {
            const rclient = redis.createClient({
                port: DefaultConfig.settings.redisPort,
                host: DefaultConfig.settings.redisHost
            });
            bluebird.promisifyAll(redis);
            const bcHelper = new BlockchainHelper();

            let max = Number(await rclient.getAsync(this.maxGasFeeName));
            let fromBlock = Number(await rclient.getAsync(this.lastBlock));

            if (!fromBlock) {
                fromBlock = 0;
                await rclient.setAsync(this.lastBlock, fromBlock);
            }
            max = max ? max : 0;
            await rclient.setAsync(this.maxGasFeeName, max);
            const latestBlock = Number(await bcHelper.getProvider().getBlockNumber());

            bcHelper.getProvider().getPastLogs({
                fromBlock: DefaultConfig.settings.web3.utils.toHex(fromBlock),
                toBlock: latestBlock ? DefaultConfig.settings.web3.utils.toHex(latestBlock) : 'latest',
                address: Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).masterPullPayment,
                topics: Globals.GET_PULL_PAYMENT_TOPICS(DefaultConfig.settings.networkID).execute
            }, async (err, res) => {
                if (err) {
                    reject(err);
                }

                for (const log of res) {
                    const receipt = await bcHelper.getProvider().getTransactionReceipt(log.transactionHash);
                    if (receipt) {
                        if (receipt.gasUsed > max) max = receipt.gasUsed;
                    }
                }

                rclient.setAsync(this.lastBlock, latestBlock ? latestBlock : res[0].blockNumber);
                await rclient.setAsync(this.maxGasFeeName, Number(max));
                resolve(Number(await rclient.getAsync(this.maxGasFeeName)));
                rclient.quit();
            });
        });

    }

    public async test() {

        return new Promise(async (resolve, reject) => {
            resolve('TESTING 3');
        });
    }
}