(function () {
    'use strict';

    angular
        .module('app')
        .controller('loginCtrl', loginCtrl);

    angular
        .module('app')
        .directive('autoFillSync', function($timeout) {
            return {
                require: 'ngModel',
                link: function(scope, elem, attrs, ngModel) {
                    var origVal = elem.val();
                    $timeout(function () {
                        var newVal = elem.val();
                        if(ngModel.$pristine && origVal !== newVal) {
                            ngModel.$setViewValue(newVal);
                        }
                    }, 500);
                }
            }
        });

    angular
        .module('app')
        .factory('loginService', function($http) {
            return {
                authenticate: function(method, data) {
                    return $http.post(base_url+'portal_auth/auth/authenticate/'+method,
                                      data).then(function(response) {
                                          console.log('got response: ' + response);
                                          return response.data
                                      });
                }
            }
        });

    function loginCtrl($scope, $routeParams, loginService, $location) {
        $scope.tab = $routeParams.method ?
            $routeParams.method : $('#default_authenticator').val();
        $scope.redirect = $location.search().redirect ?
            $location.search().redirect : '';
        $scope.error = $location.search().error ?
            $location.search().error : '';
        $scope.message = $location.search().message ?
            $location.search().message : false;
        $scope['username']='';
        $scope['password']='';

        $scope.authenticate = function(method) {
            var data = {
                'username':$scope['username'],
                'password':$scope['password']
            }
            $('article form button').button('loading');
            loginService.authenticate(method, data).then(function(data) {
                if(data.status=='ERROR') {
                    $scope.message = data.message;
                    $('article form button').button('reset');
                } else if(data.status=='SUCCESS') {
                    if(!$scope.redirect) {
                        document.location.href = data.message.redirect_to;
                    } else {
                        document.location.href = $scope.redirect;
                    }
                }
            });
            console.log('Fell through authenticate');
        }
    }

})();
