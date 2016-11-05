/// <reference path="../../typings/index.d.ts" />

import { tryFind } from '../Helpers/Helpers';
import { HttpCodes } from '../Helpers/HttpCodes';

var Validator = {
    'email': (email: string): boolean => {
        // TODO: add comment about this regex
        let regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return regex.test(email);
    },

    'zipcode': (zipcode: string): boolean => {
        // TODO: add comment about this regex
        let regex = /^\d{5}$/;
        return regex.test(zipcode);
    }
};

export function validate(payload: any, fieldName: string): boolean {
    let data = tryFind(payload, fieldName, undefined);
    return data && Validator[fieldName](data);
}