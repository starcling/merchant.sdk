import { SchedulerBuffer } from "./ScheduleBuffer";
const schedule = require('node-schedule');

/**
 * @description Scheduler, started and created through monitorTransaction function.
 * @method start Start method called when creating a new scheduler to actualy start a new job
 * @method stop Called from anywhere, static method with parameter scheduler_id which is the same as payment_id
 * @method restart Called from anywhere, static method with parameters {scheduler_id}: string which is the same as payment_id
 * {reccuringDetails}: any which is the details for the reccuring payment
 */
export class Scheduler {

    public constructor(private reccuringDetails: any, private callback: any) {

    }

    public start() {
        let scheduler;
        schedule.scheduleJob(new Date(Number(this.reccuringDetails.startTimestamp) * 1000), () => {
            this.callback();
            scheduler = setInterval(() => {
                this.callback();
                if (new Date().getTime() > Number(this.reccuringDetails.endTimestamp) * 1000) {
                    clearInterval(scheduler);
                }
            }, this.reccuringDetails.frequency * 1000);
        });

        return SchedulerBuffer.set(this.reccuringDetails.id, scheduler);
    }

    public static stop(payment_id: string) {
        SchedulerBuffer.get(payment_id).cancel();
        clearInterval(SchedulerBuffer.get(payment_id));
    }

    public static restart(payment_id: string, reccuringDetails: any) {
        SchedulerBuffer.get(payment_id).reschedule(reccuringDetails);
    }

}