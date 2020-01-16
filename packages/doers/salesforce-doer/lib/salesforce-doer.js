"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
const JsForce = __importStar(require("jsforce"));
const low_1 = require("low");
class SalesforceDoer extends low_1.Doer {
    constructor() {
        super(...arguments);
        this.connections = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setupConnections();
        });
    }
    setupConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [name, config] of Object.entries(this.config.connections)) {
                this.connections[name] = new JsForce.Connection(config);
                yield this.login(name);
            }
        });
    }
    login(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connections.hasOwnProperty(name)) {
                throw new Error(`Connection with the name '${name}' does not exist`);
            }
            if (!this.secrets.credentials.hasOwnProperty(name)) {
                throw new Error(`No credential for connection'${name}' have been provided`);
            }
            const connection = this.connections[name];
            const credential = this.secrets.credentials[name];
            if (connection.accessToken) {
                return;
            }
            yield connection.login(credential.username, credential.password);
        });
    }
    main(context, taskConfig, coreConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.connections[coreConfig.connection];
            yield this.login(coreConfig.connection);
            switch (coreConfig.method) {
                case ('query'):
                    return yield this.executeQuery(connection, coreConfig);
                case ('search'):
                    return yield this.executeSearch(connection, coreConfig);
                case ('retrieve'):
                    return yield this.executeRetrieve(connection, coreConfig);
                case ('create'):
                    return yield this.executeCreate(connection, coreConfig);
                case ('update'):
                    return yield this.executeUpdate(connection, coreConfig);
                case ('delete'):
                    return yield this.executeDelete(connection, coreConfig);
                case ('upsert'):
                    return yield this.executeUpsert(connection, coreConfig);
                case ('apex'):
                    return yield this.executeApex(connection, coreConfig);
                case ('bulkCrud'):
                    return yield this.executeBulkCrud(connection, coreConfig);
                case ('bulkQuery'):
                    return yield this.executeBulkQuery(connection, coreConfig);
            }
        });
    }
    executeQuery(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            if (call.locator) {
                return yield connection.queryMore(call.locator, call.executeOptions);
            }
            if (call.all) {
                return yield connection.queryAll(call.query, call.executeOptions);
            }
            else {
                return yield connection.query(call.query, call.executeOptions);
            }
        });
    }
    executeSearch(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield connection.search(call.search);
        });
    }
    executeRetrieve(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield connection.sobject(call.resource).retrieve(call.ids, call.restApiOptions);
        });
    }
    executeCreate(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield connection.sobject(call.resource).create(call.objects, call.restApiOptions);
        });
    }
    executeUpdate(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield connection.sobject(call.resource).update(call.objects, call.restApiOptions);
        });
    }
    executeDelete(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield connection.sobject(call.resource).destroy(call.ids);
        });
    }
    executeUpsert(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield connection.sobject(call.resource).upsert(call.objects, call.extIdField, call.restApiOptions);
        });
    }
    executeApex(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            const restApiOptions = call.restApiOptions || {};
            const verb = call.verb.toLowerCase();
            if (verb === 'delete' || verb === 'get') {
                return yield connection.apex[verb](call.path, restApiOptions);
            }
            else if (verb === 'patch' || verb === 'post' || verb === 'put') {
                return yield connection.apex[verb](call.path, call.body || {}, restApiOptions);
            }
            throw new Error(`Invalid verb '${call.verb}' to '${call.path}'. Was expecting 'DELETE', 'GET', 'PATCH', 'POST', or 'PUT'`);
        });
    }
    executeBulkCrud(connection, call) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = connection.bulk.createJob(call.resource, call.operation, call.bulkOptions);
            const batchesResults = [];
            for (const records of call.batches) {
                const results = yield this.runCrudBatch(job, records, call.pollInterval, call.pollTimeout);
                batchesResults.push(results);
            }
            return batchesResults;
        });
    }
    runCrudBatch(job, records, pollInterval = 5000, pollTimeout = 30000) {
        return new Promise((resolve, reject) => {
            const batch = job.createBatch();
            batch.execute(records);
            batch.on('error', (batchInfo) => {
                console.error('Batch error', batchInfo);
                reject(batchInfo);
            });
            batch.on('queue', (batchInfo) => {
                console.log('Batch queued', batchInfo);
                batch.poll(pollInterval, pollTimeout);
            });
            batch.on('response', (results) => {
                resolve(results);
            });
        });
    }
    executeBulkQuery(connection, call) {
        return new Promise((resolve, reject) => {
            const records = [];
            const batch = connection.bulk.query(call.query);
            batch.on('record', (record) => {
                records.push(record);
            });
            batch.on('error', (err) => {
                console.error(err);
                reject(err);
            });
            batch.on('end', () => {
                resolve(records);
            });
        });
    }
}
exports.SalesforceDoer = SalesforceDoer;
//# sourceMappingURL=salesforce-doer.js.map