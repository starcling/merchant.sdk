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
    constructor(_contractID, _callback) {
        this._contractID = _contractID;
        this._callback = _callback;
        this._interval = null;
        this._schedule = null;
        this._restarting = false;
    }
    start(reinitialized = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentContract = yield ScheduleHelper_1.ScheduleHelper.getContract(this._contractID);
            if (!reinitialized)
                yield ScheduleHelper_1.ScheduleHelper.adjustStartTime(paymentContract);
            this._schedule = yield this.scheduleJob();
            return ScheduleBuffer_1.SchedulerBuffer.set(this._contractID, this);
        });
    }
    static stop(contractID) {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentContract = yield ScheduleHelper_1.ScheduleHelper.getContract(contractID);
            const scheduler = ScheduleBuffer_1.SchedulerBuffer.get(contractID);
            if (scheduler && paymentContract) {
                if (scheduler._schedule) {
                    scheduler._schedule.cancel();
                }
                if (scheduler._interval) {
                    clearInterval(scheduler._interval);
                    scheduler._interval = null;
                }
                yield ScheduleHelper_1.ScheduleHelper.updateContractStatus(paymentContract, globals_1.Globals.GET_PAYMENT_STATUS_ENUM().stopped);
                return contractID;
            }
            return null;
        });
    }
    static restart(contractID) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheduler = ScheduleBuffer_1.SchedulerBuffer.get(contractID);
            const paymentContract = yield ScheduleHelper_1.ScheduleHelper.getContract(contractID);
            if (scheduler && paymentContract && paymentContract.status == globals_1.Globals.GET_CONTRACT_STATUS_ENUM_NAMES()[globals_1.Globals.GET_PAYMENT_STATUS_ENUM().stopped] && !scheduler._restarting) {
                scheduler._restarting = true;
                yield ScheduleHelper_1.ScheduleHelper.updateContractStatus(paymentContract, globals_1.Globals.GET_PAYMENT_STATUS_ENUM().initial);
                const currentDate = Math.floor((new Date().getTime() / 1000));
                let nextPayment = Math.floor(Number(paymentContract.nextPaymentDate));
                let numberOfPayments = Math.floor(Number(paymentContract.numberOfPayments));
                while (nextPayment <= currentDate && numberOfPayments > 0) {
                    numberOfPayments--;
                    nextPayment = nextPayment + paymentContract.frequency;
                    ScheduleQueue_1.ScheduleQueue.instance().queue(contractID);
                }
                if (numberOfPayments > 0) {
                    yield ScheduleHelper_1.ScheduleHelper.updateContractStatus(paymentContract, globals_1.Globals.GET_PAYMENT_STATUS_ENUM().running);
                    scheduler._schedule = yield scheduler.scheduleJob(nextPayment);
                }
                scheduler._restarting = false;
                return contractID;
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
            const paymentContract = yield ScheduleHelper_1.ScheduleHelper.getContract(this._contractID);
            startTime = startTime ? startTime : paymentContract.startTimestamp;
            return schedule.scheduleJob(paymentContract.id, new Date(Number(startTime) * 1000), () => __awaiter(this, void 0, void 0, function* () {
                const paymentContract = yield ScheduleHelper_1.ScheduleHelper.getContract(this._contractID);
                yield ScheduleHelper_1.ScheduleHelper.updateContractStatus(paymentContract, globals_1.Globals.GET_PAYMENT_STATUS_ENUM().running);
                yield this.executeCallback();
                this._interval = this.startInterval(paymentContract.frequency);
                const scheduler = ScheduleBuffer_1.SchedulerBuffer.get(paymentContract.id);
                if (scheduler) {
                    scheduler._interval = this._interval;
                    ScheduleBuffer_1.SchedulerBuffer.set(paymentContract.id, scheduler);
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
            let paymentContract = yield ScheduleHelper_1.ScheduleHelper.getContract(this._contractID);
            if (paymentContract && (paymentContract.numberOfPayments > 0 && (Number(paymentContract.nextPaymentDate) <= Math.floor(new Date().getTime() / 1000)))) {
                yield this._callback();
                paymentContract = yield ScheduleHelper_1.ScheduleHelper.getContract(this._contractID);
                if (paymentContract.numberOfPayments == 0) {
                    Scheduler.stop(this._contractID);
                    ScheduleBuffer_1.SchedulerBuffer.delete(this._contractID);
                    yield ScheduleHelper_1.ScheduleHelper.updateContractStatus(paymentContract, globals_1.Globals.GET_PAYMENT_STATUS_ENUM().done);
                }
            }
        });
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=Scheduler.js.map