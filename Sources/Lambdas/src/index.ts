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
            if (tableName === 'addresses') {
                if (validate(event.payload, 'zipcode')) {
                    callback(genLambdaError(HttpCodes.BadRequest, 'Zipcode is not valid'));
                } else {
                    checkAddress(event.payload, callback, addr => db.create(tableName, addr, (err, res) => genericCallback(err, res, callback)));
                }
            } else {
                if (validate(event.payload, 'email')) {
                    callback(genLambdaError(HttpCodes.BadRequest, 'Email is not valid'));
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
                checkAddress(event.payload, callback, addr => db.update(tableName, addr, (err, res) => genericCallback(err, res, callback)));
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
                    db.read('addresses', {
                        "key": {
                            "delivery_point_barcode": barcode
                        }
                    }, callback);
                }
            });
            break;

        default:
            callback(genLambdaError(HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
