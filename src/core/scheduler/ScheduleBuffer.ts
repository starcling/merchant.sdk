import { Scheduler } from './Scheduler';
import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { PullPaymentController } from '../database/PullPaymentController';
const rclient = DefaultConfig.settings.redisClient;

export class SchedulerBuffer {
    private static bufferName = 'scheduler_keys';
    public static SCHEDULER_BUFFER: Scheduler[] = [];

    public static set(pullPaymentID: string, scheduler: Scheduler) {
        SchedulerBuffer.SCHEDULER_BUFFER[pullPaymentID] = scheduler;
        rclient.sadd(SchedulerBuffer.bufferName, pullPaymentID);
    }

    public static get(paymentID: string): Scheduler {
        return SchedulerBuffer.SCHEDULER_BUFFER[paymentID];
    }

    public static delete(paymentID: string) {
        const scheduler = SchedulerBuffer.SCHEDULER_BUFFER[paymentID];
        if (scheduler) {
            if (scheduler.instance) {
                scheduler.instance.cancel();
            }
            if (scheduler.interval) {
                clearInterval(scheduler.interval);
            }
            
            delete SchedulerBuffer.SCHEDULER_BUFFER[paymentID];
            rclient.srem(SchedulerBuffer.bufferName, paymentID);
            return true;
        }

        return false;
    }

    public static async sync(executePullPayment: any) {

        rclient.smembers(SchedulerBuffer.bufferName, async (err, ids) => {
            if (!err) {
                for (let i = 0; i < ids.length; i++) {
                    new PullPaymentController().getPullPayment(ids[i]).then(async response => {
                        const payment = response.data[0];
                        if (!SchedulerBuffer.SCHEDULER_BUFFER[payment.id]) {
                            rclient.srem(SchedulerBuffer.bufferName, ids[i]);

                            if (payment.id != null) {
                                new Scheduler(payment.id, async () => {
                                    executePullPayment(payment.id);
                                }).start(true);

                                switch (payment.status) {
                                    case (Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES[Globals.GET_PULL_PAYMENT_STATUS_ENUM().initial]):
                                        Scheduler.stop(payment.id);
                                        Scheduler.restart(payment.id);
                                        break;
                                    case (Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES[Globals.GET_PULL_PAYMENT_STATUS_ENUM().running]):
                                        Scheduler.stop(payment.id);
                                        Scheduler.restart(payment.id);
                                        break;
                                    case (Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES[Globals.GET_PULL_PAYMENT_STATUS_ENUM().stopped]):
                                        Scheduler.stop(payment.id);
                                        break;
                                    case (Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES[Globals.GET_PULL_PAYMENT_STATUS_ENUM().canceled]):
                                        Scheduler.stop(payment.id);
                                        break;
                                }
                            }

                        }
                    }).catch(() => {
                        rclient.srem(SchedulerBuffer.bufferName, ids[i]);
                    });
                }
            }
        });
    }

    /**
    * @description Method for actual execution of pull pullPayment
    * @returns {object} null
    */
    protected static async testScheduler(pullPaymentID?: string) {
        const pullPaymentDbConnector = new PullPaymentController();
        const pullPayment = (await pullPaymentDbConnector.getPullPayment(pullPaymentID)).data[0];

        pullPayment.numberOfPayments = pullPayment.numberOfPayments - 1;
        pullPayment.lastPaymentDate = pullPayment.nextPaymentDate;
        pullPayment.nextPaymentDate = pullPayment.numberOfPayments === 0 ?
            pullPayment.nextPaymentDate : Number(pullPayment.nextPaymentDate) + pullPayment.frequency;
        pullPayment.status = pullPayment.numberOfPayments === 0 ? Globals.GET_PULL_PAYMENT_STATUS_ENUM().done : Globals.GET_PULL_PAYMENT_STATUS_ENUM()[pullPayment.status],
            await pullPaymentDbConnector.updatePullPayment(pullPayment);
    }

}