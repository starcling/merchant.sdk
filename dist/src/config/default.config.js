"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultConfig {
    static get settings() {
        return {
            apiUrl: 'http://localhost:8081/api/v1',
            generateQRApiUrl: '/qr/url',
            loginUrl: '/login',
            generateApiKeyUrl: '/auth/generate-api-key',
            generateAccessTokenUrl: '/auth/token/generate',
        };
    }
}
exports.DefaultConfig = DefaultConfig;
//# sourceMappingURL=default.config.js.map