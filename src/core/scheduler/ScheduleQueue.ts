import { SchedulerBuffer } from './ScheduleBuffer';
import { Globals } from '../../utils/globals';

/**
 * @description Scheduler, started and created through monitorTransaction function.
 * @method start Start method called when creating a new scheduler to actualy start a new job
 * @method stop Called from anywhere, static method with parameter scheduler_id which is the same as payment_id
 * @method restart Called from anywhere, static method with parameters {scheduler_id}: string which is the same as payment_id
 * {reccuringDetails}: any which is the details for the reccuring payment
 */
export class ScheduleQueue {

    private static _instance: ScheduleQueue = null;
    private executionQueue: any[] = [];
    private isExecuting = false;

    private constructor() { }

    public static instance() {
        if (!this._instance) {
            this._instance = new ScheduleQueue();
        }

        return this._instance;
    }

    public queue(method: any) {
        this.executionQueue.push(method);
        this.drip();
    }

    private async drip() {
        if (!ScheduleQueue._instance.isExecuting && ScheduleQueue._instance.executionQueue.length) {
            ScheduleQueue._instance.isExecuting = true;
            ScheduleQueue._instance.execute();
        } else {
            setTimeout(ScheduleQueue._instance.drip, Globals.GET_SCHEDULE_QUEUE_INTERVAL());
        }
    }

    private async execute() {
        const id = ScheduleQueue._instance.executionQueue.shift();
        await SchedulerBuffer.get(id).executeCallback();
        ScheduleQueue._instance.isExecuting = false;
    }

}