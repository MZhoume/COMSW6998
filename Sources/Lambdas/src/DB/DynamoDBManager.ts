/// <reference path="../../typings/index.d.ts" />

import { DynamoDBAsync } from './DynamoDBAsync';
import { getFields } from '../DB/Fields';
import { IDBManager } from '../Interface/IDBManager';
import { tryFind } from '../Helpers/Helpers';

export class DynamoDBManager implements IDBManager {
    _db: DynamoDBAsync
    constructor() {
        this._db = new DynamoDBAsync();
    }

    async create(tableName: string, payload: any): Promise<any> {
        let k = getFields(tableName)[0];
        let readKey = {};
        readKey[k] = tryFind(payload, k, undefined);

        let r = await this._db.get({
            TableName: tableName,
            Key: readKey
        });

        if (r && r.Item) throw `${readKey[k] || 'Item'} already exists.`;
        else {
            let item = {};
            for (let e of getFields(tableName))
                item[e] = tryFind(payload, e, undefined);

            return this._db.create({
                TableName: tableName,
                Item: item
            });
        }
    }

    read(tableName: string, payload: any): Promise<any> {
        return this._db.get({
            TableName: tableName,
            Key: tryFind(payload, 'key', {})
        });
    }

    async update(tableName: string, payload: any): Promise<any> {
        let params = {
            TableName: tableName,
            Key: tryFind(payload, 'key', {})
        };

        let r = await this._db.get(params);

        if (!r || !r.Item) {
            throw `${params.Key[0] || 'Item'} does not exist.`;
        } else {
            r = r.Item;
            let attributes = {};
            for (let e of getFields(tableName)) {
                let v = tryFind(payload, e, false);
                if (v && r[e] !== v) {
                    attributes[e] = {
                        Action: "PUT",
                        Value: v
                    };
                }
            }

            return this._db.update({
                TableName: tableName,
                Key: tryFind(payload, 'key', {}),
                AttributeUpdates: attributes
            });
        }
    }

    delete(tableName: string, payload: any): Promise<any> {
        return this._db.delete({
            TableName: tableName,
            Key: tryFind(payload, 'key', {})
        });
    }

    find(tableName: string, payload: any): Promise<any> {
        return this._db.find({
            TableName: tableName,
            FilterExpression: tryFind(payload, 'expression', undefined),
            ExpressionAttributeValues: tryFind(payload, 'values', undefined)
        });
    }
}