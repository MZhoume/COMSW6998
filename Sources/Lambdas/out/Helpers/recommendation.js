/*
return episodes or friend recommendations from neo4j
*/

"use strict";
/// <reference path="../typings/index.d.ts" />
var sdk = require('aws-sdk');

/*
** recommendation by calling neo4j through RESTful API
*/
function recommendFriend(email, method, callback) {
    var httpRequestError = {
        code: "500",
        message: "Can't connect neo4j"

    };
    var internalServerError = {
        code: "500",
        message: "neo4j can't connect"

    };
    /*calling neo4j */

    //var http = require("http");
    var request = require('request');
    //var querydata = "MATCH (source) - [f:FRIEND] -> (target)\nWHERE source.name =" + sourcenode + "and target.name =" + targetnode + "\nRETURN f IS NOT NULL as isFriend";  
    //Let’s define a function which fires the cypher query.
    var httpUrlForTransaction = "http://contentcatalog:mL1CSF2PKYTtPkGMdRnv@hobby-hhimaappojekgbkebdhlnhol.dbs.graphenedb.com:24789/db/data/transaction/commit";
    function runCypherQuery(query, params, callback) {
        request.post({
            uri: httpUrlForTransaction,
            json: { statements: [{ statement: query, parameters: params }] }
        },
            function (err, res, body) {
                callback(err, body);
            })
    }

    /**
     * Let’s fire some queries as shown below.
     * */
    var query = ""
    if (method === 'episode'){
        query = "MATCH (me:user {email:{email}})-[myrating:RATE]->(myratedepisode:content)\nMATCH (other:user)-[theirrating:RATE]->(myratedepisode)\nWHERE me <> other\nAND abs(myrating.score - theirrating.score) < 2\nWITH other, myratedepisode\nMATCH (other)-[otherrating:RATE]->(episode:content)\nWHERE myratedepisode <> episode\nWITH avg(otherrating.score) AS avgRating, episode\nRETURN episode\nORDER BY avgRating desc\nLIMIT 3"
    } else if (method === 'friend') {
        query = "MATCH  (me:user)-[:FRIEND]-(myFriend:user)-[:FRIEND]-(friendOfFriend:user) \nMATCH (me:user) -[:LIKE] -> (episode:content)\nMATCH (friendOfFriend) - [:LIKE] -> (episode)\nWITH friendOfFriend, count(episode) as nOfCommonLikes, collect(episode) as episodes, me\nWHERE NOT (me)-[:FRIEND]-(friendOfFriend:Person) AND me.email = {email} AND nOfCommonLikes >= 1\nRETURN friendOfFriend as suggestedFriend;"
    }

    runCypherQuery(
       query, {
            email: email,
        }, function (err, resp) {
            if (err) {
                console.log(err);
            } else {
                var episodes = "";
                // console.log("resp.results.data ", resp.results.data);
                // console.log("resp.results.columns ", resp.results.columns);
                // console.log("resp.results", resp.results);
                // console.log("resp ", resp);
                // for (var index in resp.results[0].data){
                //     episodes += resp.results[0].data[index].row[0].name + " | "
                // };
                episodes = resp["results"][0]["data"].map(function(x){return x["row"][0]})
                callback(null, episodes);

            }
        }
    );
}

function handler(event, context, callback) {
    // var dynamo = new sdk.DynamoDB.DocumentClient();
    // var db = new DBManager(dynamo);
    // var tableName = event.tableName;
    var alreadySubmittedError = {
        code: "422",
        message: "already submitted! "
    };
    var missingKeysError = {
        code: "400",
        message: "Missing 'uni' and/or 'testcaseID"
    };
    var missingNode = {
        code: "400",
        message: "Give me the node please"
    };
    var missingPathError = {
        code: "400",
        message: "give me your path please"
    };
    var stepExceedsLimitsError = {
        code: "422",
        message: "Step exceeds limit!"
    };
    var uniNotAuthorized = {
        code: "404",
        message: "your uni is not authorized for this operation or the testcaseID does not exist!"
    };
    var notValidTestcaseError = {
        code : "404",
        message: "this testcaseID does not exist"
    };
    switch (event.operation) {
        case 'getRecommendation':
            
            var email = event.payload.item.email;
            var method = event.payload.item.method;
            console.log ("email: "+email)
            
            recommendFriend(email, method, callback)
            break;

    }
}
exports.handler = handler;
