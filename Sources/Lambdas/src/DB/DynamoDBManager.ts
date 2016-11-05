/// <reference path="../../typings/index.d.ts" />

import * as sdk from 'aws-sdk';
import { getFields } from '../DB/Fields';
import { IDBManager } from '../Interface/IDBManager';
import { IDBCallback } from '../Interface/IDBCallback';
import { HttpCodes } from '../Helpers/HttpCodes';


export class DynamoDBManager implements IDBManager {
    _db: sdk.DynamoDB.DocumentClient;

    constructor() {
        this._db = new sdk.DynamoDB.DocumentClient();
    }

    create(tableName: string, payload: any, callback: IDBCallback) {
        let k = getFields(tableName)[0];
        let readKey = {};
        readKey[k] = payload[k];

        this._db.get({
            TableName: tableName,
            Key: readKey
        }, (err, res) => {
            if (res && res.Item) {
                let value = payload[k];
                callback(k + ': ' + value + ' already exists.');
            } else {
                let item = {};
                let origin = payload.item;
                getFields(tableName).forEach(e => {
                    item[e] = origin[e];
                });

                let params = {
                    TableName: tableName,
                    Item: item
                };

                this._db.put(params, callback);
            }
        })
    }

    read(tableName: string, payload: any, callback: IDBCallback) {
        let params = {
            TableName: tableName,
            Key: payload.key
        };

        this._db.get(params, callback);
    }

    update(tableName: string, payload: any, callback: IDBCallback) {
        this._db.get({
            TableName: tableName,
            Key: payload.key
        }, (err, res) => {
            if (!res || !res.Item) {
                let key = Object.keys(payload.key)[0];
                let value = payload.key[key];
                callback(key + ': ' + value + ' does not exist.');
            } else {
                let r = res.Item;
                let attributes = {};
                getFields(tableName).forEach(e => {
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
            }
        });

    }

    delete(tableName: string, payload: any, callback: IDBCallback) {
        let params = {
            TableName: tableName,
            Key: payload.key
        };

        this._db.delete(params, callback);
    }

    find(tableName: string, payload: any, callback: IDBCallback) {
        let params = {
            TableName: tableName,
            FilterExpression: payload.expression,
            ExpressionAttributeValues: payload.values
        };

        this._db.scan(params, callback);
    }
}