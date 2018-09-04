import { Globals } from '../../utils/globals';
import { IPaymentContractUpdate } from '../database/models';
import { PaymentContractController } from '../database/PaymentContractController';

/**
 * @description Scheduler, started and created through monitorTransaction function.
 * @method start Start method called when creating a new scheduler to actualy start a new job
 * @method stop Called from anywhere, static method with parameter scheduler_id which is the same as payment_id
 * @method restart Called from anywhere, static method with parameters {scheduler_id}: string which is the same as payment_id
 * {contract}: any which is the details for the reccuring payment
 */
export class ScheduleHelper {

    /**
     * @description Adjusts the start timestamp if the start timestamp is in the 5 min window in past of the current time
     */
    public static async adjustStartTime(contract: IPaymentContractUpdate) {
        const currentTime = Number(new Date().getTime() / 1000);
        if (Number(contract.startTimestamp) <= currentTime && Number(contract.startTimestamp) + Globals.GET_START_SCHEDULER_TIME_WINDOW() >= currentTime) {
            contract.startTimestamp = Math.floor(Number(currentTime + 1));
            await new PaymentContractController().updateContract(contract);
        }
    }

    public static async updateContractStatus(contract: IPaymentContractUpdate, status: number) {
        contract.statusID = status;
        await new PaymentContractController().updateContract(contract);
    }

    public static async getContract(contractID: string) {
        try {
            return (await new PaymentContractController().getContract(contractID).catch((err) => {console.log(err)})).data[0];
        } catch(err) {
            return null;
        }
    }

}