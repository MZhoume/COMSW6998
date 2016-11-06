/// <reference path="../../typings/index.d.ts" />

import { DynamoDB } from 'aws-sdk';

export class DynamoDBAsync {
    _db: DynamoDB.DocumentClient;

    constructor() {
        this._db = new DynamoDB.DocumentClient();
    }

    private composePromise(method: (params: any, callback: (err, res) => void) => void, params: any): Promise<any> {
        return new Promise<any>((resolve, reject) =>
            method(params, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            }));
    }

    create(params: any): Promise<any> {
        return this.composePromise(this._db.put, params);
    }

    get(params: any): Promise<any> {
        return this.composePromise(this._db.get, params);
    }

    update(params: any): Promise<any> {
        return this.composePromise(this._db.update, params);
    }

    delete(params: any): Promise<any> {
        return this.composePromise(this._db.delete, params);
    }

    find(params: any): Promise<any> {
        return this.composePromise(this._db.scan, params);
    }
}