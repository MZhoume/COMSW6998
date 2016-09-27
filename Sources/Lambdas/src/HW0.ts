/// <reference path="../typings/index.d.ts" />
import * as sdk from 'aws-sdk'
import * as lambda from 'aws-lambda'

interface IDB {
    put(params, callback);
    get(params, callback);
    update(params, callback);
    delete(params, callback);
    scan(params, callback);
}

class DBManager {
    constructor(
        private _db: IDB
    ) { }

    create(event, callback: lambda.Callback) {
        let params = {
            TableName: event.tableName,
            Item: event.item
        };

        console.log(params);
        this._db.put(params, callback);
    }

    get(event, callback: lambda.Callback) {
        let params = {
            TableName: event.tableName,
            Key: event.key
        };

        console.log(params);
        this._db.get(params, callback);
    }

    update(event, callback: lambda.Callback) {
        let params = {
            TableName: event.tableName,
            Key: event.key,
            UpdateExpression: event.expression,
            ExpressionAttributeValues: event.values
        };

        console.log(params);
        this._db.update(<any>params, callback);
    }

    delete(event, callback: lambda.Callback) {
        let params = {
            TableName: event.tableName,
            Key: event.key
        };

        console.log(params);
        this._db.delete(params, callback);
    }

    find(event, callback: lambda.Callback) {
        let params = {
            TableName: event.tableName,
            FilterExpression: event.expression,
            ExpressionAttributeValues: event.values
        };

        console.log(params);
        this._db.scan(params, callback);
    }
}

var Validator = {
    'email': (email: string): boolean => {
        var regex = new RegExp('/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i');
        return regex.test(email);
    },

    'zipcode': (zipcode: string): boolean => {
        var regex = new RegExp('/\d{5}/i');
        return regex.test(zipcode);
    }
};

function generalCallback(err, data) {
    console.log('err: ', err);
    console.log('data: ', data);
}

function validate(data, validatorName, callback: lambda.Callback): boolean {
    if (data && Validator[validatorName](data)) {
        return true;
    }
    callback(new Error('Field: ' + data + ' is not validated with ' + validatorName));
    return false;
}

export function handler(event, context: lambda.Context, callback: lambda.Callback) {
    console.log('event: ', JSON.stringify(event));
    console.log('context: ', JSON.stringify(context));

    let dynamo = new sdk.DynamoDB.DocumentClient();
    let db = new DBManager(dynamo);
    let tableName = event.tableName;

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

