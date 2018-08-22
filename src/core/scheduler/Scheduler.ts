import { SchedulerBuffer } from "./ScheduleBuffer";
import { Globals } from "../../utils/globals";
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
    private _restarting = false;

    public constructor(private paymentID: string, private callback: any) {

    }

    public async start(reinitialized: boolean = false) {
        const payment = await ScheduleHelper.getPayment(this.paymentID);
        if (!reinitialized) await ScheduleHelper.adjustStartTime(payment);
        this._schedule = await this.scheduleJob();
        
        return SchedulerBuffer.set(this.paymentID, this);
    }

    /**
     * @description Stops the scheduler
     * @param payment_id ID of the payment and the scheduler aswell
     * @returns {object} ID of scheduler if it is stopped, null if scheduler was not found.
     */
    public static async stop(payment_id: string) {
        const payment = await ScheduleHelper.getPayment(payment_id);
        const scheduler = SchedulerBuffer.get(payment_id);
        if (scheduler && payment) {

            if (scheduler._schedule) {
                scheduler._schedule.cancel();
            }

            if (scheduler.interval) {
                clearInterval(scheduler.interval);
            }

            await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_PAYMENT_STATUS_ENUM().stopped);

            return payment_id;
        }

        return null;
    }

    /**
     * @description Restarts the stopped scheduler
     * @param payment_id ID of the payment and the scheduler aswell
     * @returns {object} ID of scheduler if it is restarted, null if scheduler was not found or is already running or done.
     */
    public static async restart(payment_id: string) {
        const scheduler = SchedulerBuffer.get(payment_id);
        const payment = await ScheduleHelper.getPayment(payment_id);

        if (scheduler && payment && payment.status == Globals.GET_PAYMENT_STATUS_ENUM().stopped && !scheduler._restarting) {
            scheduler._restarting = true;

            await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_PAYMENT_STATUS_ENUM().initial);

            const currentDate = Math.floor((new Date().getTime() / 1000));
            let nextPayment = Math.floor(Number(payment.nextPaymentDate));
            let numberOfPayments = Math.floor(Number(payment.numberOfPayments));

            while (nextPayment <= currentDate && numberOfPayments > 0) {
                numberOfPayments--;
                nextPayment = nextPayment + payment.frequency;
                ScheduleQueue.instance().queue(payment_id);
            }

            if (numberOfPayments > 0) {
                await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_PAYMENT_STATUS_ENUM().running);
                scheduler._schedule = await scheduler.scheduleJob(nextPayment);
            }
            scheduler._restarting = false;

            return payment_id;
        }

        return null;
    }

    public get interval() {
        return this._interval;
    }

    public get instance() {
        return this._schedule;
    }

    private async scheduleJob(startTime: number = null) {
        const payment = await ScheduleHelper.getPayment(this.paymentID);
        startTime = startTime ? startTime : payment.startTimestamp;

        return schedule.scheduleJob(new Date(Number(startTime) * 1000), async () => {
            const payment = await ScheduleHelper.getPayment(this.paymentID);
            await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_PAYMENT_STATUS_ENUM().running);
            await this.executeCallback();
            this._interval = this.startInterval(payment.frequency);
        });
    }

    private startInterval(interval: number) {
        return setInterval(() => {
            this.executeCallback();
        }, interval * 1000);
    }

    public async executeCallback() {
        let payment = await ScheduleHelper.getPayment(this.paymentID);
        if (payment && (payment.numberOfPayments > 0 && (Number(payment.nextPaymentDate) <= Math.floor(new Date().getTime() / 1000)))) {
            await this.callback();
            payment = await ScheduleHelper.getPayment(this.paymentID);

            if (payment.numberOfPayments == 0) {
                Scheduler.stop(this.paymentID);
                SchedulerBuffer.delete(this.paymentID);
                await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_PAYMENT_STATUS_ENUM().done);
            }
        }
    }
}