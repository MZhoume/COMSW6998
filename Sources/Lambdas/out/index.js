"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const AWS = require("aws-sdk");
const sha1 = require("sha1");
const DynamoDBManager_1 = require("./DB/DynamoDBManager");
const Validator_1 = require("./Validation/Validator");
const AddressValidation_1 = require("./Validation/AddressValidation");
const Helpers_1 = require("./Helpers/Helpers");
const Fields_1 = require("./DB/Fields");
const Neo4j_1 = require("./Helpers/Neo4j");
function invoke(event) {
    return __awaiter(this, void 0, void 0, function* () {
        let tableName = event.tableName;
        let operation = event.operation;
        let dbManager = new DynamoDBManager_1.DynamoDBManager();
        let sns = new AWS.SNS();
        sns.publish({
            Message: `${operation} on table ${tableName} -- Team Typer`,
            TopicArn: 'arn:aws:sns:us-east-1:722850008576:comsTopic'
        });
        switch (operation) {
            case 'create':
                for (let r of Fields_1.getFieldsToCheck(tableName)) {
                    if (!Validator_1.validate(event.payload, r)) {
                        throw `${r} is not valid`;
                    }
                }
                switch (tableName) {
                    case 'addresses':
                        return dbManager.create(tableName, yield AddressValidation_1.requestValidAddr(event.payload));
                    case 'customers':
                        yield Neo4j_1.queryCypher('CREATE (n:user { name: {name}, email: {email} })', {
                            name: Helpers_1.tryFind(event.payload, 'firstname', undefined) + ' ' + Helpers_1.tryFind(event.payload, 'lastname', undefined),
                            email: Helpers_1.tryFind(event.payload, 'email', undefined)
                        });
                        return dbManager.create(tableName, event.payload);
                    case 'comment':
                        let comment = Helpers_1.tryFind(event.payload, 'comment', undefined);
                        if (comment === undefined) {
                            throw 'Comment does not exist in request.';
                        }
                        event.payload['UUID'] = sha1(comment);
                        if (event.payload['contentInstance'] === 'episode') {
                            yield Neo4j_1.queryCypher('CREATE (c:comment { id: {id}, comment: {comment} })', {
                                id: event.payload['UUID'],
                                comment: comment
                            });
                            yield Neo4j_1.queryCypher('MATCH (a:user),( b:comment) WHERE a.email = {email} AND b.id = {uuid} CREATE (a)-[r:COMMENTED]->(b)', {
                                email: event.payload['userID'],
                                uuid: event.payload['UUID']
                            });
                            yield Neo4j_1.queryCypher('MATCH (a:comment),( b:content) WHERE a.id = {cuuid} AND b.id = {iuuid} CREATE (a)-[r:commentedUpon]->(b)', {
                                cuuid: event.payload['UUID'],
                                iuuid: event.payload['contentInstanceID']
                            });
                        }
                        return dbManager.create(tableName, event.payload);
                    default:
                        if (tableName !== 'property') {
                            let tb = Fields_1.getTraceback(tableName);
                            let v = Helpers_1.tryFind(event.payload, tb, undefined);
                            if (v === undefined) {
                                throw `${tb} does not exist in request.`;
                            }
                            event.payload[`${tb}ID`] = sha1(v);
                        }
                        let name = Helpers_1.tryFind(event.payload, 'name', undefined);
                        if (name === undefined) {
                            throw 'Name does not exist in request.';
                        }
                        event.payload['UUID'] = sha1(name);
                        if (tableName === 'episode') {
                            yield Neo4j_1.queryCypher('CREATE (e:content { id: {id}, name: {name} })', {
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
                }
                else {
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
    });
}
function handler(event, context, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            callback(null, yield invoke(event));
        }
        catch (ex) {
            callback(Helpers_1.genLambdaError(400 /* BadRequest */, ex));
        }
    });
}
exports.handler = handler;
