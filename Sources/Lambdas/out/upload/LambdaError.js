"use strict";
var LambdaError = (function () {
    function LambdaError(code, message) {
        this.code = code;
        this.message = message;
    }
    return LambdaError;
}());
exports.LambdaError = LambdaError;
