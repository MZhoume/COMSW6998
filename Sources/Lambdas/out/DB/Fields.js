var customersFields = ['email', 'firstname', 'lastname', 'phonenumber', 'address_ref'];
var addressesFields = ['delivery_point_barcode', 'city', 'street', 'num', 'zipcode'];
var customersChecks = ['email'];
var addressesChecks = ['zipcode'];
export function getFields(tableName) {
    return eval(tableName + 'Fields');
}
export function getFieldsToCheck(tableName) {
    return eval(tableName + 'Checks');
}
