export function tryFind(payload: any, key: string): any {
    if (payload.item && payload.item[key]) {
        return payload.item[key];
    } else if (payload.values && payload.values[key]) {
        return payload.values[key];
    }
    return undefined;
}