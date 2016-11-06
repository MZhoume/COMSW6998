/// <reference path="../../typings/index.d.ts" />
import { DynamoDB } from 'aws-sdk';
export class DynamoDBAsync {
    constructor() {
        this._db = new DynamoDB.DocumentClient();
    }
    composePromise(method, params) {
        return new Promise((resolve, reject) => method(params, (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        }));
    }
    create(params) {
        return this.composePromise(this._db.put, params);
    }
    get(params) {
        return this.composePromise(this._db.get, params);
    }
    update(params) {
        return this.composePromise(this._db.update, params);
    }
    delete(params) {
        return this.composePromise(this._db.delete, params);
    }
    find(params) {
        return this.composePromise(this._db.scan, params);
    }
}
