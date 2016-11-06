export interface IDBManager {
    create(tableName: string, payload): Promise<any>;
    read(tableName: string, payload): Promise<any>;
    update(tableName: string, payload): Promise<any>;
    delete(tableName: string, payload): Promise<any>;
    find(tableName: string, payload): Promise<any>;
}