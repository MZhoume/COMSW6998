export interface IDBManager {
    create(tableName: string, payload: any): Promise<any>;
    read(tableName: string, payload: any): Promise<any>;
    update(tableName: string, payload: any): Promise<any>;
    delete(tableName: string, payload: any): Promise<any>;
    find(tableName: string, payload: any): Promise<any>;
}