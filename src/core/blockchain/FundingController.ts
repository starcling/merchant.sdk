import { Globals } from "../../utils/globals";
import { PaymentContractController } from "../database/PaymentContractController";
import { IPaymentContractView } from "../database/models";
import { SmartContractReader } from "./SmartContractReader";
import { BlockchainHelper } from "./BlockchainHelper";
import { DefaultConfig } from "../../config/default.config";
const redis = require('redis');
const bluebird = require('bluebird');

// import { DefaultConfig } from "../../config/default.config";
// import { RawTransactionSerializer } from "./signatureHelper/RawTransactionSerializer";

export class FundingController {

    private maxGasFeeName = "k_max_gas_fee";
    private lastBlock = "k_last_block";

    public async calculateEth(numberOfPayments: number, paymentID: string) {

        return new Promise(async (resolve, reject) => {
            const paymentContract: IPaymentContractView = (await new PaymentContractController().getContract(paymentID)).data[0];

            const contract: any = await new SmartContractReader(Globals.GET_PULL_PAYMENT_CONTRACT_NAME()).readContract(paymentContract.pullPaymentAddress);
            const blockchainHelper: BlockchainHelper = new BlockchainHelper();
            // const txCount: number = await blockchainHelper.getTxCount(paymentContract.merchantAddress);
            const data = contract.methods.executePullPayment(paymentContract.customerAddress, paymentContract.id).encodeABI();
            // let privateKey: string = (await DefaultConfig.settings.getPrivateKey(paymentContract.merchantAddress)).data[0]['@accountKey'];
            // const serializedTx: string = await new RawTransactionSerializer(data, paymentContract.pullPaymentAddress, txCount, privateKey).getSerializedTx();
            // privateKey = null;


            try {
                // contract.methods.executePullPayment(paymentContract.customerAddress, paymentContract.id).estimateGas({
                //     gas: 4000000,
                //     value: '0x0',
                //     from: paymentContract.merchantAddress
                // }).then(res => {
                //     resolve(res);
                // }).catch(err => {
                //     reject(err);
                // })
                blockchainHelper.getProvider().estimateGas({
                    to: paymentContract.pullPaymentAddress,
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

    public async calculateMaxGasFee() {

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