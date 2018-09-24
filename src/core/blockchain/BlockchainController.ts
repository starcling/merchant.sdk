import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './utils/SmartContractReader';
import { BlockchainHelper } from './utils/BlockchainHelper';
import { RawTransactionSerializer } from './utils/RawTransactionSerializer';
import { Scheduler } from '../scheduler/Scheduler';
import { ErrorHandler } from '../../utils/handlers/ErrorHandler';
import { BlockchainTxReceiptHandler } from './utils/BlockchainTxReceiptHandler';
import { TransactionController } from '../database/TransactionController';
import { PullPaymentController } from '../database/PullPaymentController';
import { ITransactionUpdate, IPullPaymentView, ITransactionGet, ITransactionInsert } from '../database/models';
import { FundingController } from './FundingController';
import { CashOutController } from './CashOutController';

export class BlockchainController {
    private transactionController: TransactionController;
    private paymentController: PullPaymentController;

    public constructor() {
        this.transactionController = new TransactionController();
        this.paymentController = new PullPaymentController();
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain and upon receiving receipt 
    * to create a scheduler that will execute the pull payment
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} pullPaymentID: ID of the contract registration which status is to be updated
    * @returns {boolean} success/fail response
    */
    protected async monitorRegistrationTransaction(txHash: string, pullPaymentID: string) {
        try {
            const sub = setInterval(async () => {
                const bcHelper = new BlockchainHelper();
                const receipt = await bcHelper.getProvider().getTransactionReceipt(txHash);
                if (receipt) {
                    clearInterval(sub);
                    const status = receipt.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;

                    await this.transactionController.updateTransaction(<ITransactionUpdate>{
                        hash: receipt.transactionHash,
                        statusID: status
                    });
                    const pullPayment: IPullPaymentView = (await this.paymentController.getPullPayment(pullPaymentID)).data[0];

                    if (receipt.status && bcHelper.isValidRegisterTx(receipt, pullPaymentID)) {
                        if (pullPayment.type == Globals.GET_PULL_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().singlePull] ||
                            pullPayment.type == Globals.GET_PULL_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {
                            this.executePullPayment(pullPaymentID);
                        }

                        if (pullPayment.type !== Globals.GET_PULL_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().singlePull]) {
                            new Scheduler(pullPaymentID, async () => {
                                this.executePullPayment(pullPaymentID);
                            }).start();
                        }
                    } else {
                        return false;
                    }

                }
            }, DefaultConfig.settings.txStatusInterval);

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain and upon receiving receipt 
    * to stop the scheduler that executes the pull payment
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} pullPaymentID: ID of the payment which cancellation status is to be updated
    * @returns {boolean} success/fail response
    */
    protected async monitorCancellationTransaction(txHash: string, pullPaymentID: string) {
        try {
            const sub = setInterval(async () => {
                const receipt = await new BlockchainHelper().getProvider().getTransactionReceipt(txHash);
                if (receipt) {
                    clearInterval(sub);
                    const status = receipt.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;
                    await this.transactionController.updateTransaction(<ITransactionUpdate>{
                        hash: receipt.transactionHash,
                        statusID: status
                    });
                    if (receipt.status) {
                        const pullPayment = (await this.paymentController.getPullPayment(pullPaymentID)).data[0];
                        Scheduler.stop(pullPayment.id);
                    }
                }
            }, DefaultConfig.settings.txStatusInterval);

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
    * @description Method for actual execution of pull payment
    * @returns {object} null
    */
    public async executePullPayment(pullPaymentID?: string): Promise<void> {
        const transactionController = new TransactionController();
        const pullPaymentController = new PullPaymentController();
        const pullPayment: IPullPaymentView = (await pullPaymentController.getPullPayment(pullPaymentID)).data[0];
        ErrorHandler.validatePullPaymentExecution(pullPayment);

        const contract: any = await new SmartContractReader(Globals.GET_PULL_PAYMENT_CONTRACT_NAME()).readContract(pullPayment.pullPaymentAddress);
        const blockchainHelper: BlockchainHelper = new BlockchainHelper();
        const txCount: number = await blockchainHelper.getTxCount(pullPayment.merchantAddress);
        const data: string = contract.methods.executePullPayment(pullPayment.customerAddress, pullPayment.id).encodeABI();
        let privateKey: string = (await DefaultConfig.settings.getPrivateKey(pullPayment.merchantAddress)).data[0]['@accountKey'];
        const gasLimit = await new FundingController().calculateMaxExecutionFee();
        const serializedTx: string = await new RawTransactionSerializer(data, pullPayment.pullPaymentAddress, txCount, privateKey, gasLimit * 3).getSerializedTx();
        privateKey = null;

        await blockchainHelper.executeSignedTransaction(serializedTx).on('transactionHash', async (hash) => {

            let typeID = Globals.GET_TRANSACTION_TYPE_ENUM().execute;
            if (pullPayment.type == Globals.GET_PULL_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {

                try {
                    await transactionController.getTransactions(<ITransactionGet>{
                        pullPaymentID: pullPayment.id,
                        typeID: Globals.GET_TRANSACTION_TYPE_ENUM().initial
                    });
                } catch (err) {
                    typeID = Globals.GET_TRANSACTION_TYPE_ENUM().initial;
                }
            }
            await transactionController.createTransaction(<ITransactionInsert>{
                hash: hash,
                typeID: typeID,
                pullPaymentID: pullPayment.id,
                timestamp: Math.floor(new Date().getTime() / 1000)
            });
        }).on('receipt', async (receipt) => {
            if (pullPayment.type == Globals.GET_PULL_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {
                try {
                    await transactionController.getTransactions(<ITransactionGet>{
                        pullPaymentID: pullPayment.id,
                        typeID: Globals.GET_TRANSACTION_TYPE_ENUM().initial,
                        statusID: Globals.GET_TRANSACTION_STATUS_ENUM().success
                    });
                    await new BlockchainTxReceiptHandler().handleRecurringPaymentReceipt(pullPayment, receipt.transactionHash, receipt);
                } catch (err) {
                    await new BlockchainTxReceiptHandler().handleRecurringPaymentWithInitialReceipt(pullPayment, receipt.transactionHash, receipt);
                }
            } else {
                await new BlockchainTxReceiptHandler().handleRecurringPaymentReceipt(pullPayment, receipt.transactionHash, receipt);
            }

            if (pullPayment.automatedCashOut && receipt.status) {
                await new CashOutController().cashOutPMA(pullPaymentID);
            }

        }).catch((err) => {
            // TODO: Proper error handling 
            console.debug(err);
        });
    }
}
