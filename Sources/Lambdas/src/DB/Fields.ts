var customersFields = ['email', 'firstname', 'lastname', 'phonenumber', 'address_ref'];
var addressesFields = ['delivery_point_barcode', 'city', 'street', 'num', 'zipcode'];

var customersChecks = ['email'];
var addressesChecks = ['zipcode'];

export var customersTableName = 'customers';
export var addressesTableName = 'addresses';

export function getFields(tableName: string): string[] {
    return eval(`${tableName}Fields`);
}

export function getFieldsToCheck(tableName: string): string[] {
    return eval(`${tableName}Checks`);
}