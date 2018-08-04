import { Globals } from "../../utils/globals";
import { PaymentDbConnector } from "../../connector/dbConnector/paymentsDBconnector";
import { IPaymentUpdateDetails } from "../payment/models";

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
            reccuringDetails.endTimestamp = Math.floor(reccuringDetails.startTimestamp + reccuringDetails.frequency * reccuringDetails.limit);
            const data = (await new PaymentDbConnector().updatePayment(reccuringDetails).catch(() => {})).data;
            reccuringDetails = data ? data : reccuringDetails;
        }
    }

    public static async updatePaymentStatus(reccuringDetails: IPaymentUpdateDetails, status: number) {
        reccuringDetails.status = status;
        await new PaymentDbConnector().updatePayment(reccuringDetails).catch(() => {});
    }

    public static async reduceLimit(reccuringDetails: IPaymentUpdateDetails) {
        reccuringDetails.limit = reccuringDetails.limit - 1;
        await new PaymentDbConnector().updatePayment(reccuringDetails).catch(() => {});
    }

}