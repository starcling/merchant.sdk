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
const ScheduleBuffer_1 = require("./ScheduleBuffer");
const globals_1 = require("../../utils/globals");
const ScheduleHelper_1 = require("./ScheduleHelper");
const ScheduleQueue_1 = require("./ScheduleQueue");
const schedule = require('node-schedule');
class Scheduler {
    constructor(_pullPaymentID, _callback) {
        this._pullPaymentID = _pullPaymentID;
        this._callback = _callback;
        this._interval = null;
        this._schedule = null;
        this._restarting = false;
    }
    start(reinitialized = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const pullpayment = yield ScheduleHelper_1.ScheduleHelper.getPullPayment(this._pullPaymentID);
            if (!reinitialized)
                yield ScheduleHelper_1.ScheduleHelper.adjustStartTime(pullpayment);
            this._schedule = yield this.scheduleJob();
            return ScheduleBuffer_1.SchedulerBuffer.set(this._pullPaymentID, this);
        });
    }
    static stop(pullPaymentID) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield ScheduleHelper_1.ScheduleHelper.getPullPayment(pullPaymentID);
            const scheduler = ScheduleBuffer_1.SchedulerBuffer.get(pullPaymentID);
            if (scheduler && payment) {
                if (scheduler._schedule) {
                    scheduler._schedule.cancel();
                }
                if (scheduler._interval) {
                    clearInterval(scheduler._interval);
                    scheduler._interval = null;
                }
                yield ScheduleHelper_1.ScheduleHelper.updatePaymentStatus(payment, globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().stopped);
                return pullPaymentID;
            }
            return null;
        });
    }
    static restart(pullPaymentID) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheduler = ScheduleBuffer_1.SchedulerBuffer.get(pullPaymentID);
            const pullPayment = yield ScheduleHelper_1.ScheduleHelper.getPullPayment(pullPaymentID);
            if (scheduler && pullPayment && pullPayment.status == globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM_NAMES()[globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().stopped] && !scheduler._restarting) {
                scheduler._restarting = true;
                yield ScheduleHelper_1.ScheduleHelper.updatePaymentStatus(pullPayment, globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().initial);
                const currentDate = Math.floor((new Date().getTime() / 1000));
                let nextPayment = Math.floor(Number(pullPayment.nextPaymentDate));
                let numberOfPayments = Math.floor(Number(pullPayment.numberOfPayments));
                while (nextPayment <= currentDate && numberOfPayments > 0) {
                    numberOfPayments--;
                    nextPayment = nextPayment + pullPayment.frequency;
                    ScheduleQueue_1.ScheduleQueue.instance().queue(pullPaymentID);
                }
                if (numberOfPayments > 0) {
                    yield ScheduleHelper_1.ScheduleHelper.updatePaymentStatus(pullPayment, globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().running);
                    scheduler._schedule = yield scheduler.scheduleJob(nextPayment);
                }
                scheduler._restarting = false;
                return pullPaymentID;
            }
            return null;
        });
    }
    get interval() {
        return this._interval;
    }
    get instance() {
        return this._schedule;
    }
    scheduleJob(startTime = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield ScheduleHelper_1.ScheduleHelper.getPullPayment(this._pullPaymentID);
            startTime = startTime ? startTime : payment.startTimestamp;
            return schedule.scheduleJob(payment.id, new Date(Number(startTime) * 1000), () => __awaiter(this, void 0, void 0, function* () {
                const payment = yield ScheduleHelper_1.ScheduleHelper.getPullPayment(this._pullPaymentID);
                yield ScheduleHelper_1.ScheduleHelper.updatePaymentStatus(payment, globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().running);
                yield this.executeCallback();
                this._interval = this.startInterval(payment.frequency);
                const scheduler = ScheduleBuffer_1.SchedulerBuffer.get(payment.id);
                if (scheduler) {
                    scheduler._interval = this._interval;
                    ScheduleBuffer_1.SchedulerBuffer.set(payment.id, scheduler);
                }
            }));
        });
    }
    startInterval(interval) {
        return setInterval(() => {
            this.executeCallback();
        }, interval * 1000);
    }
    executeCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            let pullPayment = yield ScheduleHelper_1.ScheduleHelper.getPullPayment(this._pullPaymentID);
            if (pullPayment && (pullPayment.numberOfPayments > 0 && (Number(pullPayment.nextPaymentDate) <= Math.floor(new Date().getTime() / 1000)))) {
                yield this._callback();
                pullPayment = yield ScheduleHelper_1.ScheduleHelper.getPullPayment(this._pullPaymentID);
                if (pullPayment.numberOfPayments == 0) {
                    Scheduler.stop(this._pullPaymentID);
                    ScheduleBuffer_1.SchedulerBuffer.delete(this._pullPaymentID);
                    yield ScheduleHelper_1.ScheduleHelper.updatePaymentStatus(pullPayment, globals_1.Globals.GET_PULL_PAYMENT_STATUS_ENUM().done);
                }
            }
        });
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=Scheduler.js.map