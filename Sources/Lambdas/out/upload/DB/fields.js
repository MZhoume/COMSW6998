"use strict";
var customerFields = ['email', 'firstname', 'lastname', 'phonenumber', 'address_ref'];
var addressFields = ['delivery_point_barcode', 'city', 'street', 'num', 'zipcode'];
function getKeys(tableName) {
    return eval(tableName + 'Fields');
}
exports.getKeys = getKeys;
