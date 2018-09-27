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
const PullPaymentController_1 = require("../database/PullPaymentController");
const rclient = default_config_1.DefaultConfig.settings.redisClient;
class SchedulerBuffer {
    static set(pullPaymentID, scheduler) {
        SchedulerBuffer.SCHEDULER_BUFFER[pullPaymentID] = scheduler;
        rclient.sadd(SchedulerBuffer.bufferName, pullPaymentID);
    }
    static get(paymentID) {
        return SchedulerBuffer.SCHEDULER_BUFFER[paymentID];
    }
    static delete(paymentID) {
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
    static sync(executePullPayment) {
        return __awaiter(this, void 0, void 0, function* () {
            rclient.smembers(SchedulerBuffer.bufferName, (err, ids) => __awaiter(this, void 0, void 0, function* () {
                if (!err) {
                    for (let i = 0; i < ids.length; i++) {
                        new PullPaymentController_1.PullPaymentController().getPullPayment(ids[i]).then((response) => __awaiter(this, void 0, void 0, function* () {
                            const payment = response.data[0];
                            if (!SchedulerBuffer.SCHEDULER_BUFFER[payment.id]) {
                                rclient.srem(SchedulerBuffer.bufferName, ids[i]);
                                if (payment.id != null) {
                                    new Scheduler_1.Scheduler(payment.id, () => __awaiter(this, void 0, void 0, function* () {
                                        executePullPayment(payment.id);
                                    })).start(true);
                                    switch (payment.status) {
                                        case (globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES[globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().initial]):
                                            Scheduler_1.Scheduler.stop(payment.id);
                                            Scheduler_1.Scheduler.restart(payment.id);
                                            break;
                                        case (globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES[globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().running]):
                                            Scheduler_1.Scheduler.stop(payment.id);
                                            Scheduler_1.Scheduler.restart(payment.id);
                                            break;
                                        case (globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES[globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().stopped]):
                                            Scheduler_1.Scheduler.stop(payment.id);
                                            break;
                                        case (globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES[globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().canceled]):
                                            Scheduler_1.Scheduler.stop(payment.id);
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
    static testScheduler(pullPaymentID) {
        return __awaiter(this, void 0, void 0, function* () {
            const pullPaymentDbConnector = new PullPaymentController_1.PullPaymentController();
            const pullPayment = (yield pullPaymentDbConnector.getPullPayment(pullPaymentID)).data[0];
            pullPayment.numberOfPayments = pullPayment.numberOfPayments - 1;
            pullPayment.lastPaymentDate = pullPayment.nextPaymentDate;
            pullPayment.nextPaymentDate = pullPayment.numberOfPayments === 0 ?
                pullPayment.nextPaymentDate : Number(pullPayment.nextPaymentDate) + pullPayment.frequency;
            pullPayment.status = pullPayment.numberOfPayments === 0 ? globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().done : globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM()[pullPayment.status],
                yield pullPaymentDbConnector.updatePullPayment(pullPayment);
        });
    }
}
SchedulerBuffer.bufferName = 'scheduler_keys';
SchedulerBuffer.SCHEDULER_BUFFER = [];
exports.SchedulerBuffer = SchedulerBuffer;
//# sourceMappingURL=ScheduleBuffer.js.map