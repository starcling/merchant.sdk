import { Scheduler } from './Scheduler';
import { PaymentDbConnector } from '../../connector/dbConnector/paymentsDBconnector';
import { DefaultConfig } from '../../config/default.config';
import { IPaymentUpdateDetails } from '../payment/models';
import { Globals } from '../../utils/globals';
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

        this.reconnectToRedis();

        rclient.smembers(SchedulerBuffer.bufferName, async (err, ids) => {
            if (!err) {
                for (let i = 0; i < ids.length; i++) {
                    new PaymentDbConnector().getPayment(ids[i]).then(async response => {
                        const payment = response.data[0];
                        if (!SchedulerBuffer.SCHEDULER_BUFFER[payment.id]) {
                            rclient.srem(SchedulerBuffer.bufferName, ids[i]);

                            if (payment.id != null) {
                                new Scheduler(payment, async () => {
                                    SchedulerBuffer.testExecution(payment.id);
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
    protected static async testExecution(paymentID?: string) {
        const paymentDbConnector = new PaymentDbConnector();
        const payment: IPaymentUpdateDetails = (await paymentDbConnector.getPayment(paymentID)).data[0];

        const numberOfPayments = payment.numberOfPayments - 1;
        await paymentDbConnector.updatePayment(<IPaymentUpdateDetails>{
            id: payment.id,
            lastPaymentDate: payment.nextPaymentDate,
            numberOfPayments: numberOfPayments,
            status: numberOfPayments == 0 ? Globals.GET_PAYMENT_STATUS_ENUM().done : payment.status,
            nextPaymentDate: numberOfPayments == 0 ? payment.nextPaymentDate : Number(payment.nextPaymentDate) + Number(payment.frequency)
        });
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
        rclient.quit();
        rclient = null;
    };

}