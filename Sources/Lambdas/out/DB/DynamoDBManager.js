/// <reference path="../../typings/index.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import { DynamoDBAsync } from './DynamoDBAsync';
import { getFields } from '../DB/Fields';
import { tryFind } from '../Helpers/Helpers';
export class DynamoDBManager {
    constructor() {
        this._db = new DynamoDBAsync();
    }
    create(tableName, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let k = getFields(tableName)[0];
            let readKey = {};
            readKey[k] = tryFind(payload, k, undefined);
            let r = yield this._db.get({
                TableName: tableName,
                Key: readKey
            });
            if (r && r.Item)
                throw (readKey[k] || 'Item') + ' already exists.';
            else {
                let item = {};
                getFields(tableName).forEach(e => {
                    item[e] = tryFind(payload, e, undefined);
                });
                return this._db.create({
                    TableName: tableName,
                    Item: item
                });
            }
        });
    }
    read(tableName, payload) {
        return this._db.get({
            TableName: tableName,
            Key: tryFind(payload, 'key', {})
        });
    }
    update(tableName, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = {
                TableName: tableName,
                Key: tryFind(payload, 'key', {})
            };
            let r = yield this._db.get(params);
            if (!r || !r.Item) {
                throw params.Key[0] + ' does not exist.';
            }
            else {
                r = r.Item;
                let attributes = {};
                getFields(tableName).forEach(e => {
                    let v = tryFind(payload, e, false);
                    if (v && r[e] !== v) {
                        attributes[e] = {
                            Action: "PUT",
                            Value: v
                        };
                    }
                });
                return this._db.update({
                    TableName: tableName,
                    Key: tryFind(payload, 'key', {}),
                    AttributeUpdates: attributes
                });
            }
        });
    }
    delete(tableName, payload) {
        return this._db.delete({
            TableName: tableName,
            Key: tryFind(payload, 'key', {})
        });
    }
    find(tableName, payload) {
        return this._db.find({
            TableName: tableName,
            FilterExpression: tryFind(payload, 'expression', undefined),
            ExpressionAttributeValues: tryFind(payload, 'values', undefined)
        });
    }
}
