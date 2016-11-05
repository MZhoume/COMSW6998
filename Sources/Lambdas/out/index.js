/// <reference path="../typings/index.d.ts" />
"use strict";
var DynamoDBManager_1 = require('./DB/DynamoDBManager');
var Validator_1 = require('./Validation/Validator');
var AddressValidation_1 = require('./Validation/AddressValidation');
var Helpers_1 = require('./Helpers/Helpers');
var HttpCodes_1 = require('./Helpers/HttpCodes');
function genericCallback(err, res, callback) {
    if (err) {
        callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, err));
    }
    else {
        callback(null, res);
    }
}
function checkAddress(payload, callback, onResult) {
    AddressValidation_1.validateAddress(payload, function (err, addr) {
        if (err) {
            callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, err));
        }
        else {
            onResult(addr);
        }
    });
}
function handler(event, context, callback) {
    var db = new DynamoDBManager_1.DynamoDBManager();
    var tableName = event.tableName;
    switch (event.operation) {
        case 'create':
            if (tableName === 'addresses') {
                if (Validator_1.validate(event.payload, 'zipcode')) {
                    callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, 'Zipcode is not valid'));
                }
                else {
                    checkAddress(event.payload, callback, function (addr) { return db.create(tableName, addr, function (err, res) { return genericCallback(err, res, callback); }); });
                }
            }
            else {
                if (Validator_1.validate(event.payload, 'email')) {
                    callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, 'Email is not valid'));
                }
                else {
                    db.create(tableName, event.payload, function (err, res) { return genericCallback(err, res, callback); });
                }
            }
            break;
        case 'read':
            db.read(tableName, event.payload, callback);
            break;
        case 'update':
            if (tableName === 'addresses') {
                checkAddress(event.payload, callback, function (addr) { return db.update(tableName, addr, function (err, res) { return genericCallback(err, res, callback); }); });
            }
            else {
                db.update(tableName, event.payload, function (err, res) { return genericCallback(err, res, callback); });
            }
            break;
        case 'delete':
            db.delete(tableName, event.payload, callback);
            break;
        case 'find':
            db.find(tableName, event.payload, callback);
            break;
        case 'getaddr':
            db.read('customers', event.payload, function (err, res) {
                if (res) {
                    var barcode = res.Item.delivery_point_barcode;
                    db.read('addresses', {
                        "key": {
                            "delivery_point_barcode": barcode
                        }
                    }, callback);
                }
            });
            break;
        default:
            callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
exports.handler = handler;
