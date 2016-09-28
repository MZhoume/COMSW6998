"use strict";
/// <reference path="../typings/index.d.ts" />
var sdk = require('aws-sdk');
var DBManager = (function () {
    function DBManager(_db) {
        this._db = _db;
    }
    DBManager.prototype.create = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            Item: payload.item
        };
        console.log(params);
        this._db.put(params, callback);
    };
    DBManager.prototype.read = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            Key: payload.key
        };
        console.log(params);
        this._db.get(params, callback);
    };
    DBManager.prototype.update = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            Key: payload.key,
            UpdateExpression: payload.expression,
            ExpressionAttributeValues: payload.values
        };
        console.log(params);
        this._db.update(params, callback);
    };
    DBManager.prototype.delete = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            Key: payload.key
        };
        console.log(params);
        this._db.delete(params, callback);
    };
    DBManager.prototype.find = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            FilterExpression: payload.expression,
            ExpressionAttributeValues: payload.values
        };
        console.log(params);
        this._db.scan(params, callback);
    };
    return DBManager;
}());
var Validator = {
    'email': function (email) {
        var regex = new RegExp('/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i');
        return regex.test(email);
    },
    'zipcode': function (zipcode) {
        var regex = new RegExp('/\d{5}/i');
        return regex.test(zipcode);
    }
};
function validate(data, validatorName, callback) {
    if (data && Validator[validatorName](data)) {
        return true;
    }
    callback(new Error('Value: ' + data + ' is not validated as ' + validatorName));
    return false;
}
function handler(event, context, callback) {
    var dynamo = new sdk.DynamoDB.DocumentClient();
    var db = new DBManager(dynamo);
    var tableName = event.tableName;
    // if (tableName === 'customers') {
    //     if (event.operation === 'create') {
    //         if (!(validate(event.payload.item.email, 'email', callback)   
    //             && validate(event.payload.item.zipcode, 'zipcode', callback))) {
    //                 return;
    //         }
    //     }
    // }
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
                    var id = res.Item.address;
                    db.read('addresses', {
                        "key": {
                            "UUID": id
                        }
                    }, callback);
                }
            });
            break;
    }
}
exports.handler = handler;
