"use strict";
var customersFields = ['email', 'firstname', 'lastname', 'phonenumber', 'address_ref'];
var addressesFields = ['delivery_point_barcode', 'city', 'street', 'num', 'zipcode'];
var customersChecks = ['email'];
var addressesChecks = ['zipcode'];
function getFields(tableName) {
    return eval(tableName + 'Fields');
}
exports.getFields = getFields;
function getFieldsToCheck(tableName) {
    return eval(tableName + 'Checks');
}
exports.getFieldsToCheck = getFieldsToCheck;
