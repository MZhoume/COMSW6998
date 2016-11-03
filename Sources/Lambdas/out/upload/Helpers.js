"use strict";
function tryFind(payload, key) {
    if (payload.item && payload.item[key]) {
        return payload.item[key];
    }
    else if (payload.values && payload.values[key]) {
        return payload.values[key];
    }
    return undefined;
}
exports.tryFind = tryFind;
