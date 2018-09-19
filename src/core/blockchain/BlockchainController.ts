import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { SmartContractReader } from './utils/SmartContractReader';
import { BlockchainHelper } from './utils/BlockchainHelper';
import { RawTransactionSerializer } from './utils/RawTransactionSerializer';
import { Scheduler } from '../scheduler/Scheduler';
import { ErrorHandler } from '../../utils/handlers/ErrorHandler';
import { BlockchainTxReceiptHandler } from './utils/BlockchainTxReceiptHandler';
import { TransactionController } from '../database/TransactionController';
import { PaymentContractController } from '../database/PaymentContractController';
import { ITransactionUpdate, IPaymentContractView, ITransactionGet, ITransactionInsert } from '../database/models';
import { FundingController } from './FundingController';
import { CashOutController } from './CashOutController';

export class BlockchainController {
    private transactionDbController: TransactionController;
    private contractDbController: PaymentContractController;

    public constructor() {
        this.transactionDbController = new TransactionController();
        this.contractDbController = new PaymentContractController();
    }

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain and upon receiving receipt 
    * to create a scheduler that will execute the pull payment
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @param {string} contractID: ID of the contract registration which status is to be updated
    * @returns {boolean} success/fail response
    */
    protected async monitorRegistrationTransaction(txHash: string, contractID: string) {
        try {
            const sub = setInterval(async () => {
                const bcHelper = new BlockchainHelper();
                const receipt = await bcHelper.getProvider().getTransactionReceipt(txHash);
                if (receipt) {
                    clearInterval(sub);
                    const status = receipt.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;

                    const contractResponse = await this.transactionDbController.updateTransaction(<ITransactionUpdate>{
                        hash: receipt.transactionHash,
                        statusID: status
                    })
                    const contract: IPaymentContractView = (await this.contractDbController.getContract(contractID)).data;
                    const payment = contractResponse.data[0];

                    if (receipt.status && bcHelper.isValidRegisterTx(receipt, contractID)) {
                        if (contract.type == Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().singlePull] ||
                            contract.type == Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {
                            this.executePullPayment(contractID);
                        }

                        if (payment.type !== Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().singlePull]) {
                            new Scheduler(contractID, async () => {
                                this.executePullPayment(contractID);
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
    * @param {string} contractID: ID of the payment which cancellation status is to be updated
    * @returns {boolean} success/fail response
    */
    protected async monitorCancellationTransaction(txHash: string, contractID: string) {
        try {
            const sub = setInterval(async () => {
                const receipt = await new BlockchainHelper().getProvider().getTransactionReceipt(txHash);
                if (receipt) {
                    clearInterval(sub);
                    const status = receipt.status ? Globals.GET_TRANSACTION_STATUS_ENUM().success : Globals.GET_TRANSACTION_STATUS_ENUM().failed;
                    await this.transactionDbController.updateTransaction(<ITransactionUpdate>{
                        hash: receipt.transactionHash,
                        statusID: status
                    });
                    if (receipt.status) {
                        const contract = (await this.contractDbController.getContract(contractID)).data[0];
                        Scheduler.stop(contract.id);
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
    public async executePullPayment(contractID?: string): Promise<void> {
        const transactionDbController = new TransactionController();
        const contractDbController = new PaymentContractController();
        const paymentContract: IPaymentContractView = (await contractDbController.getContract(contractID)).data[0];
        ErrorHandler.validatePullPaymentExecution(paymentContract);

        const contract: any = await new SmartContractReader(Globals.GET_PULL_PAYMENT_CONTRACT_NAME()).readContract(paymentContract.pullPaymentAddress);
        const blockchainHelper: BlockchainHelper = new BlockchainHelper();
        const txCount: number = await blockchainHelper.getTxCount(paymentContract.merchantAddress);
        const data: string = contract.methods.executePullPayment(paymentContract.customerAddress, paymentContract.id).encodeABI();
        let privateKey: string = (await DefaultConfig.settings.getPrivateKey(paymentContract.merchantAddress)).data[0]['@accountKey'];
        const gasLimit = await new FundingController().calculateMaxExecutionFee();
        const serializedTx: string = await new RawTransactionSerializer(data, paymentContract.pullPaymentAddress, txCount, privateKey, gasLimit * 3).getSerializedTx();
        privateKey = null;

        await blockchainHelper.executeSignedTransaction(serializedTx).on('transactionHash', async (hash) => {

            let typeID = Globals.GET_TRANSACTION_TYPE_ENUM().execute;
            if (paymentContract.type == Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {

                try {
                    await transactionDbController.getTransactions(<ITransactionGet>{
                        contractID: paymentContract.id,
                        typeID: Globals.GET_TRANSACTION_TYPE_ENUM().initial
                    });
                } catch (err) {
                    typeID = Globals.GET_TRANSACTION_TYPE_ENUM().initial;
                }
            }
            await transactionDbController.createTransaction(<ITransactionInsert>{
                hash: hash,
                typeID: typeID,
                contractID: paymentContract.id,
                timestamp: Math.floor(new Date().getTime() / 1000)
            });
        }).on('receipt', async (receipt) => {
            if (paymentContract.type == Globals.GET_PAYMENT_TYPE_ENUM_NAMES()[Globals.GET_PAYMENT_TYPE_ENUM().recurringWithInitial]) {
                try {
                    await transactionDbController.getTransactions(<ITransactionGet>{
                        contractID: paymentContract.id,
                        typeID: Globals.GET_TRANSACTION_TYPE_ENUM().initial,
                        statusID: Globals.GET_TRANSACTION_STATUS_ENUM().success
                    });
                    await new BlockchainTxReceiptHandler().handleRecurringPaymentReceipt(paymentContract, receipt.transactionHash, receipt);
                } catch (err) {
                    await new BlockchainTxReceiptHandler().handleRecurringPaymentWithInitialReceipt(paymentContract, receipt.transactionHash, receipt);
                }
            } else {
                await new BlockchainTxReceiptHandler().handleRecurringPaymentReceipt(paymentContract, receipt.transactionHash, receipt);
            }

            if (paymentContract.automatedCashOut && receipt.status) {
                await new CashOutController().cashOutPMA(contractID);
            }

        }).catch((err) => {
            // TODO: Proper error handling 
            console.debug(err);
        });
    }
}
