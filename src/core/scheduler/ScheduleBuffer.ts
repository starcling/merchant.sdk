import { Scheduler } from './Scheduler';
import { PaymentDbConnector } from '../../connector/dbConnector/paymentsDBconnector';
import { DefaultConfig } from '../../config/default.config';

const redis = require('redis').createClient({
    port: 6379,
    host: 'redis'
});

redis.on('error', (err) => {
    console.log({
        server: 'Warning! Redis server not started. ',
        error: JSON.parse(JSON.stringify(err)),
        message: `You won't be able to persist the schedulers`,
        usedPort: DefaultConfig.settings.redisPort,
        usedHost: DefaultConfig.settings.redisHost
    });
    redis.quit();
});

redis.on('connect', () => {
    console.log(`Redis client connected to: ${DefaultConfig.settings.redisHost}:${DefaultConfig.settings.redisPort}`);
});

export class SchedulerBuffer {
    private static bufferName = 'scheduler_keys';
    private static SCHEDULER_BUFFER: Scheduler[] = [];

    public static set(payment_id: string, scheduler: Scheduler) {
        SchedulerBuffer.SCHEDULER_BUFFER[payment_id] = scheduler;
        redis.sadd(SchedulerBuffer.bufferName, payment_id);
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
            redis.srem(SchedulerBuffer.bufferName, payment_id);
            return true;
        }

        return false;
    }

    public static async sync(executePullPayment: any) {
        redis.smembers(SchedulerBuffer.bufferName, async (err, ids) => {
            if (!err) {
                for (let i = 0; i < ids.length; i++) {
                    new PaymentDbConnector().getPayment(ids[i]).then(response => {
                        const payment = response.data[0];
                        if (!SchedulerBuffer.SCHEDULER_BUFFER[payment.id]) {
                            redis.srem(SchedulerBuffer.bufferName, ids[i]);


                            if (payment.id != null) {
                                new Scheduler(payment, () => {
                                    executePullPayment(payment.id);
                                }).start();

                                if (payment.startTimestamp > Math.floor(new Date().getTime() / 1000)) {
                                    Scheduler.stop(payment.id);
                                    Scheduler.restart(payment.id);
                                }

                            }

                        }
                    }).catch(() => {
                        redis.srem(SchedulerBuffer.bufferName, ids[i]);
                    });
                }
            }
        });
    }

}