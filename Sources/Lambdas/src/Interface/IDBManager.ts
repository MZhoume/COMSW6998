/// <reference path="../../typings/index.d.ts" />

import * as lambda from 'aws-lambda'

export interface IDBManager {
    create(tableName: string, payload, callback: lambda.Callback);
    read(tableName: string, payload, callback: lambda.Callback);
    update(tableName: string, payload, callback: lambda.Callback);
    delete(tableName: string, payload, callback: lambda.Callback);
    find(tableName: string, payload, callback: lambda.Callback);
}