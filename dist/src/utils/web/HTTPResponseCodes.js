"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HTTPResponseCodes {
    static OK() {
        return 200;
    }
    static CREATED() {
        return 201;
    }
    static NO_CONTENT() {
        return 204;
    }
    static NOT_MODIFIED() {
        return 304;
    }
    static BAD_REQUEST() {
        return 400;
    }
    static UNAUTHORIZED() {
        return 401;
    }
    static FORBIDDEN() {
        return 403;
    }
    static NOT_FOUND() {
        return 404;
    }
    static METHOD_NOT_ALLOWED() {
        return 405;
    }
    static GONE() {
        return 410;
    }
    static UNSUPPORTED_MEDIA_TYPE() {
        return 415;
    }
    static UNPROCESSABLE_ENTITY() {
        return 422;
    }
    static TOO_MANY_REQUESTS() {
        return 429;
    }
    static INTERNAL_SERVER_ERROR() {
        return 500;
    }
}
exports.HTTPResponseCodes = HTTPResponseCodes;
//# sourceMappingURL=HTTPResponseCodes.js.map