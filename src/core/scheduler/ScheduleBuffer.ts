import * as uuid from 'uuid';

export class SchedulerBuffer {

    private static SCHEDULER_BUFFER = [];

    public static get(id: string): any {
        return this.SCHEDULER_BUFFER[id];
    }

    public static set(scheduler: any) {
        this.SCHEDULER_BUFFER[uuid.v4()] = scheduler;
    }

}