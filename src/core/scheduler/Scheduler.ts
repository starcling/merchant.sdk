import { SchedulerBuffer } from "./ScheduleBuffer";
import { Globals } from "../../utils/globals";
import { ScheduleHelper } from "./ScheduleHelper";
import { ScheduleQueue } from "./ScheduleQueue";
const schedule = require('node-schedule');

/**
 * @description Scheduler, started and created through monitorTransaction function.
 * @method start Start method called when creating a new scheduler to actualy start a new job
 * @method stop Called from anywhere, static method with parameter scheduler_id which is the same as contractID
 * @method restart Called from anywhere, static method with parameters {scheduler_id}: string which is the same as contractID
 * {reccuringDetails}: any which is the details for the reccuring paymentContract
 */
export class Scheduler {
    private _interval = null;
    private _schedule = null;
    private _restarting = false;

    public constructor(private _pullPaymentID: string, private _callback: any) {

    }

    public async start(reinitialized: boolean = false) {
        const pullpayment = await ScheduleHelper.getPullPayment(this._pullPaymentID);
        if (!reinitialized) await ScheduleHelper.adjustStartTime(pullpayment);
        this._schedule = await this.scheduleJob();

        return SchedulerBuffer.set(this._pullPaymentID, this);
    }

    /**
     * @description Stops the scheduler
     * @param pullPaymentID ID of the paymentContract and the scheduler aswell
     * @returns {object} ID of scheduler if it is stopped, null if scheduler was not found.
     */
    public static async stop(pullPaymentID: string) {
        const payment = await ScheduleHelper.getPullPayment(pullPaymentID);
        const scheduler = SchedulerBuffer.get(pullPaymentID);
        if (scheduler && payment) {
            if (scheduler._schedule) {
                scheduler._schedule.cancel();
            }

            if (scheduler._interval) {
                clearInterval(scheduler._interval);
                scheduler._interval = null;
            }

            await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_PULL_PAYMENT_STATUS_ENUM().stopped);

            return pullPaymentID;
        }

        return null;
    }

    /**
     * @description Restarts the stopped scheduler
     * @param pullPaymentID ID of the paymentContract and the scheduler aswell
     * @returns {object} ID of scheduler if it is restarted, null if scheduler was not found or is already running or done.
     */
    public static async restart(pullPaymentID: string) {
        const scheduler = SchedulerBuffer.get(pullPaymentID);
        const pullPayment = await ScheduleHelper.getPullPayment(pullPaymentID);

        if (scheduler && pullPayment && pullPayment.status == Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES()[Globals.GET_PULL_PAYMENT_STATUS_ENUM().stopped] && !scheduler._restarting) {
            scheduler._restarting = true;
            await ScheduleHelper.updatePaymentStatus(pullPayment, Globals.GET_PULL_PAYMENT_STATUS_ENUM().initial);

            const currentDate = Math.floor((new Date().getTime() / 1000));
            let nextPayment = Math.floor(Number(pullPayment.nextPaymentDate));
            let numberOfPayments = Math.floor(Number(pullPayment.numberOfPayments));

            while (nextPayment <= currentDate && numberOfPayments > 0) {
                numberOfPayments--;
                nextPayment = nextPayment + pullPayment.frequency;
                ScheduleQueue.instance().queue(pullPaymentID);
            }

            if (numberOfPayments > 0) {
                await ScheduleHelper.updatePaymentStatus(pullPayment, Globals.GET_PULL_PAYMENT_STATUS_ENUM().running);
                scheduler._schedule = await scheduler.scheduleJob(nextPayment);
            }
            scheduler._restarting = false;

            return pullPaymentID;
        }

        return null;
    }

    public get interval() {
        return this._interval;
    }

    public get instance() {
        return this._schedule;
    }

    private async scheduleJob(startTime: number = null): Promise<any> {
        const payment = await ScheduleHelper.getPullPayment(this._pullPaymentID);
        startTime = startTime ? startTime : payment.startTimestamp;

        return schedule.scheduleJob(payment.id, new Date(Number(startTime) * 1000), async () => {
            const payment = await ScheduleHelper.getPullPayment(this._pullPaymentID);
            await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_PULL_PAYMENT_STATUS_ENUM().running);
            await this.executeCallback();
            this._interval = this.startInterval(payment.frequency);
            const scheduler = SchedulerBuffer.get(payment.id);
            if (scheduler) {
                scheduler._interval = this._interval;
                SchedulerBuffer.set(payment.id, scheduler);
            }

        });
    }

    private startInterval(interval: number) {
        return setInterval(() => {
            this.executeCallback();
        }, interval * 1000);
    }

    public async executeCallback() {
        let pullPayment = await ScheduleHelper.getPullPayment(this._pullPaymentID);
        if (pullPayment && (pullPayment.numberOfPayments > 0 && (Number(pullPayment.nextPaymentDate) <= Math.floor(new Date().getTime() / 1000)))) {
            await this._callback();
            pullPayment = await ScheduleHelper.getPullPayment(this._pullPaymentID);

            if (pullPayment.numberOfPayments == 0) {
                Scheduler.stop(this._pullPaymentID);
                SchedulerBuffer.delete(this._pullPaymentID);
                await ScheduleHelper.updatePaymentStatus(pullPayment, Globals.GET_PULL_PAYMENT_STATUS_ENUM().done);
            }
        }
    }
}