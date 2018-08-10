import { Scheduler } from './Scheduler';

export class SchedulerBuffer {

    private static SCHEDULER_BUFFER: Scheduler[] = [];

    public static set(payment_id: string, scheduler: Scheduler) {
        SchedulerBuffer.SCHEDULER_BUFFER[payment_id] = scheduler;
    }

    public static get(payment_id: string): Scheduler {
        return SchedulerBuffer.SCHEDULER_BUFFER[payment_id];
    }
    
    public static delete(payment_id: string) {
        const scheduler = SchedulerBuffer.SCHEDULER_BUFFER[payment_id];
        if (scheduler) {
            if (scheduler.instance) {
                scheduler.instance.cancel();    
            }
            clearInterval(scheduler.interval);
            delete SchedulerBuffer.SCHEDULER_BUFFER[payment_id];
            return true;
        }
        
        return false;
    }
}