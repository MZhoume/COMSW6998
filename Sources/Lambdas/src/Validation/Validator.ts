/// <reference path="../../typings/index.d.ts" />

import * as lambda from 'aws-lambda'
import { tryFind } from '../Helpers'

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

export function validate(payload: any, fieldName: string, callback: lambda.Callback): boolean {
    let data = tryFind(payload, fieldName);
    if (data && Validator[fieldName](data)) {
        return true;
    }
    console.log(data + ' does not validated as ' + fieldName);
    return false;
}