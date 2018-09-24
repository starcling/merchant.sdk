import { Scheduler } from './Scheduler';
import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { PullPaymentController } from '../database/PullPaymentController';
const redis = require('redis');
let rclient = null;

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

        await this.reconnectToRedis();

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
    * @description Method for actual execution of pull paymentContract
    * @returns {object} null
    */
    protected static async testScheduler(pullPaymentID?: string) {
        const pullPaymentDbConnector = new PullPaymentController();
        const paymentContract = (await pullPaymentDbConnector.getPullPayment(pullPaymentID)).data[0];

        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
        paymentContract.lastPaymentDate = paymentContract.nextPaymentDate;
        paymentContract.nextPaymentDate = paymentContract.numberOfPayments === 0 ?
            paymentContract.nextPaymentDate : Number(paymentContract.nextPaymentDate) + paymentContract.frequency;
        paymentContract.status = paymentContract.numberOfPayments === 0 ? Globals.GET_PULL_PAYMENT_STATUS_ENUM().done : Globals.GET_PULL_PAYMENT_STATUS_ENUM()[paymentContract.status],
            await pullPaymentDbConnector.updatePullPayment(paymentContract);
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