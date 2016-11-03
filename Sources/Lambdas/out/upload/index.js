/// <reference path="../typings/index.d.ts" />
"use strict";
var sdk = require('aws-sdk');
var DBManager_1 = require('./DB/DBManager');
var Validator_1 = require('./Validation/Validator');
function handler(event, context, callback) {
    var dynamo = new sdk.DynamoDB.DocumentClient();
    var db = new DBManager_1.DBManager(dynamo);
    var tableName = event.tableName;
    if (!Validator_1.validate(event.payload, 'email', callback)
        || !Validator_1.validate(event.payload, 'zipcode', callback)) {
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
            break;
    }
}
exports.handler = handler;
