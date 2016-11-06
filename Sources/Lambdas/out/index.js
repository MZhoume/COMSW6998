/// <reference path="../typings/index.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import { DynamoDBManager } from './DB/DynamoDBManager';
import { validate } from './Validation/Validator';
import { requestValidAddr } from './Validation/AddressValidation';
import { genLambdaError, tryFind } from './Helpers/Helpers';
import { HttpCodes } from './Helpers/HttpCodes';
import { getFieldsToCheck } from './DB/Fields';
function tcWrapper(method, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield method;
        }
        catch (err) {
            callback(genLambdaError(HttpCodes.BadRequest, err));
        }
    });
}
export function handler(event, context, callback) {
    let db = new DynamoDBManager();
    let tableName = event.tableName;
    switch (event.operation) {
        case 'create':
            let hasError = false;
            getFieldsToCheck(tableName).forEach(r => {
                if (!hasError && !validate(event.payload, r)) {
                    hasError = true;
                    callback(genLambdaError(HttpCodes.BadRequest, r + ' is not valid'));
                }
            });
            if (!hasError) {
                tcWrapper(() => __awaiter(this, void 0, void 0, function* () {
                    if (tableName === 'addresses')
                        return db.create(tableName, yield requestValidAddr(event.payload));
                    else
                        return db.create(tableName, event.payload);
                }), callback);
            }
            break;
        case 'read':
            tcWrapper(() => db.read(tableName, event.payload), callback);
            break;
        case 'update':
            tcWrapper(() => __awaiter(this, void 0, void 0, function* () {
                if (tableName === 'addresses') {
                    let addr = yield requestValidAddr(event.payload);
                    let r = yield db.read(tableName, { key: { delivery_point_barcode: addr.delivery_point_barcode } });
                    if (!r || !r.Item) {
                        yield db.create(tableName, addr);
                    }
                    let email = tryFind(event.payload, 'email', undefined);
                    r = yield db.read('customers', { key: { email: email } });
                    if (r && r.Item) {
                        return db.update('customers', { key: { email: email }, values: { delivery_point_barcode: addr.delivery_point_barcode } });
                    }
                    else {
                        callback(genLambdaError(HttpCodes.BadRequest, email + ' does not exist'));
                    }
                }
                else {
                    return db.update(tableName, event.payload);
                }
            }), callback);
            break;
        case 'delete':
            tcWrapper(() => db.delete(tableName, event.payload), callback);
            break;
        case 'find':
            tcWrapper(() => db.find(tableName, event.payload), callback);
            break;
        case 'getaddr':
            tcWrapper(() => __awaiter(this, void 0, void 0, function* () {
                let r = yield db.read('customers', event.payload);
                if (r && r.Item) {
                    let barcode = r.Item.delivery_point_barcode;
                    return db.read('addresses', { "key": { delivery_point_barcode: barcode } });
                }
                else {
                    callback(genLambdaError(HttpCodes.BadRequest, tryFind(event.payload, 'email', 'Customer') + ' does not exist'));
                }
            }), callback);
            break;
        default:
            callback(genLambdaError(HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
