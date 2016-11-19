import * as lambda from 'aws-lambda';
import * as request from 'request';
import { IDBManager } from './Interface/IDBManager';
import { DynamoDBManager } from './DB/DynamoDBManager';
import { validate } from './Validation/Validator';
import { requestValidAddr } from './Validation/AddressValidation';
import { genLambdaError, tryFind } from './Helpers/Helpers';
import { HttpCodes } from './Helpers/HttpCodes';
import { ISmartyStreetResponse } from './Interface/ISmartyStreetResponse';
import { getFields, getFieldsToCheck, customersTableName, addressesTableName } from './DB/Fields';

async function tcWrapper(method: () => Promise<any>, callback: lambda.Callback): Promise<any> {
    try {
        callback(undefined, await method());
    } catch (err) {
        callback(genLambdaError(HttpCodes.BadRequest, err));
    }
}

export function handler(event, context: lambda.Context, callback: lambda.Callback): void {
    let dbManager: IDBManager = new DynamoDBManager();
    let tableName = event.tableName;

    switch (event.operation) {
        case 'create':
            for (let r of getFieldsToCheck(tableName)) {
                if (!validate(event.payload, r)) {
                    callback(genLambdaError(HttpCodes.BadRequest, `${r} is not valid`));
                    return;
                }
            }

            tcWrapper(async () => dbManager.create(tableName, tableName === addressesTableName ? await requestValidAddr(event.payload) : event.payload), callback);
            break;

        case 'read':
            tcWrapper(() => dbManager.get(tableName, event.payload), callback);
            break;

        case 'update':
            if (tableName === addressesTableName) {
                tcWrapper(async () => {
                    let k = tryFind(event.payload, 'key', undefined);
                    let r = await dbManager.get(customersTableName, { key: k });
                    r = await dbManager.get(addressesTableName, { key: { delivery_point_barcode: r.delivery_point_barcode } });

                    let values = tryFind(event.payload, 'values', {});
                    for (let k of getFields(tableName)) {
                        if (values[k] && values[k] !== r[k]) {
                            r[k] = values[k];
                        }
                    }

                    let addr = await requestValidAddr(r);
                    try {
                        await dbManager.get(tableName, { key: { delivery_point_barcode: addr.delivery_point_barcode } });
                    } catch (err) {
                        await dbManager.create(tableName, addr);
                    }

                    return dbManager.update(customersTableName, { key: k, values: { delivery_point_barcode: addr.delivery_point_barcode } });
                }, callback);
            } else {
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
            tcWrapper(async () => {
                let r = await dbManager.get(customersTableName, event.payload);
                return dbManager.get(addressesTableName, { "key": { delivery_point_barcode: r.delivery_point_barcode } });
            }, callback);
            break;

        default:
            callback(genLambdaError(HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
