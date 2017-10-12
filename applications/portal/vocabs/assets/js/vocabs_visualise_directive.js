(function(){
    'use strict';
    angular
        .module('app')
        .directive('visualise', visualiseDirective);

    function visualiseDirective($http) {
        return {
            templateUrl: base_url + 'assets/vocabs/templates/visualise.html',
            scope: {
                versionid: '='
            },
            link: function (scope) {
                scope.treeclass = 'classic-tree';
                $http.get(base_url + 'vocabs/servicesnew/vocabs/' + scope.versionid + '/tree')
                    .then(function (response) {
                        if (response.data.status === 'OK') {
                            scope.tree = response.data.message;
                            if(scope.tree.length>1){$("#concept").hide();}
                        }
                    });
            }
        }
    }
})();
