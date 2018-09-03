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

    public constructor(private _contractID: string, private _callback: any) {

    }

    public async start(reinitialized: boolean = false) {
        const paymentContract = await ScheduleHelper.getContract(this._contractID);
        if (!reinitialized) await ScheduleHelper.adjustStartTime(paymentContract);
        this._schedule = await this.scheduleJob();

        return SchedulerBuffer.set(this._contractID, this);
    }

    /**
     * @description Stops the scheduler
     * @param contractID ID of the paymentContract and the scheduler aswell
     * @returns {object} ID of scheduler if it is stopped, null if scheduler was not found.
     */
    public static async stop(contractID: string) {
        const paymentContract = await ScheduleHelper.getContract(contractID);
        const scheduler = SchedulerBuffer.get(contractID);
        if (scheduler && paymentContract) {
            if (scheduler._schedule) {
                scheduler._schedule.cancel();
            }

            if (scheduler._interval) {
                clearInterval(scheduler._interval);
                scheduler._interval = null;
            }

            await ScheduleHelper.updateContractStatus(paymentContract, Globals.GET_CONTRACT_STATUS_ENUM().stopped);

            return contractID;
        }

        return null;
    }

    /**
     * @description Restarts the stopped scheduler
     * @param contractID ID of the paymentContract and the scheduler aswell
     * @returns {object} ID of scheduler if it is restarted, null if scheduler was not found or is already running or done.
     */
    public static async restart(contractID: string) {
        const scheduler = SchedulerBuffer.get(contractID);
        const paymentContract = await ScheduleHelper.getContract(contractID);

        if (scheduler && paymentContract && paymentContract.status == Globals.GET_CONTRACT_STATUS_ENUM_NAMES()[Globals.GET_CONTRACT_STATUS_ENUM().stopped] && !scheduler._restarting) {
            scheduler._restarting = true;
            await ScheduleHelper.updateContractStatus(paymentContract, Globals.GET_CONTRACT_STATUS_ENUM().initial);

            const currentDate = Math.floor((new Date().getTime() / 1000));
            let nextPayment = Math.floor(Number(paymentContract.nextPaymentDate));
            let numberOfPayments = Math.floor(Number(paymentContract.numberOfPayments));

            while (nextPayment <= currentDate && numberOfPayments > 0) {
                numberOfPayments--;
                nextPayment = nextPayment + paymentContract.frequency;
                ScheduleQueue.instance().queue(contractID);
            }

            if (numberOfPayments > 0) {
                await ScheduleHelper.updateContractStatus(paymentContract, Globals.GET_CONTRACT_STATUS_ENUM().running);
                scheduler._schedule = await scheduler.scheduleJob(nextPayment);
            }
            scheduler._restarting = false;

            return contractID;
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
        const paymentContract = await ScheduleHelper.getContract(this._contractID);
        startTime = startTime ? startTime : paymentContract.startTimestamp;

        return schedule.scheduleJob(paymentContract.id, new Date(Number(startTime) * 1000), async () => {
            const paymentContract = await ScheduleHelper.getContract(this._contractID);
            await ScheduleHelper.updateContractStatus(paymentContract, Globals.GET_CONTRACT_STATUS_ENUM().running);
            await this.executeCallback();
            this._interval = this.startInterval(paymentContract.frequency);
            const scheduler = SchedulerBuffer.get(paymentContract.id);
            if (scheduler) {
                scheduler._interval = this._interval;
                SchedulerBuffer.set(paymentContract.id, scheduler);
            }

        });
    }

    private startInterval(interval: number) {
        return setInterval(() => {
            this.executeCallback();
        }, interval * 1000);
    }

    public async executeCallback() {
        let paymentContract = await ScheduleHelper.getContract(this._contractID);
        if (paymentContract && (paymentContract.numberOfPayments > 0 && (Number(paymentContract.nextPaymentDate) <= Math.floor(new Date().getTime() / 1000)))) {
            await this._callback();
            paymentContract = await ScheduleHelper.getContract(this._contractID);

            if (paymentContract.numberOfPayments == 0) {
                Scheduler.stop(this._contractID);
                SchedulerBuffer.delete(this._contractID);
                await ScheduleHelper.updateContractStatus(paymentContract, Globals.GET_CONTRACT_STATUS_ENUM().done);
            }
        }
    }
}