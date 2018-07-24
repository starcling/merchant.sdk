import { SchedulerBuffer } from "./ScheduleBuffer";

const schedule = require('node-schedule');

export class Scheduler {

    public constructor(private reccuringDetails: any) {

    }

    public start() {
        const newScheduler = schedule.scheduleJob(this.reccuringDetails, {
            
        });

        SchedulerBuffer.set(newScheduler);
    }

    public stop(scheduler_id: string) {
        SchedulerBuffer.get(scheduler_id).stop();
    }

    public restart(scheduler_id: string) {
        SchedulerBuffer.get(scheduler_id).reschedule(this.reccuringDetails);
    }
}