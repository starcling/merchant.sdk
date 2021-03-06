"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataServiceEncrypted_1 = require("../../utils/datasource/DataServiceEncrypted");
class PrivateKeysDbConnector {
    getPrivateKey(address) {
        const sqlQuery = {
            text: 'CALL get_private_key_from_address(?)',
            values: [address]
        };
        return new DataServiceEncrypted_1.DataServiceEncrypted().executeQueryAsPromise(sqlQuery);
    }
    addAddress(address, pKey) {
        const sqlQuery = {
            text: 'CALL add_account(?, ?)',
            values: [address, pKey]
        };
        return new DataServiceEncrypted_1.DataServiceEncrypted().executeQueryAsPromise(sqlQuery);
    }
}
exports.PrivateKeysDbConnector = PrivateKeysDbConnector;
//# sourceMappingURL=PrivateKeysDbConnector.js.map