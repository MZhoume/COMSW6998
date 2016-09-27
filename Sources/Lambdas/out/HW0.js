"use strict";
/// <reference path="../typings/index.d.ts" />
var sdk = require('aws-sdk');
var DBManager = (function () {
    function DBManager(_db) {
        this._db = _db;
    }
    DBManager.prototype.create = function (event, callback) {
        var params = {
            TableName: event.tableName,
            Item: event.item
        };
        console.log(params);
        this._db.put(params, callback);
    };
    DBManager.prototype.get = function (event, callback) {
        var params = {
            TableName: event.tableName,
            Key: event.key
        };
        console.log(params);
        this._db.get(params, callback);
    };
    DBManager.prototype.update = function (event, callback) {
        var params = {
            TableName: event.tableName,
            Key: event.key,
            UpdateExpression: event.expression,
            ExpressionAttributeValues: event.values
        };
        console.log(params);
        this._db.update(params, callback);
    };
    DBManager.prototype.delete = function (event, callback) {
        var params = {
            TableName: event.tableName,
            Key: event.key
        };
        console.log(params);
        this._db.delete(params, callback);
    };
    DBManager.prototype.find = function (event, callback) {
        var params = {
            TableName: event.tableName,
            FilterExpression: event.expression,
            ExpressionAttributeValues: event.values
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
function generalCallback(err, data) {
    console.log('err: ', err);
    console.log('data: ', data);
}
function validate(data, validatorName, callback) {
    if (data && Validator[validatorName](data)) {
        return true;
    }
    callback(new Error('Field: ' + data + ' is not validated with ' + validatorName));
    return false;
}
function handler(event, context, callback) {
    console.log('event: ', JSON.stringify(event));
    console.log('context: ', JSON.stringify(context));
    var dynamo = new sdk.DynamoDB.DocumentClient();
    var db = new DBManager(dynamo);
    var tableName = event.tableName;
    if (tableName === 'customers') {
        if (event.operation === 'create') {
            validate(event.item.email, 'email', callback);
            validate(event.item.zipcode, 'zipcode', callback);
        }
    }
    switch (event.operation) {
        case 'create':
            db.create(event, generalCallback);
            break;
        case 'read':
            db.get(event, generalCallback);
            break;
        case 'update':
            db.update(event, generalCallback);
            break;
        case 'delete':
            db.delete(event, generalCallback);
            break;
        case 'find':
            db.find(event, generalCallback);
            break;
    }
}
exports.handler = handler;
