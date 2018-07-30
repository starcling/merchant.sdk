import { SchedulerBuffer } from "./ScheduleBuffer";
const schedule = require('node-schedule');

export class Scheduler {

    public constructor(private reccuringDetails: any, private callback: any) {

    }

    public start() {
        const rule = new schedule.RecurrenceRule();
        rule.seconds = this.reccuringDetails.frequency
        const newScheduler = schedule.scheduleJob({
            start: new Date (Number(Number(this.reccuringDetails.startTimestamp) * 1000)),
            end: new Date (Number(Number(this.reccuringDetails.endTimestamp) * 1000)),
            rule: rule
        }, this.callback);

        SchedulerBuffer.set(newScheduler);
    }

    public static stop(scheduler_id: string) {
        SchedulerBuffer.get(scheduler_id).stop();
    }

    public static restart(scheduler_id: string, reccuringDetails: any) {
        SchedulerBuffer.get(scheduler_id).reschedule(reccuringDetails);
    }
}