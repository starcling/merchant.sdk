"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Scheduler_1 = require("./Scheduler");
const default_config_1 = require("../../config/default.config");
const globals_1 = require("../../utils/globals");
const PaymentContractController_1 = require("../database/PaymentContractController");
const redis = require('redis');
let rclient = null;
class SchedulerBuffer {
    static set(contract_id, scheduler) {
        SchedulerBuffer.SCHEDULER_BUFFER[contract_id] = scheduler;
        rclient.sadd(SchedulerBuffer.bufferName, contract_id);
    }
    static get(contract_id) {
        return SchedulerBuffer.SCHEDULER_BUFFER[contract_id];
    }
    static delete(contract_id) {
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
    static sync(executePullPayment) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.reconnectToRedis();
            rclient.smembers(SchedulerBuffer.bufferName, (err, ids) => __awaiter(this, void 0, void 0, function* () {
                if (!err) {
                    for (let i = 0; i < ids.length; i++) {
                        new PaymentContractController_1.PaymentContractController().getContract(ids[i]).then((response) => __awaiter(this, void 0, void 0, function* () {
                            const paymentContract = response.data[0];
                            if (!SchedulerBuffer.SCHEDULER_BUFFER[paymentContract.id]) {
                                rclient.srem(SchedulerBuffer.bufferName, ids[i]);
                                if (paymentContract.id != null) {
                                    new Scheduler_1.Scheduler(paymentContract.id, () => __awaiter(this, void 0, void 0, function* () {
                                        executePullPayment(paymentContract.id);
                                    })).start(true);
                                    switch (paymentContract.status) {
                                        case (globals_1.Globals.GET_CONTRACT_STATUS_ENUM_NAMES[globals_1.Globals.GET_CONTRACT_STATUS_ENUM().initial]):
                                            Scheduler_1.Scheduler.stop(paymentContract.id);
                                            Scheduler_1.Scheduler.restart(paymentContract.id);
                                            break;
                                        case (globals_1.Globals.GET_CONTRACT_STATUS_ENUM_NAMES[globals_1.Globals.GET_CONTRACT_STATUS_ENUM().running]):
                                            Scheduler_1.Scheduler.stop(paymentContract.id);
                                            Scheduler_1.Scheduler.restart(paymentContract.id);
                                            break;
                                        case (globals_1.Globals.GET_CONTRACT_STATUS_ENUM_NAMES[globals_1.Globals.GET_CONTRACT_STATUS_ENUM().stopped]):
                                            Scheduler_1.Scheduler.stop(paymentContract.id);
                                            break;
                                        case (globals_1.Globals.GET_CONTRACT_STATUS_ENUM_NAMES[globals_1.Globals.GET_CONTRACT_STATUS_ENUM().canceled]):
                                            Scheduler_1.Scheduler.stop(paymentContract.id);
                                            break;
                                    }
                                }
                            }
                        })).catch(() => {
                            rclient.srem(SchedulerBuffer.bufferName, ids[i]);
                        });
                    }
                }
            }));
        });
    }
    static testScheduler(contractID) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractDbConnector = new PaymentContractController_1.PaymentContractController();
            const paymentContract = (yield contractDbConnector.getContract(contractID)).data[0];
            paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
            paymentContract.lastPaymentDate = paymentContract.nextPaymentDate;
            paymentContract.nextPaymentDate = paymentContract.numberOfPayments === 0 ?
                paymentContract.nextPaymentDate : Number(paymentContract.nextPaymentDate) + paymentContract.frequency;
            paymentContract.status = paymentContract.numberOfPayments === 0 ? globals_1.Globals.GET_CONTRACT_STATUS_ENUM().done : globals_1.Globals.GET_CONTRACT_STATUS_ENUM()[paymentContract.status],
                yield contractDbConnector.updateContract(paymentContract);
        });
    }
    static reconnectToRedis() {
        if (!rclient) {
            rclient = redis.createClient({
                port: default_config_1.DefaultConfig.settings.redisPort,
                host: default_config_1.DefaultConfig.settings.redisHost
            });
            rclient.on('error', (err) => {
                console.log({
                    server: 'Warning! Redis server not started. ',
                    error: JSON.parse(JSON.stringify(err)),
                    message: `You won't be able to persist the schedulers`,
                    usedPort: default_config_1.DefaultConfig.settings.redisPort,
                    usedHost: default_config_1.DefaultConfig.settings.redisHost
                });
                rclient.quit();
                rclient = null;
            });
            rclient.on('connect', () => {
                console.log(`Redis client connected to: ${default_config_1.DefaultConfig.settings.redisHost}:${default_config_1.DefaultConfig.settings.redisPort}`);
            });
        }
        else {
            rclient.quit();
            rclient = null;
            SchedulerBuffer.reconnectToRedis();
        }
    }
    ;
    static closeConnection() {
        if (rclient) {
            rclient.quit();
            rclient = null;
        }
    }
    ;
}
SchedulerBuffer.bufferName = 'scheduler_keys';
SchedulerBuffer.SCHEDULER_BUFFER = [];
exports.SchedulerBuffer = SchedulerBuffer;
//# sourceMappingURL=ScheduleBuffer.js.map