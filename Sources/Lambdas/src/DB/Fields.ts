var customerFields = ['email', 'firstname', 'lastname', 'phonenumber', 'address_ref'];
var addressFields = ['delivery_point_barcode', 'city', 'street', 'num', 'zipcode'];

export function getKeys(tableName: string): string[] {
    return eval(tableName + 'Fields');
}