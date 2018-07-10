"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPRequest_1 = require("./HTTPRequest");
class HTTPRequestFactory {
    create(url, headers, method, body, queryParams) {
        return new HTTPRequest_1.HTTPRequest(url, headers, method, body, queryParams);
    }
}
exports.HTTPRequestFactory = HTTPRequestFactory;
//# sourceMappingURL=HTTPRequestFactory.js.map