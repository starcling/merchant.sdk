import { Scheduler } from './Scheduler';
import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { PaymentController } from '../payment/PaymentController';
const redis = require('redis');
let rclient = null;

export class SchedulerBuffer {
    private static bufferName = 'scheduler_keys';
    private static SCHEDULER_BUFFER: Scheduler[] = [];

    public static set(payment_id: string, scheduler: Scheduler) {
        SchedulerBuffer.SCHEDULER_BUFFER[payment_id] = scheduler;
        rclient.sadd(SchedulerBuffer.bufferName, payment_id);
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
            rclient.srem(SchedulerBuffer.bufferName, payment_id);
            return true;
        }

        return false;
    }

    public static async sync(executePullPayment: any) {

        await this.reconnectToRedis();

        rclient.smembers(SchedulerBuffer.bufferName, async (err, ids) => {
            if (!err) {
                for (let i = 0; i < ids.length; i++) {
                    new PaymentController().getPayment(ids[i]).then(async response => {
                        const payment = response.data[0];
                        if (!SchedulerBuffer.SCHEDULER_BUFFER[payment.id]) {
                            rclient.srem(SchedulerBuffer.bufferName, ids[i]);

                            if (payment.id != null) {
                                new Scheduler(payment.id, async () => {
                                    SchedulerBuffer.testScheduler(payment.id);
                                }).start(true);

                                switch (payment.status) {
                                    case (Globals.GET_PAYMENT_STATUS_ENUM().initial):
                                        Scheduler.stop(payment.id);
                                        Scheduler.restart(payment.id);
                                        break;
                                    case (Globals.GET_PAYMENT_STATUS_ENUM().running):
                                        Scheduler.stop(payment.id);
                                        Scheduler.restart(payment.id);
                                        break;
                                    case (Globals.GET_PAYMENT_STATUS_ENUM().stopped):
                                        Scheduler.stop(payment.id);
                                        break;
                                    case (Globals.GET_PAYMENT_STATUS_ENUM().canceled):
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
    * @description Method for actual execution of pull payment
    * @returns {object} null
    */
    protected static async testScheduler(paymentID?: string) {
        const paymentDbConnector = new PaymentController();
        const payment = (await paymentDbConnector.getPayment(paymentID)).data[0];

        payment.numberOfPayments = payment.numberOfPayments - 1;
        payment.lastPaymentDate = payment.nextPaymentDate;
        payment.nextPaymentDate = payment.numberOfPayments === 0 ?
            payment.nextPaymentDate : Number(payment.nextPaymentDate) + payment.frequency;
        payment.status = payment.numberOfPayments == 0 ? Globals.GET_PAYMENT_STATUS_ENUM().done : payment.status,
            await paymentDbConnector.updatePayment(payment);
    }

    public static reconnectToRedis() {
        if (!rclient) {
            rclient = redis.createClient({
                port: DefaultConfig.settings.redisPort,
                host: DefaultConfig.settings.redisHost
            });

            rclient.on('error', (err) => {
                console.log({
                    server: 'Warning! Redis server not started. ',
                    error: JSON.parse(JSON.stringify(err)),
                    message: `You won't be able to persist the schedulers`,
                    usedPort: DefaultConfig.settings.redisPort,
                    usedHost: DefaultConfig.settings.redisHost
                });
                rclient.quit();
                rclient = null;
            });

            rclient.on('connect', () => {
                console.log(`Redis client connected to: ${DefaultConfig.settings.redisHost}:${DefaultConfig.settings.redisPort}`);
            });
        } else {
            rclient.quit();
            rclient = null;
            SchedulerBuffer.reconnectToRedis();
        }
    };

    public static closeConnection() {
        if (rclient) {
            rclient.quit();
            rclient = null;
        }
    };

}