"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPResponse_1 = require("./HTTPResponse");
const request = __importStar(require("request"));
class HTTPRequest {
    constructor(url, headers, method, body, queryParams) {
        this.url = url;
        this.headers = headers;
        this.method = method;
        this.body = body ? JSON.stringify(body) : null;
        this.queryParams = queryParams ? queryParams : null;
    }
    getResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                request({
                    url: this.url,
                    headers: this.headers,
                    method: this.method,
                    body: this.body,
                    qs: this.queryParams
                }, (error, response, data) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(new HTTPResponse_1.HTTPResponse(data, response.headers, response.statusCode));
                });
            });
        });
    }
}
exports.HTTPRequest = HTTPRequest;
//# sourceMappingURL=HTTPRequest.js.map