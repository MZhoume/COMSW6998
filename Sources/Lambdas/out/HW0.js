"use strict";
/// <reference path="../typings/index.d.ts" />
var sdk = require('aws-sdk');
var customerKeys = ['email', 'firstname', 'lastname', 'phonenumber', 'address_ref'];
var addressKeys = ['uuid', 'city', 'street', 'num', 'zipcode'];
var DBManager = (function () {
    function DBManager(_db) {
        this._db = _db;
    }
    DBManager.prototype.create = function (tableName, item, callback) {
        var params = {
            TableName: tableName,
            Item: item
        };
        this._db.put(params, callback);
    };
    DBManager.prototype.read = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            Key: payload.key
        };
        this._db.get(params, callback);
    };
    DBManager.prototype.update = function (tableName, payload, callback) {
        var _this = this;
        var qparams = {
            TableName: tableName,
            Key: payload.key
        };
        this._db.get(qparams, function (err, res) {
            if (!res) {
                callback(new Error("Email: " + payload.key.email + " does not exists."));
                return;
            }
            var keys;
            if (tableName === 'customers') {
                keys = customerKeys;
            }
            else if (tableName === 'addresses') {
                keys = addressKeys;
            }
            var r = res.Item;
            var attributes = {};
            keys.forEach(function (e) {
                if (payload.values[e] && r[e] !== payload.values[e]) {
                    attributes[e] = {
                        Action: "PUT",
                        Value: payload.values[e]
                    };
                }
            });
            var params = {
                TableName: tableName,
                Key: payload.key,
                AttributeUpdates: attributes
            };
            _this._db.update(params, callback);
        });
    };
    DBManager.prototype.delete = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            Key: payload.key
        };
        this._db.delete(params, callback);
    };
    DBManager.prototype.find = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            FilterExpression: payload.expression,
            ExpressionAttributeValues: payload.values
        };
        this._db.scan(params, callback);
    };
    return DBManager;
}());
var Validator = {
    'email': function (email) {
        var regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return regex.test(email);
    },
    'zipcode': function (zipcode) {
        var regex = /^\d{5}$/;
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
    if (tableName === 'customers') {
        if (event.operation === 'create') {
            if (!validate(event.payload.item.email, 'email', callback)) {
                return;
            }
        }
    }
    else if (tableName === 'addresses') {
        if (event.operation === 'create') {
            if (!validate(event.payload.item.zipcode, 'zipcode', callback)) {
                return;
            }
        }
    }
    switch (event.operation) {
        case 'create':
            var item_1 = {};
            var keys = void 0;
            var payload_1 = event.payload.item;
            if (tableName === 'customers') {
                keys = customerKeys;
            }
            else if (tableName === 'addresses') {
                keys = addressKeys;
            }
            keys.forEach(function (e) {
                item_1[e] = payload_1[e];
            });
            db.create(tableName, item_1, callback);
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
                    var id = res.Item.address_ref;
                    db.read('addresses', {
                        "key": {
                            "uuid": id
                        }
                    }, callback);
                }
            });
            break;
    }
}
exports.handler = handler;
