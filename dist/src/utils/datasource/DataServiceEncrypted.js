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
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = __importStar(require("mysql"));
const default_config_1 = require("../../../src/config/default.config");
class DataServiceEncrypted {
    constructor() {
        this.databaseConnected = false;
    }
    executeQuery(sqlQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.pool = mysql.createPool({
                    user: default_config_1.DefaultConfig.settings.keyDbUser,
                    host: default_config_1.DefaultConfig.settings.keyDbHost,
                    database: default_config_1.DefaultConfig.settings.keyDb,
                    password: default_config_1.DefaultConfig.settings.keyDbPass,
                    port: default_config_1.DefaultConfig.settings.keyDbPort,
                    multipleStatements: true
                });
                this.pool.getConnection((err, connection) => {
                    if (err) {
                        console.error(`Error On MySQL Pool. Reason: ${err.message}`);
                        process.exit(-1);
                    }
                    connection.query(sqlQuery.text, sqlQuery.values, (error, results, fields) => {
                        if (error) {
                            this.pool.end();
                            reject(error);
                        }
                        else {
                            this.pool.end();
                            resolve(results);
                        }
                    });
                });
            });
        });
    }
    executeQueryAsPromise(sqlQuery, isInsert = false) {
        const queryMessage = {
            success: false,
            status: 200,
            message: ''
        };
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.executeQuery(sqlQuery);
                if (result.affectedRows !== undefined) {
                    if (result.affectedRows !== 0) {
                        queryMessage.success = true;
                        queryMessage.status = 201;
                        queryMessage.message = `SQL Insert Query completed successful.`;
                        queryMessage.data = {};
                        return resolve(queryMessage);
                    }
                    else {
                        queryMessage.status = 204;
                        queryMessage.message = `SQL Query returned no data from database.`;
                        return resolve(queryMessage);
                    }
                }
                if (Object.keys(result).length === 0) {
                    queryMessage.status = 204;
                    queryMessage.message = `SQL Query returned no data from database.`;
                    return resolve(queryMessage);
                }
                let statusIndex = '-1';
                Object.keys(result).map(key => {
                    if (result[key].affectedRows !== undefined) {
                        statusIndex = key;
                    }
                });
                if (statusIndex === '-1') {
                    queryMessage.success = true;
                    queryMessage.status = 200;
                    queryMessage.message = `SQL Query completed successful.`;
                    queryMessage.data = result;
                    return resolve(queryMessage);
                }
                if (result[0][0].length === 0) {
                    queryMessage.status = 204;
                    queryMessage.message = `SQL Query returned no data from database.`;
                    return resolve(queryMessage);
                }
                queryMessage.success = true;
                queryMessage.status = 200;
                queryMessage.message = `SQL Query completed successful.`;
                queryMessage.data = result[0];
                resolve(queryMessage);
            }
            catch (err) {
                queryMessage.status = 400;
                queryMessage.message = `SQL Query failed. Reason: ${err.message}`;
                queryMessage.error = err.code;
                console.debug(err);
                resolve(queryMessage);
            }
        }));
    }
    getConnectionStatus() {
        return this.databaseConnected;
    }
}
exports.DataServiceEncrypted = DataServiceEncrypted;
//# sourceMappingURL=DataServiceEncrypted.js.map