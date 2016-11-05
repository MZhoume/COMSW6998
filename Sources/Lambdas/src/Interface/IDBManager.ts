import { IDBCallback } from './IDBCallback';

export interface IDBManager {
    create(tableName: string, payload, callback: IDBCallback);
    read(tableName: string, payload, callback: IDBCallback);
    update(tableName: string, payload, callback: IDBCallback);
    delete(tableName: string, payload, callback: IDBCallback);
    find(tableName: string, payload, callback: IDBCallback);
}