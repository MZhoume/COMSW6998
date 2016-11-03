/// <reference path="../../typings/index.d.ts" />

import * as sdk from 'aws-sdk'
import * as lambda from 'aws-lambda'
import { getKeys } from '../DB/Fields'
import { IDBManager } from '../Interface/IDBManager'

export class DynamoDBManager implements IDBManager {
    _db: sdk.DynamoDB.DocumentClient;

    constructor() {
        this._db = new sdk.DynamoDB.DocumentClient();
     }

    create(tableName: string, payload, callback: lambda.Callback) {
        let item = {};
        let origin = payload.item;
        getKeys(tableName).forEach(e => {
            item[e] = origin[e];
        });

        let params = {
            TableName: tableName,
            Item: item
        };

        this._db.put(params, callback);
    }

    read(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Key: payload.key
        };

        this._db.get(params, callback);
    }

    update(tableName: string, payload, callback: lambda.Callback) {
        this._db.get({
            TableName: tableName,
            Key: payload.key
        }, (err, res) => {
            if (!res) {
                console.log("Email: " + payload.key.email + " does not exists.");
                return;
            }

            let r = res.Item;
            let attributes = {};
            getKeys(tableName).forEach(e => {
                if (payload.values[e] && r[e] !== payload.values[e]) {
                    attributes[e] = {
                        Action: "PUT",
                        Value: payload.values[e]
                    };
                }
            });

            let params = {
                TableName: tableName,
                Key: payload.key,
                AttributeUpdates: attributes
            };

            this._db.update(params, callback);
        });

    }

    delete(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Key: payload.key
        };

        this._db.delete(params, callback);
    }

    find(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            FilterExpression: payload.expression,
            ExpressionAttributeValues: payload.values
        };

        this._db.scan(params, callback);
    }
}