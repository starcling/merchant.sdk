import { SchedulerBuffer } from "./ScheduleBuffer";
import { Globals } from "../../utils/globals";
import { IPaymentUpdateDetails } from "../payment/models";
import { ScheduleHelper } from "./ScheduleHelper";
import { ScheduleQueue } from "./ScheduleQueue";
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

    public start(reinitialized: boolean = false) {
        if (!reinitialized) ScheduleHelper.adjustStartTime(this.reccuringDetails);
        this._schedule = this.scheduleJob();
        return SchedulerBuffer.set(this.reccuringDetails.id, this);
    }

    /**
     * @description Stops the scheduler
     * @param payment_id ID of the payment and the scheduler aswell
     * @returns {object} ID of scheduler if it is stopped, null if scheduler was not found.
     */
    public static stop(payment_id: string) {
        const scheduler = SchedulerBuffer.get(payment_id);
        if (scheduler) {

            if (scheduler._schedule) {
                scheduler._schedule.cancel();
            }

            if (scheduler.interval) {
                clearInterval(scheduler.interval);
            }

            ScheduleHelper.updatePaymentStatus(scheduler.reccuringDetails, Globals.GET_PAYMENT_STATUS_ENUM().stopped);

            return scheduler.reccuringDetails.id;
        }

        return null;
    }

    /**
     * @description Restarts the stopped scheduler
     * @param payment_id ID of the payment and the scheduler aswell
     * @returns {object} ID of scheduler if it is restarted, null if scheduler was not found or is already running or done.
     */
    public static restart(payment_id: string) {
        const scheduler = SchedulerBuffer.get(payment_id);

        if (scheduler && scheduler.reccuringDetails.status == Globals.GET_PAYMENT_STATUS_ENUM().stopped) {

            (async () => {
                const data = await ScheduleHelper.updatePaymentStatus(scheduler.reccuringDetails, Globals.GET_PAYMENT_STATUS_ENUM().initial);
                scheduler.reccuringDetails = data ? data : scheduler.reccuringDetails;

                const currentDate = Math.floor((new Date().getTime() / 1000));
                let nextPayment = Math.floor(Number(scheduler.reccuringDetails.nextPaymentDate));
                let numberOfPayments = Math.floor(Number(scheduler.reccuringDetails.numberOfPayments));

                while (nextPayment <= currentDate && numberOfPayments > 0) {
                    numberOfPayments--;
                    nextPayment = nextPayment + scheduler.reccuringDetails.frequency;
                    ScheduleQueue.instance().queue(scheduler.reccuringDetails.id);
                }

                if (numberOfPayments > 0) {
                    scheduler._schedule = scheduler.scheduleJob(nextPayment);
                }
            })();

            return scheduler.reccuringDetails.id;
        }

        return null;
    }

    /**
     * @description Reschedules the scheduler with new payment details
     * @param reccuringDetails ID of the payment and the scheduler aswell
     * @returns {boolean} true if scheduler is rescheduled, false if scheduler was not found
     */
    public static reschedule(reccuringDetails: any) {
        const scheduler = SchedulerBuffer.get(reccuringDetails.id);
        if (scheduler) {
            const callback = scheduler.callback;
            const payload = Object.assign(scheduler.reccuringDetails, reccuringDetails);
            SchedulerBuffer.delete(scheduler.reccuringDetails.id);
            new Scheduler(payload, callback);

            return true;
        }

        return false;
    }

    public get interval() {
        return this._interval;
    }

    public get instance() {
        return this._schedule;
    }

    private scheduleJob(startTime: number = this.reccuringDetails.startTimestamp) {
        return schedule.scheduleJob(new Date(Number(startTime) * 1000), async () => {
            this.reccuringDetails = await ScheduleHelper.updatePaymentStatus(this.reccuringDetails, Globals.GET_PAYMENT_STATUS_ENUM().running);
            await this.executeCallback();
            this._interval = this.startInterval();
        });
    }

    private startInterval() {
        return setInterval(() => {
            this.executeCallback();
        }, this.reccuringDetails.frequency * 1000);
    }

    public async executeCallback() {
        this.reccuringDetails = await ScheduleHelper.getPayment(this.reccuringDetails.id);
        if (this.reccuringDetails.numberOfPayments > 0 && (Number(this.reccuringDetails.nextPaymentDate) <= Math.floor(new Date().getTime() / 1000))) {
            await this.callback();
            this.reccuringDetails = await ScheduleHelper.getPayment(this.reccuringDetails.id);
            if (this.reccuringDetails.numberOfPayments == 0) {
                SchedulerBuffer.delete(this.reccuringDetails.id);
                await ScheduleHelper.updatePaymentStatus(this.reccuringDetails, Globals.GET_PAYMENT_STATUS_ENUM().done);
            }
        }
    }
}