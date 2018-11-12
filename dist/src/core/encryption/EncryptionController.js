"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../../utils/globals");
const nodeRSA = require('node-rsa');
class EncryptionController {
    validateSecretPhrase(encryptedPhrase) {
        try {
            const publicKey = globals_1.Globals.GET_ENCRYPTION_PUBLIC_KEY();
            const secretPhrase = globals_1.Globals.GET_ENCRYPTION_SECRET_PHRASE();
            const key = new nodeRSA();
            key.importKey(publicKey, 'pkcs8-public');
            const decrypted = key.decryptPublic(encryptedPhrase, 'utf8');
            return decrypted === secretPhrase;
        }
        catch (e) {
            return false;
        }
    }
}
exports.EncryptionController = EncryptionController;
//# sourceMappingURL=EncryptionController.js.map