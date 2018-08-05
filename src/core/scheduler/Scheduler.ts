import { SchedulerBuffer } from "./ScheduleBuffer";
import { Globals } from "../../utils/globals";
import { IPaymentUpdateDetails } from "../payment/models";
import { ScheduleHelper } from "./ScheduleHelper";
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

    public constructor(private reccuringDetails: IPaymentUpdateDetails, private callback: any) {

    }

    public start() {
        ScheduleHelper.adjustStartTime(this.reccuringDetails);
        this._schedule = schedule.scheduleJob(new Date(Number(this.reccuringDetails.startTimestamp) * 1000), async () => {
            await ScheduleHelper.updatePaymentStatus(this.reccuringDetails, Globals.GET_PAYMENT_STATUS_ENUM().started);
            await this.executeCallback();
            this._interval = this.startInterval();
        });

        return SchedulerBuffer.set(this.reccuringDetails.id, this);
    }

    public static stop(payment_id: string) {
        const scheduler = SchedulerBuffer.get(payment_id);
        if (scheduler) {
            scheduler.instance.cancel();
            if (scheduler.interval) {
                console.log('cleared');
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
            if (this.reccuringDetails.limit == 0) {
                SchedulerBuffer.delete(this.reccuringDetails.id);
            } else {
                this.executeCallback();
            }
        }, this.reccuringDetails.frequency * 1000);
    }

    private async executeCallback() {
        await this.callback();
        await ScheduleHelper.reduceLimit(this.reccuringDetails);
    }

}