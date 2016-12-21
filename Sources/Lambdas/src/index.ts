import * as lambda from 'aws-lambda';
import * as request from 'request-promise';
import * as sha1 from 'sha1';
import { IDBManager } from './Interfaces/IDBManager';
import { DynamoDBManager } from './DB/DynamoDBManager';
import { validate } from './Validation/Validator';
import { requestValidAddr } from './Validation/AddressValidation';
import { genLambdaError, tryFind } from './Helpers/Helpers';
import { HttpCodes } from './Interfaces/HttpCodes';
import { ISmartyStreetResponse } from './Interfaces/ISmartyStreetResponse';
import { getFields, getFieldsToCheck, getTracebacks } from './DB/Fields';

async function tcWrapper(method: () => Promise<any>, callback: lambda.Callback): Promise<any> {
    try {
        callback(undefined, await method());
    } catch (err) {
        callback(genLambdaError(HttpCodes.BadRequest, err));
    }
}

function generateID(tableName: string, payload: any, dataSource: any) {
    if (tableName !== 'property') {
        let tbn = getTracebacks(tableName);
        let tnn = tbn[tbn.length - 1];
        payload[`${tnn}ID`] = sha1(dataSource[tnn]);
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
            } else if (tableName === 'customers') {
                tcWrapper(() => dbManager.create(tableName, event.payload), callback);
            } else {
                tcWrapper(async () => {
                    let tb = getTracebacks(tableName);
                    for (let i = 0; i < tb.length; i++) {
                        let tn = tb[i];

                        let uuid = sha1(event.payload[tn]);
                        let payload = {
                            UUID: uuid,
                            name: event.payload[tn]
                        };

                        generateID(tn, payload, event.payload);

                        try {
                            await dbManager.get(tn, { key: { UUID: uuid } });
                        } catch (ex) {
                            await dbManager.create(tn, payload);
                        }
                    }

                    let payload = event.payload;
                    payload['UUID'] = sha1(event.payload['name']);
                    generateID(tableName, payload, payload);
                    return dbManager.create(tableName, event.payload);
                }, callback);
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

        case 'find':
            tcWrapper(() => dbManager.find(tableName, event.payload), callback);
            break;

        case 'echo':
            callback(null, event.payload);
            break;

        default:
            callback(genLambdaError(HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
