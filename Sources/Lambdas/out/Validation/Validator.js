/// <reference path="../../typings/index.d.ts" />
"use strict";
const Helpers_1 = require('../Helpers/Helpers');
var Validator = {
    email: (email) => {
        // TODO: add comment about this regex
        let regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return regex.test(email);
    },
    zipcode: (zipcode) => {
        // TODO: add comment about this regex
        let regex = /^\d{5}$/;
        return regex.test(zipcode);
    }
};
function validate(payload, fieldName) {
    let data = Helpers_1.tryFind(payload, fieldName, undefined);
    return data && Validator[fieldName](data);
}
exports.validate = validate;
