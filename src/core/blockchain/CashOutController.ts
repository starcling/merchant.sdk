import { PullPaymentController } from "../database/PullPaymentController";
import { IPullPaymentView } from "../database/models";
import { FundingController } from "./FundingController";
import { DefaultConfig } from "../../config/default.config";
import { SmartContractReader } from "./utils/SmartContractReader";
import { Globals } from "../../utils/globals";
import { BlockchainHelper } from "./utils/BlockchainHelper";

export class CashOutController {

    private min = 20000;
    private max = 50000;

    private paymentController: PullPaymentController;
    constructor() {
        this.paymentController = new PullPaymentController();
    }

    public async cashOutPMA(paymentID: string, tokenAddress: string = null) {
        const payment: IPullPaymentView = (await this.paymentController.getPullPayment(paymentID)).data[0];

        if (!((payment.initialNumberOfPayments - payment.numberOfPayments) % payment.cashOutFrequency)) {
            const balance = await this.getBalance(payment.merchantAddress, tokenAddress);
            await new FundingController().fundPMA(payment.merchantAddress, DefaultConfig.settings.bankAddress, balance, tokenAddress);
        }
    }

    public async cashOutETH(paymentID: string, tokenAddress: string = null) {
        const payment: IPullPaymentView = (await this.paymentController.getPullPayment(paymentID)).data[0];
        const fundingController = new FundingController();

        const balance = await new BlockchainHelper().getProvider().getBalance(payment.merchantAddress);
        const initalFee = Math.floor(Math.random() * (this.max - this.min) + this.min) * DefaultConfig.settings.web3.utils.toWei('10', 'Gwei');

        const gasFee = DefaultConfig.settings.web3.utils.toWei('10', 'Gwei') * 21000;
        const fundETH = async (gasFee) => {
            await fundingController.fundETH(payment.merchantAddress, DefaultConfig.settings.bankAddress, null, balance - gasFee, tokenAddress).catch(async err => {
                await fundETH(gasFee + gasFee / 5);
            });
        }

        await fundETH(gasFee + initalFee);
    }

    private async getBalance(address: string, tokenAddress: string = null) {
        tokenAddress = tokenAddress ? tokenAddress : Globals.GET_SMART_CONTRACT_ADDRESSES(DefaultConfig.settings.networkID).token;
        const contract: any = await new SmartContractReader(Globals.GET_TOKEN_CONTRACT_NAME()).readContract(tokenAddress);

        return await contract.methods.balanceOf(address).call({ from: address });
    }

}