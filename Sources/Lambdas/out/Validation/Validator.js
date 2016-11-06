/// <reference path="../../typings/index.d.ts" />
"use strict";
var Helpers_1 = require('../Helpers/Helpers');
var Validator = {
    email: function (email) {
        // TODO: add comment about this regex
        var regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return regex.test(email);
    },
    zipcode: function (zipcode) {
        // TODO: add comment about this regex
        var regex = /^\d{5}$/;
        return regex.test(zipcode);
    }
};
function validate(payload, fieldName) {
    var data = Helpers_1.tryFind(payload, fieldName, undefined);
    return data && Validator[fieldName](data);
}
exports.validate = validate;
