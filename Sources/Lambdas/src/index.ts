import * as lambda from 'aws-lambda';
import * as request from 'request';
import { IDBManager } from './Interfaces/IDBManager';
import { DynamoDBManager } from './DB/DynamoDBManager';
import { validate } from './Validation/Validator';
import { requestValidAddr } from './Validation/AddressValidation';
import { genLambdaError, tryFind } from './Helpers/Helpers';
import { HttpCodes } from './Interfaces/HttpCodes';
import { ISmartyStreetResponse } from './Interfaces/ISmartyStreetResponse';
import { getFields, getFieldsToCheck } from './DB/Fields';

async function tcWrapper(method: () => Promise<any>, callback: lambda.Callback): Promise<any> {
    try {
        callback(undefined, await method());
    } catch (err) {
        callback(genLambdaError(HttpCodes.BadRequest, err));
    }
}

export function handler(event, context: lambda.Context, callback: lambda.Callback): void {
    let tableName = event.tableName;
    let dbManager: IDBManager = new DynamoDBManager();

    switch (event.operation) {
        case 'create':
            for (let r of getFieldsToCheck(tableName)) {
                if (!validate(event.payload, r)) {
                    callback(genLambdaError(HttpCodes.BadRequest, `${r} is not valid`));
                    return;
                }
            }

            if (tableName === 'addresses') {
                tcWrapper(async () => dbManager.create(tableName, await requestValidAddr(event.payload)), callback);
            } else {
                tcWrapper(() => dbManager.create(tableName, event.payload), callback);
            }
            break;

        case 'get':
            tcWrapper(() => dbManager.get(tableName, event.payload), callback);
            break;

        case 'update':
            if (tableName === 'addresses') {
                callback(genLambdaError(HttpCodes.BadRequest, 'Cannot update an address.'));
            } else {
                tcWrapper(() => dbManager.update(tableName, event.payload), callback);
            }
            break;

        case 'delete':
            tcWrapper(() => dbManager.delete(tableName, event.payload), callback);
            break;

        case 'echo':
            callback(null, event.payload);
            break;

        default:
            callback(genLambdaError(HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
