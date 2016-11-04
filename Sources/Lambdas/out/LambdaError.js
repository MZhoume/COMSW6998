"use strict";
var LambdaError = (function () {
    function LambdaError(c, m) {
        this.code = c;
        this.message = m;
    }
    return LambdaError;
}());
exports.LambdaError = LambdaError;
