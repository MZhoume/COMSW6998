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

    create(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Item: payload.item
        };

        console.log(params);
        this._db.put(params, callback);
    }

    read(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Key: payload.key
        };

        console.log(params);
        this._db.get(params, callback);
    }

    update(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Key: payload.key,
            UpdateExpression: payload.expression,
            ExpressionAttributeValues: payload.values
        };

        console.log(params);
        this._db.update(<any>params, callback);
    }

    delete(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Key: payload.key
        };

        console.log(params);
        this._db.delete(params, callback);
    }

    find(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            FilterExpression: payload.expression,
            ExpressionAttributeValues: payload.values
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

function validate(data, validatorName, callback: lambda.Callback): boolean {
    if (data && Validator[validatorName](data)) {
        return true;
    }
    callback(new Error('Value: ' + data + ' is not validated as ' + validatorName));
    return false;
}

export function handler(event, context: lambda.Context, callback: lambda.Callback) {
    let dynamo = new sdk.DynamoDB.DocumentClient();
    let db = new DBManager(dynamo);
    let tableName = event.tableName;

    // if (tableName === 'customers') {
    //     if (event.operation === 'create') {
    //         if (!(validate(event.payload.item.email, 'email', callback)   
    //             && validate(event.payload.item.zipcode, 'zipcode', callback))) {
    //                 return;
    //         }
    //     }
    // }

    switch (event.operation) {
        case 'create':
            db.create(tableName, event.payload, callback);
            break;

        case 'read':
            db.read(tableName, event.payload, callback);
            break;

        case 'update':
            db.update(tableName, event.payload, callback);
            break;

        case 'delete':
            db.delete(tableName, event.payload, callback);
            break;

        case 'find':
            db.find(tableName, event.payload, callback);
            break;
        
        case 'getaddr':
            db.read('customers', event.payload, (err, res) => {
                if (res) {
                    let id = res.Item.address;
                    db.read('addresses', {
                        "key": {
                            "UUID": id
                        }
                    }, callback);
                }
            });
        break;
    }
}
