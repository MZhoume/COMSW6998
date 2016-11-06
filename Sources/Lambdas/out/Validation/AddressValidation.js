/// <reference path="../../typings/index.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import * as request from 'request-promise';
import { tryFind } from '../Helpers/Helpers';
import * as statics from '../Statics';
export function requestValidAddr(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        let city = tryFind(payload, 'city', undefined);
        let street = tryFind(payload, 'street', undefined);
        let num = tryFind(payload, 'num', undefined);
        let zipcode = tryFind(payload, 'zipcode', undefined);
        let url = statics.SmartyStreetUrl + statics.SS_StreetPrefix + encodeURIComponent(street + ' ' + num)
            + statics.SS_CityPrefix + encodeURIComponent(city)
            + statics.SS_ZipCodePrefix + encodeURIComponent(zipcode);
        let r = yield request.get(url);
        let suggestions = JSON.parse(r);
        if (suggestions.length == 0)
            throw "Invalid Address";
        else {
            let sug = suggestions[0];
            return {
                delivery_point_barcode: sug.delivery_point_barcode,
                city: (sug.components.city_name || ''),
                street: (sug.components.primary_number || '') + ' ' + (sug.components.street_predirection || '') + ' ' + (sug.components.street_name || '') + ' ' + (sug.components.street_postdirection || '') + ' ' + (sug.components.street_suffix || ''),
                num: (sug.components.secondary_designator || '') + ' ' + (sug.components.secondary_number || ''),
                zipcode: (sug.components.zipcode || '')
            };
        }
    });
}
