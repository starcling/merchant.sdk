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
const globals_1 = require("../../utils/globals");
const PaymentContractController_1 = require("../database/PaymentContractController");
class ScheduleHelper {
    static adjustStartTime(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTime = Number(new Date().getTime() / 1000);
            if (Number(payment.startTimestamp) <= currentTime && Number(payment.startTimestamp) + globals_1.Globals.GET_START_SCHEDULER_TIME_WINDOW() >= currentTime) {
                payment.startTimestamp = Math.floor(Number(currentTime + 1));
                yield new PaymentContractController_1.PaymentContractController().updatePayment(payment);
            }
        });
    }
    static updatePaymentStatus(payment, status) {
        return __awaiter(this, void 0, void 0, function* () {
            payment.statusID = status;
            yield new PaymentContractController_1.PaymentContractController().updatePayment(payment);
        });
    }
    static getPayment(paymentID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield new PaymentContractController_1.PaymentContractController().getPayment(paymentID).catch((err) => { console.log(err); })).data[0];
            }
            catch (err) {
                return null;
            }
        });
    }
}
exports.ScheduleHelper = ScheduleHelper;
//# sourceMappingURL=ScheduleHelper.js.map