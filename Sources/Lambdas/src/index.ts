/// <reference path="../typings/index.d.ts" />

import * as lambda from 'aws-lambda'
import * as request from 'request'
import { DynamoDBManager } from './DB/DynamoDBManager'
import { getKeys } from './DB/Fields'
import { validate } from './Validation/Validator'
import { LambdaError } from './LambdaError'

export function handler(event, context: lambda.Context, callback: lambda.Callback) {
    let db = new DynamoDBManager();
    let tableName = event.tableName;

    if (!validate(event.payload, 'email', callback)
        || !validate(event.payload, 'zipcode', callback)) {
        return;
    }

    switch (event.operation) {
        case 'create':
            db.create(tableName, event.payload, callback);
            break;

        case 'read':
            db.read(tableName, event.payload, callback);
            break;

        case 'update':
            db.update(tableName, event.payload, callback);
            break;

        case 'delete':
            db.delete(tableName, event.payload, callback);
            break;

        case 'find':
            db.find(tableName, event.payload, callback);
            break;

        case 'getaddr':
            db.read('customers', event.payload, (err, res) => {
                if (res) {
                    let barcode = res.Item.delivery_point_barcode;
                    db.read('addresses', {
                        "key": {
                            "delivery_point_barcode": barcode
                        }
                    }, callback);
                }
            });
            break;
        
        default:
            break;
    }
}
