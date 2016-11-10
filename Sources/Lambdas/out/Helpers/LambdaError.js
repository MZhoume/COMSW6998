"use strict";
class LambdaError {
    constructor(c, m) {
        this.code = c;
        this.message = m;
    }
    toString() {
        return JSON.stringify({ code: this.code, message: this.message });
    }
    toError() {
        return new Error(this.toString());
    }
}
exports.LambdaError = LambdaError;
