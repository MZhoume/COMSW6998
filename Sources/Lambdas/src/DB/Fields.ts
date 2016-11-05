var customersFields = ['email', 'firstname', 'lastname', 'phonenumber', 'address_ref'];
var addressesFields = ['delivery_point_barcode', 'city', 'street', 'num', 'zipcode'];

export function getFields(tableName: string): string[] {
    return eval(tableName + 'Fields');
}