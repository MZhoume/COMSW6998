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

var customerKeys = ['email', 'firstname', 'lastname', 'phonenumber', 'address_ref'];
var addressKeys = ['uuid', 'city', 'street', 'num', 'zipcode'];

class DBManager {
    constructor(
        private _db: IDB
    ) { }

    create(tableName: string, item: {}, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Item: item
        };

        this._db.put(params, callback);
    }

    read(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Key: payload.key
        };

        this._db.get(params, callback);
    }

    update(tableName: string, payload, callback: lambda.Callback) {
        let qparams = {
            TableName: tableName,
            Key: payload.key
        };

        this._db.get(qparams, (err, res) => {
            if (!res) {
                callback(new Error("Email: " + payload.key.email + " does not exists."));
                return;
            }

            let keys;
            if (tableName === 'customers') {
                keys = customerKeys;
            } else if (tableName === 'addresses') {
                keys = addressKeys;
            }

            let r = res.Item;
            let attributes = {};
            keys.forEach(e => {
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
        });

    }

    delete(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            Key: payload.key
        };

        this._db.delete(params, callback);
    }

    find(tableName: string, payload, callback: lambda.Callback) {
        let params = {
            TableName: tableName,
            FilterExpression: payload.expression,
            ExpressionAttributeValues: payload.values
        };

        this._db.scan(params, callback);
    }
}

var Validator = {
    'email': (email: string): boolean => {
        let regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return regex.test(email);
    },

    'zipcode': (zipcode: string): boolean => {
        let regex = /^\d{5}$/;
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

    if (tableName === 'customers') {
        if (event.operation === 'create') {
            if (!validate(event.payload.item.email, 'email', callback)) {
                return;
            }
        }
    } else if (tableName === 'addresses') {
        if (event.operation === 'create') {
            if (!validate(event.payload.item.zipcode, 'zipcode', callback)) {
                return;
            }
        }
    }

    switch (event.operation) {
        case 'create':
            let item = {};
            let keys;
            let payload = event.payload.item;
            if (tableName === 'customers') {
                keys = customerKeys;
            } else if (tableName === 'addresses') {
                keys = addressKeys;
            }
            keys.forEach(e => {
                item[e] = payload[e];
            });

            db.create(tableName, item, callback);
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
                    let id = res.Item.address_ref;
                    db.read('addresses', {
                        "key": {
                            "uuid": id
                        }
                    }, callback);
                }
            });
            break;
    }
}
