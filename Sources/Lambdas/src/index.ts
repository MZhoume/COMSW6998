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
import { getFieldsToCheck, customersTableName, addressesTableName } from './DB/Fields';

function tcWrapper(method: () => void, callback: lambda.Callback) {
    try {
        method();
    } catch (err) {
        callback(genLambdaError(HttpCodes.BadRequest, err));
    }
}

export function handler(event, context: lambda.Context, callback: lambda.Callback) {
    let dbManager: IDBManager = new DynamoDBManager();
    let tableName = event.tableName;

    switch (event.operation) {
        // TODO: where to check the errors, here or dbmanager?
        case 'create':
            for (let r of getFieldsToCheck(tableName)) {
                if (!validate(event.payload, r)) {
                    callback(genLambdaError(HttpCodes.BadRequest, `${r} is not valid`));
                    return;
                }
            }

            tcWrapper(async () => callback(undefined, await dbManager.create(tableName,
                tableName === addressesTableName ? await requestValidAddr(event.payload) : event.payload)),
                callback);
            break;

        case 'read':
            tcWrapper(async () => callback(undefined, await dbManager.get(tableName, event.payload)), callback);
            break;

        case 'update':
            if (tableName === addressesTableName) {
                tcWrapper(async () => {
                    let addr = await requestValidAddr(event.payload);
                    let r = await dbManager.get(tableName, { key: { delivery_point_barcode: addr.delivery_point_barcode } });
                    if (!r || !r.Item) {
                        await dbManager.create(tableName, addr);
                    }

                    let email = tryFind(event.payload, 'email', undefined);
                    r = await dbManager.get(customersTableName, { key: { email: email } });
                    if (r && r.Item) {
                        callback(undefined, await dbManager.update(customersTableName,
                            { key: { email: email }, values: { delivery_point_barcode: addr.delivery_point_barcode } }));
                    } else {
                        callback(genLambdaError(HttpCodes.BadRequest, `${email} does not exist`));
                    }
                }, callback);
            } else {
                tcWrapper(async () => callback(undefined, await dbManager.update(tableName, event.payload)), callback);
            }
            break;

        case 'delete':
            tcWrapper(async () => callback(undefined, await dbManager.delete(tableName, event.payload)), callback);
            break;

        case 'find':
            tcWrapper(async () => callback(undefined, await dbManager.find(tableName, event.payload)), callback);
            break;

        case 'getaddr':
            tcWrapper(async () => {
                let r = await dbManager.get(customersTableName, event.payload);
                if (r && r.Item) {
                    let barcode = r.Item.delivery_point_barcode;
                    callback(undefined, await dbManager.get(addressesTableName, { "key": { delivery_point_barcode: barcode } }));
                } else {
                    callback(genLambdaError(HttpCodes.BadRequest, `${tryFind(event.payload, 'email', 'Customer')} does not exist`));
                }
            }, callback);
            break;

        default:
            callback(genLambdaError(HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
