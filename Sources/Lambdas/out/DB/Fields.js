"use strict";
exports.ContentInstances = {
    Episode: 'episode',
    Property: 'property',
    Franchise: 'franchise',
    Series: 'series'
};
const customersFields = ['email', 'password', 'firstname', 'lastname', 'phonenumber', 'delivery_point_barcode'];
const addressesFields = ['delivery_point_barcode', 'city', 'street', 'num', 'zipcode'];
// contentInstance is the type from ContentInstances
const commentFields = ['UUID', 'comment', 'contentInstance', 'contentInstanceID', 'userID'];
const propertyFields = ['UUID', 'name'];
const franchiseFields = ['UUID', 'name', 'propertyID'];
const seriesFields = ['UUID', 'name', 'franchiseID'];
const episodeFields = ['UUID', 'name', 'seriesID'];
const customersChecks = ['email'];
const addressesChecks = ['zipcode'];
const franchiseTracebacks = ['property'];
const seriesTracebacks = ['property', 'franchise'];
const episodeTracebacks = ['property', 'franchise', 'series'];
function getFields(tableName) {
    try {
        return eval(`${tableName}Fields`);
    }
    catch (ex) {
        return [];
    }
}
exports.getFields = getFields;
function getFieldsToCheck(tableName) {
    try {
        return eval(`${tableName}Checks`);
    }
    catch (ex) {
        return [];
    }
}
exports.getFieldsToCheck = getFieldsToCheck;
function getTracebacks(tableName) {
    try {
        return eval(`${tableName}Tracebacks`);
    }
    catch (ex) {
        return [];
    }
}
exports.getTracebacks = getTracebacks;
