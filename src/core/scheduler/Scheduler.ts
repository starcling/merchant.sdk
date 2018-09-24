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

    public constructor(private _paymentID: string, private _callback: any) {

    }

    public async start(reinitialized: boolean = false) {
        const payment = await ScheduleHelper.getPayment(this._paymentID);
        if (!reinitialized) await ScheduleHelper.adjustStartTime(payment);
        this._schedule = await this.scheduleJob();

        return SchedulerBuffer.set(this._paymentID, this);
    }

    /**
     * @description Stops the scheduler
     * @param paymentID ID of the paymentContract and the scheduler aswell
     * @returns {object} ID of scheduler if it is stopped, null if scheduler was not found.
     */
    public static async stop(paymentID: string) {
        const payment = await ScheduleHelper.getPayment(paymentID);
        const scheduler = SchedulerBuffer.get(paymentID);
        if (scheduler && payment) {
            if (scheduler._schedule) {
                scheduler._schedule.cancel();
            }

            if (scheduler._interval) {
                clearInterval(scheduler._interval);
                scheduler._interval = null;
            }

            await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_CONTRACT_STATUS_ENUM().stopped);

            return paymentID;
        }

        return null;
    }

    /**
     * @description Restarts the stopped scheduler
     * @param paymentID ID of the paymentContract and the scheduler aswell
     * @returns {object} ID of scheduler if it is restarted, null if scheduler was not found or is already running or done.
     */
    public static async restart(paymentID: string) {
        const scheduler = SchedulerBuffer.get(paymentID);
        const payment = await ScheduleHelper.getPayment(paymentID);

        if (scheduler && payment && payment.status == Globals.GET_CONTRACT_STATUS_ENUM_NAMES()[Globals.GET_CONTRACT_STATUS_ENUM().stopped] && !scheduler._restarting) {
            scheduler._restarting = true;
            await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_CONTRACT_STATUS_ENUM().initial);

            const currentDate = Math.floor((new Date().getTime() / 1000));
            let nextPayment = Math.floor(Number(payment.nextPaymentDate));
            let numberOfPayments = Math.floor(Number(payment.numberOfPayments));

            while (nextPayment <= currentDate && numberOfPayments > 0) {
                numberOfPayments--;
                nextPayment = nextPayment + payment.frequency;
                ScheduleQueue.instance().queue(paymentID);
            }

            if (numberOfPayments > 0) {
                await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_CONTRACT_STATUS_ENUM().running);
                scheduler._schedule = await scheduler.scheduleJob(nextPayment);
            }
            scheduler._restarting = false;

            return paymentID;
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
        const payment = await ScheduleHelper.getPayment(this._paymentID);
        startTime = startTime ? startTime : payment.startTimestamp;

        return schedule.scheduleJob(payment.id, new Date(Number(startTime) * 1000), async () => {
            const payment = await ScheduleHelper.getPayment(this._paymentID);
            await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_CONTRACT_STATUS_ENUM().running);
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
        let payment = await ScheduleHelper.getPayment(this._paymentID);
        if (payment && (payment.numberOfPayments > 0 && (Number(payment.nextPaymentDate) <= Math.floor(new Date().getTime() / 1000)))) {
            await this._callback();
            payment = await ScheduleHelper.getPayment(this._paymentID);

            if (payment.numberOfPayments == 0) {
                Scheduler.stop(this._paymentID);
                SchedulerBuffer.delete(this._paymentID);
                await ScheduleHelper.updatePaymentStatus(payment, Globals.GET_CONTRACT_STATUS_ENUM().done);
            }
        }
    }
}