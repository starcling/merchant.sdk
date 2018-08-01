export class SchedulerBuffer {

    private static SCHEDULER_BUFFER = [];

    public static get(payment_id: string): any {
        return SchedulerBuffer.SCHEDULER_BUFFER[payment_id];
    }

    public static set(payment_id: string, scheduler: any) {
        SchedulerBuffer.SCHEDULER_BUFFER[payment_id] = scheduler;
    }

}