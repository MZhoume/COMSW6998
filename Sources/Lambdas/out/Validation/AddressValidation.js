/// <reference path="../../typings/index.d.ts" />
"use strict";
var request = require('request');
var Helpers_1 = require('../Helpers/Helpers');
var statics = require('../Statics');
function validateAddress(payload, callback) {
    var city = Helpers_1.tryFind(payload, 'city', undefined);
    var street = Helpers_1.tryFind(payload, 'street', undefined);
    var num = Helpers_1.tryFind(payload, 'num', undefined);
    var zipcode = Helpers_1.tryFind(payload, 'zipcode', undefined);
    var url = statics.SmartyStreetUrl + statics.SS_StreetPrefix + encodeURIComponent(street + ' ' + num)
        + statics.SS_CityPrefix + encodeURIComponent(city)
        + statics.SS_ZipCodePrefix + encodeURIComponent(zipcode);
    request.get(url, function (err, res, body) {
        if (res.statusCode === 200) {
            var suggestions = JSON.parse(body);
            if (suggestions.length == 0) {
                callback("Invalid Address");
            }
            else {
                var sug = suggestions[0];
                console.log('SS response: ' + sug);
                var addr = {
                    delivery_point_barcode: sug.delivery_point_barcode,
                    city: (sug.components.city_name || ''),
                    street: (sug.components.primary_number || '') + ' ' + (sug.components.street_predirection || '') + ' ' + (sug.components.street_name || '') + ' ' + (sug.components.street_postdirection || '') + ' ' + (sug.components.street_suffix || ''),
                    num: (sug.components.secondary_designator || '') + ' ' + (sug.components.secondary_number || ''),
                    zipcode: (sug.components.zipcode || '')
                };
                callback(null, addr);
            }
        }
        else {
            callback(body);
        }
    });
}
exports.validateAddress = validateAddress;
