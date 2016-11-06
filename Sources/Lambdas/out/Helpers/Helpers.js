export function tryFind(payload, key, def) {
    if (payload) {
        if (payload[key]) {
            return payload[key];
        }
        else if (payload.item && payload.item[key]) {
            return payload.item[key];
        }
        else if (payload.values && payload.values[key]) {
            return payload.values[key];
        }
    }
    return def;
}
export function genLambdaError(code, message) {
    return new Error(JSON.stringify({ code: code, message: message }));
}
