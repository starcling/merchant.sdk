"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dbErrorHelper_1 = require("./helpers/dbErrorHelper");
const default_config_1 = require("../../config/default.config");
class DataService {
    executeQuery(sqlQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            this.pool = new pg_1.Pool({
                user: default_config_1.DefaultConfig.settings.pgUser,
                host: default_config_1.DefaultConfig.settings.pgHost,
                database: default_config_1.DefaultConfig.settings.pgDatabase,
                password: default_config_1.DefaultConfig.settings.pgPassword,
                port: Number(default_config_1.DefaultConfig.settings.pgPort)
            });
            this.pool.on('error', (error, client) => {
                process.exit(-1);
            });
            return this.pool.query(sqlQuery);
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
                if (result.rows.length === 0) {
                    queryMessage.status = 204;
                    queryMessage.message = `SQL Query returned no data from database.`;
                    resolve(queryMessage);
                }
                else if (isInsert) {
                    queryMessage.success = true;
                    queryMessage.status = 201;
                    queryMessage.message = `SQL Insert Query completed successful.`;
                    queryMessage.data = result.rows;
                    resolve(queryMessage);
                }
                else {
                    queryMessage.success = true;
                    queryMessage.status = 200;
                    queryMessage.message = `SQL Query completed successful.`;
                    queryMessage.data = result.rows;
                    resolve(queryMessage);
                }
                this.pool.end();
            }
            catch (err) {
                const errorReason = dbErrorHelper_1.DbErrorHelper.GET_DB_ERROR_CODES()[err.code] ? dbErrorHelper_1.DbErrorHelper.GET_DB_ERROR_CODES()[err.code] : err.stack;
                queryMessage.status = 400;
                queryMessage.message = `SQL Query failed. Reason: ${errorReason}`;
                queryMessage.error = err.code;
                reject(queryMessage);
                this.pool.end();
            }
        }));
    }
}
exports.DataService = DataService;
//# sourceMappingURL=DataService.js.map