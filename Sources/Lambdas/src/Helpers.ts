export function tryFind(payload: any, key: string, def: any): any {
    if (payload.item && payload.item[key]) {
        return payload.item[key];
    } else if (payload.values && payload.values[key]) {
        return payload.values[key];
    }
    return def;
}

export function genLambdaError(code: string, message: string) {
    return JSON.stringify({ code: code, message: message });
}