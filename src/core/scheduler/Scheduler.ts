import { SchedulerBuffer } from "./ScheduleBuffer";
import { Globals } from "../../utils/globals";
import { PaymentDbConnector } from "../../connector/dbConnector/paymentsDBconnector";
const schedule = require('node-schedule');

/**
 * @description Scheduler, started and created through monitorTransaction function.
 * @method start Start method called when creating a new scheduler to actualy start a new job
 * @method stop Called from anywhere, static method with parameter scheduler_id which is the same as payment_id
 * @method restart Called from anywhere, static method with parameters {scheduler_id}: string which is the same as payment_id
 * {reccuringDetails}: any which is the details for the reccuring payment
 */
export class Scheduler {

    private _interval = null;
    private _schedule = null;

    public constructor(private reccuringDetails: any, private callback: any) {

    }

    public start() {
        this.adjustStartTime();
        this._schedule = schedule.scheduleJob(new Date(Number(this.reccuringDetails.startTimestamp) * 1000), () => {
            this.updatePaymentStatus(Globals.GET_PAYMENT_STATUS_ENUM().started);
            this.callback();
            this._interval = this.startInterval();
        });

        return SchedulerBuffer.set(this.reccuringDetails.id, this);
    }

    public static stop(payment_id: string) {
        const scheduler = SchedulerBuffer.get(payment_id);
        if (scheduler) {
            scheduler.instance.cancel();
            if (scheduler.interval) {
                clearInterval(scheduler.interval);
            }
        }
    }

    public static restart(payment_id: string, reccuringDetails: any) {
        const scheduler = SchedulerBuffer.get(payment_id);
        if (scheduler) {
            scheduler.instance.reschedule(reccuringDetails);
        }
    }

    public get interval() {
        return this._interval;
    }

    public get instance() {
        return this._schedule;
    }

    private startInterval() {
        return setInterval(() => {
            if (new Date().getTime() > Number(this.reccuringDetails.endTimestamp) * 1000) {
                SchedulerBuffer.delete(this.reccuringDetails.id);
            } else {
                this.callback();
            }
        }, this.reccuringDetails.frequency * 1000);
    }

    /**
     * @description Adjusts the start timestamp if the start timestamp is in the 5 min window in past of the current time
     */
    private adjustStartTime() {
        const currentTime = Number(new Date().getTime() / 1000);
        if (Number(this.reccuringDetails.startTimestamp) < currentTime && Number(this.reccuringDetails.startTimestamp) + Globals.GET_START_SCHEDULER_TIME_WINDOW() > currentTime) {
            this.reccuringDetails.startTimestamp = Number(currentTime + 1);
            new PaymentDbConnector().updatePayment(this.reccuringDetails).catch(() => {});
        }
    }

    private updatePaymentStatus(status: number) {
        this.reccuringDetails.status = status;
        new PaymentDbConnector().updatePayment(this.reccuringDetails).catch(() => {});
    }

}