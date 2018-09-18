import { Scheduler } from './Scheduler';
import { DefaultConfig } from '../../config/default.config';
import { Globals } from '../../utils/globals';
import { PaymentContractController } from '../database/PaymentContractController';
const redis = require('redis');
let rclient = null;

export class SchedulerBuffer {
    private static bufferName = 'scheduler_keys';
    public static SCHEDULER_BUFFER: Scheduler[] = [];

    public static set(contract_id: string, scheduler: Scheduler) {
        SchedulerBuffer.SCHEDULER_BUFFER[contract_id] = scheduler;
        rclient.sadd(SchedulerBuffer.bufferName, contract_id);
    }

    public static get(contract_id: string): Scheduler {
        return SchedulerBuffer.SCHEDULER_BUFFER[contract_id];
    }

    public static delete(contract_id: string) {
        const scheduler = SchedulerBuffer.SCHEDULER_BUFFER[contract_id];
        if (scheduler) {
            if (scheduler.instance) {
                scheduler.instance.cancel();
            }
            if (scheduler.interval) {
                clearInterval(scheduler.interval);
            }
            
            delete SchedulerBuffer.SCHEDULER_BUFFER[contract_id];
            rclient.srem(SchedulerBuffer.bufferName, contract_id);
            return true;
        }

        return false;
    }

    public static async sync(executePullPayment: any) {

        await this.reconnectToRedis();

        rclient.smembers(SchedulerBuffer.bufferName, async (err, ids) => {
            if (!err) {
                for (let i = 0; i < ids.length; i++) {
                    new PaymentContractController().getContract(ids[i]).then(async response => {
                        const paymentContract = response.data[0];
                        if (!SchedulerBuffer.SCHEDULER_BUFFER[paymentContract.id]) {
                            rclient.srem(SchedulerBuffer.bufferName, ids[i]);

                            if (paymentContract.id != null) {
                                new Scheduler(paymentContract.id, async () => {
                                    executePullPayment(paymentContract.id);
                                }).start(true);

                                switch (paymentContract.status) {
                                    case (Globals.GET_CONTRACT_STATUS_ENUM_NAMES[Globals.GET_PAYMENT_STATUS_ENUM().initial]):
                                        Scheduler.stop(paymentContract.id);
                                        Scheduler.restart(paymentContract.id);
                                        break;
                                    case (Globals.GET_CONTRACT_STATUS_ENUM_NAMES[Globals.GET_PAYMENT_STATUS_ENUM().running]):
                                        Scheduler.stop(paymentContract.id);
                                        Scheduler.restart(paymentContract.id);
                                        break;
                                    case (Globals.GET_CONTRACT_STATUS_ENUM_NAMES[Globals.GET_PAYMENT_STATUS_ENUM().stopped]):
                                        Scheduler.stop(paymentContract.id);
                                        break;
                                    case (Globals.GET_CONTRACT_STATUS_ENUM_NAMES[Globals.GET_PAYMENT_STATUS_ENUM().canceled]):
                                        Scheduler.stop(paymentContract.id);
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
    protected static async testScheduler(contractID?: string) {
        const contractDbConnector = new PaymentContractController();
        const paymentContract = (await contractDbConnector.getContract(contractID)).data[0];

        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
        paymentContract.lastPaymentDate = paymentContract.nextPaymentDate;
        paymentContract.nextPaymentDate = paymentContract.numberOfPayments === 0 ?
            paymentContract.nextPaymentDate : Number(paymentContract.nextPaymentDate) + paymentContract.frequency;
        paymentContract.status = paymentContract.numberOfPayments === 0 ? Globals.GET_PAYMENT_STATUS_ENUM().done : Globals.GET_PAYMENT_STATUS_ENUM()[paymentContract.status],
            await contractDbConnector.updateContract(paymentContract);
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