/// <reference path="../../typings/index.d.ts" />
"use strict";
var sdk = require('aws-sdk');
var Fields_1 = require('../DB/Fields');
var DynamoDBManager = (function () {
    function DynamoDBManager() {
        this._db = new sdk.DynamoDB.DocumentClient();
    }
    DynamoDBManager.prototype.create = function (tableName, payload, callback) {
        var _this = this;
        var k = Fields_1.getFields(tableName)[0];
        var readKey = {};
        readKey[k] = payload[k];
        this._db.get({
            TableName: tableName,
            Key: readKey
        }, function (err, res) {
            if (res && res.Item) {
                var value = payload[k];
                callback(k + ': ' + value + ' already exists.');
            }
            else {
                var item_1 = {};
                var origin_1 = payload.item;
                Fields_1.getFields(tableName).forEach(function (e) {
                    item_1[e] = origin_1[e];
                });
                var params = {
                    TableName: tableName,
                    Item: item_1
                };
                _this._db.put(params, callback);
            }
        });
    };
    DynamoDBManager.prototype.read = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            Key: payload.key
        };
        this._db.get(params, callback);
    };
    DynamoDBManager.prototype.update = function (tableName, payload, callback) {
        var _this = this;
        this._db.get({
            TableName: tableName,
            Key: payload.key
        }, function (err, res) {
            if (!res || !res.Item) {
                var key = Object.keys(payload.key)[0];
                var value = payload.key[key];
                callback(key + ': ' + value + ' does not exist.');
            }
            else {
                var r_1 = res.Item;
                var attributes_1 = {};
                Fields_1.getFields(tableName).forEach(function (e) {
                    if (payload.values[e] && r_1[e] !== payload.values[e]) {
                        attributes_1[e] = {
                            Action: "PUT",
                            Value: payload.values[e]
                        };
                    }
                });
                var params = {
                    TableName: tableName,
                    Key: payload.key,
                    AttributeUpdates: attributes_1
                };
                _this._db.update(params, callback);
            }
        });
    };
    DynamoDBManager.prototype.delete = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            Key: payload.key
        };
        this._db.delete(params, callback);
    };
    DynamoDBManager.prototype.find = function (tableName, payload, callback) {
        var params = {
            TableName: tableName,
            FilterExpression: payload.expression,
            ExpressionAttributeValues: payload.values
        };
        this._db.scan(params, callback);
    };
    return DynamoDBManager;
}());
exports.DynamoDBManager = DynamoDBManager;
