import {Globals} from "../../utils/globals";

const nodeRSA = require('node-rsa');

export class EncryptionController {

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

}