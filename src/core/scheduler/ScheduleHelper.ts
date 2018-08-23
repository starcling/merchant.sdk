import { Globals } from '../../utils/globals';
import { IPaymentUpdateDetails } from '../payment/models';
import { PaymentController } from '../payment/PaymentController';

/**
 * @description Scheduler, started and created through monitorTransaction function.
 * @method start Start method called when creating a new scheduler to actualy start a new job
 * @method stop Called from anywhere, static method with parameter scheduler_id which is the same as payment_id
 * @method restart Called from anywhere, static method with parameters {scheduler_id}: string which is the same as payment_id
 * {reccuringDetails}: any which is the details for the reccuring payment
 */
export class ScheduleHelper {

    /**
     * @description Adjusts the start timestamp if the start timestamp is in the 5 min window in past of the current time
     */
    public static async adjustStartTime(reccuringDetails: IPaymentUpdateDetails) {
        const currentTime = Number(new Date().getTime() / 1000);
        if (Number(reccuringDetails.startTimestamp) <= currentTime && Number(reccuringDetails.startTimestamp) + Globals.GET_START_SCHEDULER_TIME_WINDOW() >= currentTime) {
            reccuringDetails.startTimestamp = Math.floor(Number(currentTime + 1));
            await new PaymentController().updatePayment(reccuringDetails);
        }
    }

    public static async updatePaymentStatus(reccuringDetails: IPaymentUpdateDetails, status: number) {
        reccuringDetails.status = status;
        await new PaymentController().updatePayment(reccuringDetails);
    }

    public static async getPayment(paymentID: string) {
        try {
            return (await new PaymentController().getPayment(paymentID).catch((err) => {console.log(err)})).data[0];
        } catch(err) {
            return null;
        }
    }

}