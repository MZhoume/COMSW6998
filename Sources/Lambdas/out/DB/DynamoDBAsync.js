/// <reference path="../../typings/index.d.ts" />
"use strict";
const aws_sdk_1 = require('aws-sdk');
// function composePromise(method: (params: any, callback: (err, res) => void) => void, params: any): Promise<any> {
//     return new Promise<any>((resolve, reject) =>
//         method(params, (err, res) => {
//             if (err) reject(err);
//             else resolve(res);
//         })
//     );
// }
// TODO: REFACTOR!!!
function promiseCallback(err, res, resolve, reject) {
    if (err)
        reject(err);
    else
        resolve(res);
}
class DynamoDBAsync {
    constructor() {
        this._db = new aws_sdk_1.DynamoDB.DocumentClient();
    }
    create(params) {
        return new Promise((res, rej) => {
            this._db.put(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }
    get(params) {
        return new Promise((res, rej) => {
            this._db.get(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }
    update(params) {
        return new Promise((res, rej) => {
            this._db.update(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }
    delete(params) {
        return new Promise((res, rej) => {
            this._db.delete(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }
    find(params) {
        return new Promise((res, rej) => {
            this._db.scan(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }
}
exports.DynamoDBAsync = DynamoDBAsync;
