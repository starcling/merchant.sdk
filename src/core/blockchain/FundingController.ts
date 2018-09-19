import { Globals } from "../../utils/globals";
import { PaymentContractController } from "../database/PaymentContractController";
import { IPaymentContractView } from "../database/models";
import { SmartContractReader } from "./utils/SmartContractReader";
import { BlockchainHelper } from "./utils/BlockchainHelper";
import { DefaultConfig } from "../../config/default.config";
import { HTTPHelper } from "../../utils/web/HTTPHelper";
import { RawTransactionSerializer } from "./utils/RawTransactionSerializer";
const redis = require('redis');
const bluebird = require('bluebird');

export class FundingController {
    private maxGasFeeName = "k_max_gas_fee";
    private lastBlock = "k_last_block";
    private multiplier = 1.5;

    public async fundETH(fromAddress: string, toAddress: string, paymentID: string = null, value: any = null, tokenAddress: string = null, pullPaymentAddress: string = null) {
        tokenAddress = tokenAddress ? tokenAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token;
        pullPaymentAddress = pullPaymentAddress ? pullPaymentAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).masterPullPayment;
        value = value ? value : await this.calculateWeiToFund(paymentID, fromAddress, tokenAddress, pullPaymentAddress);
        const gasValue = value * DefaultConfig.settings.web3.utils.toWei('10', 'Gwei');
        const blockchainHelper: BlockchainHelper = new BlockchainHelper();
        const rawTx = {
            to: toAddress,
            from: fromAddress,
            value: DefaultConfig.settings.web3.utils.toHex(gasValue)
        };

        return blockchainHelper.getProvider().sendTransaction(rawTx);
    }

    public async fundPMA(fromAddress: string, toAddress: string, value: number, tokenAddress: string = null) {
        tokenAddress = tokenAddress ? tokenAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token;

        const contract: any = await new SmartContractReader(Globals.GET_TOKEN_CONTRACT_NAME()).readContract(tokenAddress);
        const gasLimit = await this.calculateTransferFee(fromAddress, toAddress, value, tokenAddress);
        const data = contract.methods.transfer(toAddress, value).encodeABI();
        const blockchainHelper: BlockchainHelper = new BlockchainHelper();
        const txCount: number = await blockchainHelper.getTxCount(fromAddress);
        let privateKey: string = (await DefaultConfig.settings.getPrivateKey(fromAddress)).data[0]['@accountKey'];
        const serializedTx: string = await new RawTransactionSerializer(data, tokenAddress, txCount, privateKey, gasLimit).getSerializedTx();
        privateKey = null;
        
        return blockchainHelper.getProvider().sendSignedTransaction(serializedTx);
    }

    public async calculateWeiToFund(paymentID: string, bankAddress: string, tokenAddress: string = null, pullPaymentAddress: string = null) {
        return new Promise(async (resolve, reject) => {
            try {
                tokenAddress = tokenAddress ? tokenAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token;
                const paymentContract: IPaymentContractView = (await new PaymentContractController().getContract(paymentID)).data[0];
                const blockchainHelper: BlockchainHelper = new BlockchainHelper();
                const rate = await new HTTPHelper().request(`${Globals.GET_CRYPTOCOMPARE_URL()}data/price?fsym=PMA&tsyms=${paymentContract.currency.toUpperCase()}`, 'GET');
                const value = blockchainHelper.parseUnits(((Number(paymentContract.amount) / 100) / rate[paymentContract.currency.toUpperCase()]).toString(), 14);

                const transferFee = await this.calculateTransferFee(paymentContract.merchantAddress, bankAddress, value, tokenAddress);
                const executionFee = await this.calculateMaxExecutionFee(pullPaymentAddress);

                const calculation = (paymentContract.numberOfPayments * (transferFee + executionFee)) * this.multiplier;
                resolve(calculation);
            } catch (err) {
                reject(err);
            }
        });
    }

    public async calculateTransferFee(fromAddress: string, toAddress: string, value: number, tokenAddress: string = null): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {

            const blockchainHelper: BlockchainHelper = new BlockchainHelper();
            tokenAddress = tokenAddress ? tokenAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token;
            const contract: any = await new SmartContractReader(Globals.GET_TOKEN_CONTRACT_NAME()).readContract(tokenAddress);
            const data = contract.methods.transfer(toAddress, value).encodeABI();

            try {
                blockchainHelper.getProvider().estimateGas({
                    to: tokenAddress,
                    from: fromAddress,
                    gasPrice: DefaultConfig.settings.web3.utils.toHex(DefaultConfig.settings.web3.utils.toWei('10', 'Gwei')),
                    gasLimit: DefaultConfig.settings.web3.utils.toHex(4000000),
                    value: '0x00',
                    data: data
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

    public async calculateMaxExecutionFee(pullPaymentAddress: string = null): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            pullPaymentAddress = pullPaymentAddress ? pullPaymentAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).masterPullPayment;

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
            max = max ? max : Globals.GET_MAX_GAS_FEE();
            await rclient.setAsync(this.maxGasFeeName, max);
            const latestBlock = Number(await bcHelper.getProvider().getBlockNumber());

            bcHelper.getProvider().getPastLogs({
                fromBlock: DefaultConfig.settings.web3.utils.toHex(fromBlock),
                toBlock: latestBlock ? DefaultConfig.settings.web3.utils.toHex(latestBlock) : 'latest',
                address: pullPaymentAddress,
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
}