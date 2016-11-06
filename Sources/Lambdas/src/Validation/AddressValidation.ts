/// <reference path="../../typings/index.d.ts" />

import * as request from 'request';
import { ISmartyStreetResponse } from '../Interface/ISmartyStreetResponse';
import { tryFind } from '../Helpers/Helpers';
import * as statics from '../Statics';

export function validateAddress(payload: any,
    callback: (err?: string, addr?: ISmartyStreetResponse) => void) {
    let city = tryFind(payload, 'city', undefined);
    let street = tryFind(payload, 'street', undefined);
    let num = tryFind(payload, 'num', undefined);
    let zipcode = tryFind(payload, 'zipcode', undefined);

    let url = statics.SmartyStreetUrl + statics.SS_StreetPrefix + encodeURIComponent(street + ' ' + num)
        + statics.SS_CityPrefix + encodeURIComponent(city)
        + statics.SS_ZipCodePrefix + encodeURIComponent(zipcode);

    request.get(url, (err, res, body) => {
        if (res.statusCode === 200) {
            let suggestions = JSON.parse(body);
            if (suggestions.length == 0) {
                callback("Invalid Address");
            } else {
                let sug = suggestions[0];
                console.log('SS response: ' + sug);
                let addr = <ISmartyStreetResponse>{
                    delivery_point_barcode: sug.delivery_point_barcode,
                    city: (sug.components.city_name || ''),
                    street: (sug.components.primary_number || '') + ' ' + (sug.components.street_predirection || '') + ' ' + (sug.components.street_name || '') + ' ' + (sug.components.street_postdirection || '') + ' ' + (sug.components.street_suffix || ''),
                    num: (sug.components.secondary_designator || '') + ' ' + (sug.components.secondary_number || ''),
                    zipcode: (sug.components.zipcode || '')
                };

                callback(null, addr);
            }
        } else {
            callback(body);
        }
    });
}
