import {Globals} from "../../utils/globals";

const nodeRSA = require('node-rsa');

export class EncryptionController {

    /**
     * @description Method for validating secret phrase
     * @param encryptedPhrase {string}
     */
    public validateSecretPhrase(encryptedPhrase: string) {
        try {
            const publicKey = Globals.GET_ENCRYPTION_PUBLIC_KEY();
            const secretPhrase = Globals.GET_ENCRYPTION_SECRET_PHRASE();
            const key = new nodeRSA();
            key.importKey(publicKey, 'pkcs8-public');
            const decrypted = key.decryptPublic(encryptedPhrase, 'utf8');

            return decrypted === secretPhrase;
        } catch (e) {
            return false;
        }

    }

    /**
     * @description Method for encrypting data with public key
     * @param data {JSON} - data in JSON format
     */
    public encryptData(data: any) {
        try {
            const publicKey = Globals.GET_ENCRYPTION_PUBLIC_KEY();
            const key = new nodeRSA();
            key.importKey(publicKey, 'pkcs8-public');

            return key.encrypt(JSON.stringify(data), 'base64', 'utf8');
        } catch (e) {
            return null;
        }

    }

}