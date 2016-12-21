"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const sha1 = require("sha1");
const DynamoDBManager_1 = require("./DB/DynamoDBManager");
const Validator_1 = require("./Validation/Validator");
const AddressValidation_1 = require("./Validation/AddressValidation");
const Helpers_1 = require("./Helpers/Helpers");
const Fields_1 = require("./DB/Fields");
function tcWrapper(method, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            callback(undefined, yield method());
        }
        catch (err) {
            callback(Helpers_1.genLambdaError(400 /* BadRequest */, err));
        }
    });
}
function generateID(tableName, payload, dataSource) {
    if (tableName !== 'property') {
        let tbn = Fields_1.getTracebacks(tableName);
        let tnn = tbn[tbn.length - 1];
        payload[`${tnn}ID`] = sha1(dataSource[tnn]);
    }
}
function handler(event, context, callback) {
    let tableName = event.tableName;
    let dbManager = new DynamoDBManager_1.DynamoDBManager();
    switch (event.operation) {
        case 'create':
            for (let r of Fields_1.getFieldsToCheck(tableName)) {
                if (!Validator_1.validate(event.payload, r)) {
                    callback(Helpers_1.genLambdaError(400 /* BadRequest */, `${r} is not valid`));
                    return;
                }
            }
            if (tableName === 'addresses') {
                tcWrapper(() => __awaiter(this, void 0, void 0, function* () { return dbManager.create(tableName, yield AddressValidation_1.requestValidAddr(event.payload)); }), callback);
            }
            else if (tableName === 'customers') {
                tcWrapper(() => dbManager.create(tableName, event.payload), callback);
            }
            else {
                tcWrapper(() => __awaiter(this, void 0, void 0, function* () {
                    let tb = Fields_1.getTracebacks(tableName);
                    for (let i = 0; i < tb.length; i++) {
                        let tn = tb[i];
                        let uuid = sha1(event.payload[tn]);
                        let payload = {
                            UUID: uuid,
                            name: event.payload[tn]
                        };
                        generateID(tn, payload, event.payload);
                        try {
                            yield dbManager.get(tn, { key: { UUID: uuid } });
                        }
                        catch (ex) {
                            yield dbManager.create(tn, payload);
                        }
                    }
                    let payload = event.payload;
                    payload['UUID'] = sha1(event.payload['name']);
                    generateID(tableName, payload, payload);
                    return dbManager.create(tableName, event.payload);
                }), callback);
            }
            break;
        case 'get':
            tcWrapper(() => dbManager.get(tableName, event.payload), callback);
            break;
        case 'update':
            if (tableName === 'addresses') {
                callback(Helpers_1.genLambdaError(400 /* BadRequest */, 'Cannot update an address.'));
            }
            else {
                tcWrapper(() => dbManager.update(tableName, event.payload), callback);
            }
            break;
        case 'delete':
            tcWrapper(() => dbManager.delete(tableName, event.payload), callback);
            break;
        case 'find':
            tcWrapper(() => dbManager.find(tableName, event.payload), callback);
            break;
        case 'echo':
            callback(null, event.payload);
            break;
        default:
            callback(Helpers_1.genLambdaError(400 /* BadRequest */, "Bad Request Path"));
            break;
    }
}
exports.handler = handler;
