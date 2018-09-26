import { Globals } from "../../utils/globals";
import { PullPaymentController } from "../database/PullPaymentController";
import { IPullPaymentView } from "../database/models";
import { SmartContractReader } from "./utils/SmartContractReader";
import { BlockchainHelper } from "./utils/BlockchainHelper";
import { DefaultConfig } from "../../config/default.config";
import { HTTPHelper } from "../../utils/web/HTTPHelper";
import { RawTransactionSerializer } from "./utils/RawTransactionSerializer";
import {BlockType} from "web3/types";
const redis = require('redis');
const bluebird = require('bluebird');
const Tx = require('ethereumjs-tx');

export class FundingController {
    private maxGasFeeName = "k_max_gas_fee";
    private lastBlock = "k_last_block";
    private multiplier = 1.5;

    /**
     * @description Method for transfering ETH from one address to another
     * @param fromAddress Address from wich you want to send ETH's
     * @param toAddress Address to wich you want to receive ETH's
     * @param paymentID (optional) ID of the payment entity that you want to fund
     * @param value (optional) ** Must send pullPaymentID as well with this param ** Amount that you want to fund
     * @param tokenAddress (optional) Address of the token contract
     * @param pullPaymentAddress (optional) Address of the master pull payment contract
     */
    public async fundETH(fromAddress: string, toAddress: string, paymentID: string, value: any = null, tokenAddress: string = null, pullPaymentAddress: string = null) {
        const bcHelper = new BlockchainHelper();
        if (!value) {
            value = await this.calculateWeiToFund(paymentID, fromAddress, tokenAddress, pullPaymentAddress);
            value = value * bcHelper.utils().toWei('10', 'Gwei');
        }
        let privateKey = Buffer.from((await DefaultConfig.settings.getPrivateKey(fromAddress)).data[0]['@accountKey'], 'hex');
        const nonce = await new BlockchainHelper().getTxCount(fromAddress);

        const rawTx = {
            nonce: nonce,
            gasPrice: bcHelper.utils().toHex(bcHelper.utils().toWei('10', 'Gwei')),
            gasLimit: bcHelper.utils().toHex(300000),
            to: toAddress,
            from: fromAddress,
            value: value
        };

        const tx = new Tx(rawTx);
        tx.sign(privateKey);
        privateKey = null;

        const serializedTx = tx.serialize();

        return await bcHelper.getProvider().sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    /**
     * @description Method for transfering PMA tokens from one address to another
     * @param fromAddress Address from wich you want to send PMA's
     * @param toAddress Address to wich you want to receive PMA's
     * @param value Value of PMA's that you want to transfer in WEI
     * @param tokenAddress (optional) Address of the token contract
     */
    public async fundPMA(fromAddress: string, toAddress: string, value: number, tokenAddress: string = null) {
        tokenAddress = tokenAddress ? tokenAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token;

        const contract: any = await new SmartContractReader(Globals.GET_TOKEN_CONTRACT_NAME()).readContract(tokenAddress);
        const gasLimit = await this.calculateTransferFee(fromAddress, toAddress, value, tokenAddress);
        const data = contract.methods.transfer(toAddress, value).encodeABI();
        const blockchainHelper: BlockchainHelper = new BlockchainHelper();
        const txCount: number = await blockchainHelper.getTxCount(fromAddress);
        let privateKey: string = (await DefaultConfig.settings.getPrivateKey(fromAddress)).data[0]['@accountKey'];
        const serializedTx: string = await new RawTransactionSerializer(data, tokenAddress, txCount, privateKey, gasLimit * 3).getSerializedTx();
        privateKey = null;
        console.debug('funding PMA...', value);
        return blockchainHelper.getProvider().sendSignedTransaction(serializedTx);
    }

    public async calculateWeiToFund(paymentID: string, bankAddress: string, tokenAddress: string = null, pullPaymentAddress: string = null) {
        return new Promise(async (resolve, reject) => {
            try {
                tokenAddress = tokenAddress ? tokenAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token;
                const paymentContract: IPullPaymentView = (await new PullPaymentController().getPullPayment(paymentID)).data[0];
                const rate = await new HTTPHelper().request(`${Globals.GET_CRYPTOCOMPARE_URL()}data/price?fsym=PMA&tsyms=${paymentContract.currency.toUpperCase()}`, 'GET');
                const bcHelper = new BlockchainHelper();

                const amount = ((Number(paymentContract.amount) / 100) / rate[paymentContract.currency.toUpperCase()]);
                const value = bcHelper.toWei(amount.toString());

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

            tokenAddress = tokenAddress ? tokenAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token;
            const contract: any = await new SmartContractReader(Globals.GET_TOKEN_CONTRACT_NAME()).readContract(tokenAddress);
            const data = contract.methods.transfer(toAddress, value).encodeABI();

            try {
                new BlockchainHelper().getProvider().estimateGas({
                    to: tokenAddress,
                    from: Globals.GET_PMA_ESTIMATE_ADDRESS(DefaultConfig.settings.networkID),
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

            const rclient = redis.createClient(
                Number(DefaultConfig.settings.redisPort),
                DefaultConfig.settings.redisHost
            );
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
                fromBlock: DefaultConfig.settings.web3.utils.toHex(fromBlock) as BlockType,
                toBlock: (latestBlock ? DefaultConfig.settings.web3.utils.toHex(latestBlock) : 'latest') as BlockType,
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