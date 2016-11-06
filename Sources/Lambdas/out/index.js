/// <reference path="../typings/index.d.ts" />
"use strict";
var DynamoDBManager_1 = require('./DB/DynamoDBManager');
var Validator_1 = require('./Validation/Validator');
var AddressValidation_1 = require('./Validation/AddressValidation');
var Helpers_1 = require('./Helpers/Helpers');
var HttpCodes_1 = require('./Helpers/HttpCodes');
var Fields_1 = require('./DB/Fields');
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
            var hasError_1 = false;
            Fields_1.getRules(tableName).forEach(function (r) {
                // TODO: check user's address and put the barcode
                if (!hasError_1 && !Validator_1.validate(event.payload, r)) {
                    callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, r + ' is not valid'));
                    hasError_1 = true;
                }
            });
            if (!hasError_1) {
                if (tableName === 'addresses') {
                    checkAddress(event.payload, callback, function (addr) { return db.create(tableName, addr, function (err, res) { return genericCallback(err, res, callback); }); });
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
                checkAddress(event.payload, callback, function (addr) {
                    db.read('addresses', { key: { delivery_point_barcode: addr.delivery_point_barcode } }, function (err, res) {
                        if (res && res.Item) {
                        }
                        else {
                            db.create(tableName, addr, function (err, res) { return genericCallback(err, res, callback); });
                        }
                    });
                });
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
                    db.read('addresses', { "key": { delivery_point_barcode: barcode } }, callback);
                }
            });
            break;
        default:
            callback(Helpers_1.genLambdaError(HttpCodes_1.HttpCodes.BadRequest, "Bad Request Path"));
            break;
    }
}
exports.handler = handler;
