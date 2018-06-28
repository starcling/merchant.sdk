export class DefaultConfig {
    public static get settings() {
        return {
            apiUrl: 'http://localhost:8081/api/v1',
            generateQRApiUrl: '/qr/url'
        };
    }
}
