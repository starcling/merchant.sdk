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
class ScheduleQueue {
    constructor() {
        this.executionQueue = [];
        this.isExecuting = false;
    }
    static instance() {
        if (!this._instance) {
            this._instance = new ScheduleQueue();
        }
        return this._instance;
    }
    queue(method) {
        this.executionQueue.push(method);
        this.drip();
    }
    drip() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ScheduleQueue._instance.isExecuting && ScheduleQueue._instance.executionQueue.length) {
                ScheduleQueue._instance.isExecuting = true;
                ScheduleQueue._instance.execute();
            }
            else {
                setTimeout(ScheduleQueue._instance.drip, globals_1.Globals.GET_SCHEDULE_QUEUE_INTERVAL());
            }
        });
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const id = ScheduleQueue._instance.executionQueue.shift();
            yield ScheduleBuffer_1.SchedulerBuffer.get(id).executeCallback();
            ScheduleQueue._instance.isExecuting = false;
        });
    }
}
ScheduleQueue._instance = null;
exports.ScheduleQueue = ScheduleQueue;
//# sourceMappingURL=ScheduleQueue.js.map