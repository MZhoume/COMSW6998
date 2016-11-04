/// <reference path="../../typings/index.d.ts" />
"use strict";
var sdk = require('aws-sdk');
var Fields_1 = require('../DB/Fields');
var DynamoDBManager = (function () {
    function DynamoDBManager() {
        this._db = new sdk.DynamoDB.DocumentClient();
    }
    DynamoDBManager.prototype.create = function (tableName, payload, callback) {
        var item = {};
        var origin = payload.item;
        Fields_1.getKeys(tableName).forEach(function (e) {
            item[e] = origin[e];
        });
        var params = {
            TableName: tableName,
            Item: item
        };
        this._db.put(params, callback);
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
            if (!res) {
                console.log("Email: " + payload.key.email + " does not exists.");
                return;
            }
            var r = res.Item;
            var attributes = {};
            Fields_1.getKeys(tableName).forEach(function (e) {
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
