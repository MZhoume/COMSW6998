/// <reference path="../../typings/index.d.ts" />

import { DynamoDB } from 'aws-sdk';

// function composePromise(method: (params: any, callback: (err, res) => void) => void, params: any): Promise<any> {
//     return new Promise<any>((resolve, reject) =>
//         method(params, (err, res) => {
//             if (err) reject(err);
//             else resolve(res);
//         })
//     );
// }

// TODO: REFACTOR!!!
function promiseCallback(err: any, res: any, resolve: (data: any) => void, reject: (data: any) => void) {
    if (err) reject(err);
    else resolve(res);
}

export class DynamoDBAsync {
    _db: DynamoDB.DocumentClient;

    constructor() {
        this._db = new DynamoDB.DocumentClient();
    }

    create(params: any): Promise<any> {
        return new Promise<any>((res, rej) => {
            this._db.put(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }

    get(params: any): Promise<any> {
        return new Promise<any>((res, rej) => {
            this._db.get(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }

    update(params: any): Promise<any> {
        return new Promise<any>((res, rej) => {
            this._db.update(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }

    delete(params: any): Promise<any> {
        return new Promise<any>((res, rej) => {
            this._db.delete(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }

    find(params: any): Promise<any> {
        return new Promise<any>((res, rej) => {
            this._db.scan(params, (err, dat) => promiseCallback(err, dat, res, rej));
        });
    }
}