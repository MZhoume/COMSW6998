"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const DynamoDBManager_1 = require("./DB/DynamoDBManager");
const Validator_1 = require("./Validation/Validator");
const AddressValidation_1 = require("./Validation/AddressValidation");
const Helpers_1 = require("./Helpers/Helpers");
const HttpCodes_1 = require("./Helpers/HttpCodes");
const Fields_1 = require("./DB/Fields");
const dbManager = new DynamoDBManager_1.DynamoDBManager();
function tcWrapper(method, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            callback(undefined, yield method());
        }
        catch (err) {
            callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, err));
        }
    });
}
function createIfNotExist(tableName, payload, keyName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield dbManager.get(tableName, { key: payload[keyName] });
        }
        catch (err) {
            yield dbManager.create(tableName, payload);
        }
    });
}
function handler(event, context, callback) {
    let tableName = event.tableName;
    switch (event.operation) {
        case 'create':
            for (let r of Fields_1.getFieldsToCheck(tableName)) {
                if (!Validator_1.validate(event.payload, r)) {
                    callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, `${r} is not valid`));
                    return;
                }
            }
            if (tableName === Fields_1.addressesTableName) {
                tcWrapper(() => __awaiter(this, void 0, void 0, function* () {
                    let addr = yield AddressValidation_1.requestValidAddr(event.payload);
                    createIfNotExist(tableName, addr, 'delivery_point_barcode');
                    return dbManager.update(Fields_1.customersTableName, { key: Helpers_1.tryFind(event.payload, 'key', undefined), values: { delivery_point_barcode: addr.delivery_point_barcode } });
                }), callback);
            }
            else {
                tcWrapper(() => dbManager.create(tableName, event.payload), callback);
            }
            break;
        case 'read':
            tcWrapper(() => dbManager.get(tableName, event.payload), callback);
            break;
        case 'update':
            if (tableName === Fields_1.addressesTableName) {
                tcWrapper(() => __awaiter(this, void 0, void 0, function* () {
                    let k = Helpers_1.tryFind(event.payload, 'key', undefined);
                    let r = yield dbManager.get(Fields_1.customersTableName, { key: k });
                    r = yield dbManager.get(Fields_1.addressesTableName, { key: { delivery_point_barcode: r.delivery_point_barcode } });
                    let values = Helpers_1.tryFind(event.payload, 'values', {});
                    for (let k of Fields_1.getFields(tableName)) {
                        if (values[k] && values[k] !== r[k]) {
                            r[k] = values[k];
                        }
                    }
                    let addr = yield AddressValidation_1.requestValidAddr(r);
                    createIfNotExist(tableName, addr, 'delivery_point_barcode');
                    return dbManager.update(Fields_1.customersTableName, { key: k, values: { delivery_point_barcode: addr.delivery_point_barcode } });
                }), callback);
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
        case 'getaddr':
            tcWrapper(() => __awaiter(this, void 0, void 0, function* () {
                let r = yield dbManager.get(Fields_1.customersTableName, event.payload);
                return dbManager.get(Fields_1.addressesTableName, { "key": { delivery_point_barcode: r.delivery_point_barcode } });
            }), callback);
            break;
        default:
            callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
exports.handler = handler;
