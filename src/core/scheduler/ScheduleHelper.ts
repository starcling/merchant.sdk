import { Globals } from '../../utils/globals';
import { IPullPaymentUpdate } from '../database/models';
import { PullPaymentController } from '../database/PullPaymentController';

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
    public static async adjustStartTime(pullPayment: IPullPaymentUpdate) {
        const currentTime = Number(new Date().getTime() / 1000);
        if (Number(pullPayment.startTimestamp) <= currentTime && Number(pullPayment.startTimestamp) + Globals.GET_START_SCHEDULER_TIME_WINDOW() >= currentTime) {
            pullPayment.startTimestamp = Math.floor(Number(currentTime + 1));
            await new PullPaymentController().updatePullPayment(pullPayment);
        }
    }

    public static async updatePaymentStatus(pullPayment: IPullPaymentUpdate, status: number) {
        pullPayment.statusID = status;
        await new PullPaymentController().updatePullPayment(pullPayment);
    }

    public static async getPullPayment(pullPaymentID: string) {
        try {
            return (await new PullPaymentController().getPullPayment(pullPaymentID).catch((err) => {console.log(err)})).data[0];
        } catch(err) {
            return null;
        }
    }

}