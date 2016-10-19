/// <reference path="../../typings/index.d.ts" />
/// <reference path="./services.ts" />
var IndexCtrl = (function () {
    function IndexCtrl(_scope, _httpSvc) {
        this._scope = _scope;
        this._httpSvc = _httpSvc;
        _httpSvc.init('http://localhost:5000');
        _httpSvc.get('/time', {
            onSuccess: function (c, d) {
                _scope.time = d;
            },
            onError: function (c, d) {
                _scope.time = new Date().toTimeString();
                console.log('Error: ' + d);
            }
        });
    }
    IndexCtrl.$inject = ['$scope', 'HttpService'];
    return IndexCtrl;
}());
angular.module('app')
    .controller('IndexCtrl', IndexCtrl);
