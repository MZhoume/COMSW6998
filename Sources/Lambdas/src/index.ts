import * as AWS from 'aws-sdk';
import * as lambda from 'aws-lambda';
import * as request from 'request-promise';
import * as sha1 from 'sha1';
import { IDBManager } from './Interfaces/IDBManager';
import { DynamoDBManager } from './DB/DynamoDBManager';
import { validate } from './Validation/Validator';
import { requestValidAddr } from './Validation/AddressValidation';
import { genLambdaError, tryFind } from './Helpers/Helpers';
import { HttpCodes } from './Interfaces/HttpCodes';
import { ISmartyStreetResponse } from './Interfaces/ISmartyStreetResponse';
import { getFields, getFieldsToCheck, getTraceback } from './DB/Fields';
import { queryCypher } from './Helpers/Neo4j';
import { snsFunctionName } from './Statics';

async function invoke(event: any): Promise<string> {
    let tableName = event.tableName;
    let operation = event.operation;
    let dbManager: IDBManager = new DynamoDBManager();
    let sns = new AWS.SNS();

    sns.publish({
        Message: `${operation} on table ${tableName} -- Team Typer`,
        TopicArn: 'arn:aws:sns:us-east-1:722850008576:comsTopic'
    });

    switch (operation) {
        case 'create':
            for (let r of getFieldsToCheck(tableName)) {
                if (!validate(event.payload, r)) {
                    throw `${r} is not valid`;
                }
            }

            switch (tableName) {
                case 'addresses':
                    return dbManager.create(tableName, await requestValidAddr(event.payload));
                case 'customers':
                    await queryCypher('CREATE (n:user { name: {name}, email: {email} })',
                        {
                            name: tryFind(event.payload, 'firstname', undefined) + ' ' + tryFind(event.payload, 'lastname', undefined),
                            email: tryFind(event.payload, 'email', undefined)
                        });
                    return dbManager.create(tableName, event.payload);
                case 'comment':
                    let comment = tryFind(event.payload, 'comment', undefined);
                    if (comment === undefined) {
                        throw 'Comment does not exist in request.';
                    }

                    event.payload['UUID'] = sha1(comment);

                    if (event.payload['contentInstance'] === 'episode') {
                        await queryCypher('CREATE (c:comment { id: {id}, comment: {comment} })',
                            {
                                id: event.payload['UUID'],
                                comment: comment
                            });

                        await queryCypher('MATCH (a:user),( b:comment) WHERE a.email = {email} AND b.id = {uuid} CREATE (a)-[r:COMMENTED]->(b)',
                            {
                                email: event.payload['userID'],
                                uuid: event.payload['UUID']
                            });

                        await queryCypher('MATCH (a:comment),( b:content) WHERE a.id = {cuuid} AND b.id = {iuuid} CREATE (a)-[r:commentedUpon]->(b)',
                            {
                                cuuid: event.payload['UUID'],
                                iuuid: event.payload['contentInstanceID']
                            });
                    }

                    return dbManager.create(tableName, event.payload);
                default:
                    if (tableName !== 'property') {
                        let tb = getTraceback(tableName);
                        let v = tryFind(event.payload, tb, undefined);
                        if (v === undefined) {
                            throw `${tb} does not exist in request.`;
                        }

                        event.payload[`${tb}ID`] = sha1(v);
                    }

                    let name = tryFind(event.payload, 'name', undefined);
                    if (name === undefined) {
                        throw 'Name does not exist in request.';
                    }

                    event.payload['UUID'] = sha1(name);
                    if (tableName === 'episode') {
                        await queryCypher('CREATE (e:content { id: {id}, name: {name} })',
                            {
                                id: event.payload['UUID'],
                                comment: name
                            });
                    }
                    return dbManager.create(tableName, event.payload);
            }

        case 'get':
            return dbManager.get(tableName, event.payload);

        case 'update':
            if (tableName === 'addresses') {
                throw 'Cannot update addresses.';
            } else {
                return dbManager.update(tableName, event.payload);
            }

        case 'delete':
            return dbManager.delete(tableName, event.payload);

        case 'find':
            return dbManager.find(tableName, event.payload);

        case 'echo':
            return event.payload;

        default:
            throw 'Bad Request Path';
    }
}

export async function handler(event: any, context: lambda.Context, callback: lambda.Callback): Promise<void> {
    try {
        callback(null, await invoke(event));
    } catch (ex) {
        callback(genLambdaError(HttpCodes.BadRequest, ex));
    }
}
