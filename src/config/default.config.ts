export class DefaultConfig {
    public static get settings() {
        return {
            apiUrl: 'http://localhost:8081/api/v1',
            generateQRApiUrl: '/qr/url/',
            paymentsURL: '/payments',
            loginUrl: '/login',
            generateApiKeyUrl: '/auth/generate-api-key',
            generateAccessTokenUrl: '/auth/token/generate',
        };
    }
}
