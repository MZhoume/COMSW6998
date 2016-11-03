export interface IDB {
    put(params, callback);
    get(params, callback);
    update(params, callback);
    delete(params, callback);
    scan(params, callback);
}