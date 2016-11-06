/// <reference path="../typings/index.d.ts" />

import * as lambda from 'aws-lambda';
import * as request from 'request';
import { IDBManager } from './Interface/IDBManager';
import { DynamoDBManager } from './DB/DynamoDBManager';
import { validate } from './Validation/Validator';
import { requestValidAddr } from './Validation/AddressValidation';
import { genLambdaError, tryFind } from './Helpers/Helpers';
import { HttpCodes } from './Helpers/HttpCodes';
import { ISmartyStreetResponse } from './Interface/ISmartyStreetResponse';
import { getFieldsToCheck } from './DB/Fields';

async function tcWrapper(method: () => Promise<any>, callback: lambda.Callback) {
    try {
        callback(null, await method());
    } catch (err) {
        callback(genLambdaError(HttpCodes.BadRequest, err));
    }
}

export function handler(event, context: lambda.Context, callback: lambda.Callback) {
    let db: IDBManager = new DynamoDBManager();
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
                tcWrapper(async () => {
                    if (tableName === 'addresses') return db.create(tableName, await requestValidAddr(event.payload));
                    else return db.create(tableName, event.payload);
                }, callback);
            }
            break;

        case 'read':
            tcWrapper(() => db.read(tableName, event.payload), callback);
            break;

        case 'update':
            tcWrapper(async () => {
                if (tableName === 'addresses') {
                    let addr = await requestValidAddr(event.payload);
                    let r = await db.read(tableName, { key: { delivery_point_barcode: addr.delivery_point_barcode } });
                    if (!r || !r.Item) {
                        await db.create(tableName, addr);
                    }

                    let email = tryFind(event.payload, 'email', undefined);
                    r = await db.read('customers', { key: { email: email } });
                    if (r && r.Item) {
                        return db.update('customers', { key: { email: email }, values: { delivery_point_barcode: addr.delivery_point_barcode } });
                    } else {
                        callback(genLambdaError(HttpCodes.BadRequest, email + ' does not exist'));
                    }
                } else {
                    return db.update(tableName, event.payload);
                }
            }, callback);
            break;

        case 'delete':
            tcWrapper(() => db.delete(tableName, event.payload), callback);
            break;

        case 'find':
            tcWrapper(() => db.find(tableName, event.payload), callback);
            break;

        case 'getaddr':
            tcWrapper(async () => {
                let r = await db.read('customers', event.payload);
                if (r && r.Item) {
                    let barcode = r.Item.delivery_point_barcode;
                    return db.read('addresses', { "key": { delivery_point_barcode: barcode } });
                } else {
                    callback(genLambdaError(HttpCodes.BadRequest, tryFind(event.payload, 'email', 'Customer') + ' does not exist'));
                }
            }, callback);
            break;

        default:
            callback(genLambdaError(HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
