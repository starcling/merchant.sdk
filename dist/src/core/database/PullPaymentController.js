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
const default_config_1 = require("../../config/default.config");
class PullPaymentController {
    getPullPayment(pullPaymentID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield default_config_1.DefaultConfig.settings.getPullPayment(pullPaymentID);
        });
    }
    updatePullPayment(pullPayment) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield default_config_1.DefaultConfig.settings.updatePullPayment(pullPayment);
        });
    }
}
exports.PullPaymentController = PullPaymentController;
//# sourceMappingURL=PullPaymentController.js.map