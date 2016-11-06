/// <reference path="../typings/index.d.ts" />

import * as lambda from 'aws-lambda';
import * as request from 'request';
import { IDBManager } from './Interface/IDBManager';
import { IDBCallback } from './Interface/IDBCallback';
import { DynamoDBManager } from './DB/DynamoDBManager';
import { validate } from './Validation/Validator';
import { validateAddress } from './Validation/AddressValidation';
import { genLambdaError } from './Helpers/Helpers';
import { HttpCodes } from './Helpers/HttpCodes';
import { ISmartyStreetResponse } from './Interface/ISmartyStreetResponse';
import { getRules } from './DB/Fields';

function genericCallback(err: any, res: any, callback: lambda.Callback) {
    if (err) {
        callback(genLambdaError(HttpCodes.BadRequest, err));
    } else {
        callback(null, res);
    }
}

function checkAddress(payload: any, callback: lambda.Callback, onResult: (addr: ISmartyStreetResponse) => void) {
    validateAddress(payload, (err, addr) => {
        if (err) {
            callback(genLambdaError(HttpCodes.BadRequest, err));
        } else {
            onResult(addr);
        }
    });
}

export function handler(event, context: lambda.Context, callback: lambda.Callback) {
    let db: IDBManager = new DynamoDBManager();
    let tableName = event.tableName;

    switch (event.operation) {
        case 'create':
            let hasError = false;
            getRules(tableName).forEach(r => {
                // TODO: check user's address and put the barcode
                if (!hasError && !validate(event.payload, r)) {
                    callback(genLambdaError(HttpCodes.BadRequest, r + ' is not valid'));
                    hasError = true;
                }
            });
            
            if (!hasError) {
                if (tableName === 'addresses') {
                    checkAddress(event.payload, callback, addr => db.create(tableName, addr, (err, res) => genericCallback(err, res, callback)));
                } else {
                    db.create(tableName, event.payload, (err, res) => genericCallback(err, res, callback));
                }
            }
            break;

        case 'read':
            db.read(tableName, event.payload, callback);
            break;

        case 'update':
            if (tableName === 'addresses') {
                checkAddress(event.payload, callback, addr => {
                    db.read('addresses', { key: { delivery_point_barcode: addr.delivery_point_barcode } }, (err, res) => {
                        if (res && res.Item) {
                            // TODO: find specific user and update it
                            // db.update('customers', {})
                        } else {
                            db.create(tableName, addr, (err, res) => genericCallback(err, res, callback));
                            // TODO: find specific user and update it
                        }
                    });
                });
            } else {
                db.update(tableName, event.payload, (err, res) => genericCallback(err, res, callback));
            }
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
                    db.read('addresses', { "key": { delivery_point_barcode: barcode } }, callback);
                }
            });
            break;

        default:
            callback(genLambdaError(HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
