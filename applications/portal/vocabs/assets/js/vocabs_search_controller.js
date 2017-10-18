(function () {
    'use strict';

    angular
        .module('app')
        .controller('searchCtrl', searchController);

    function searchController($scope, $timeout, $log, $location, vocabs_factory) {

        // Initialise Registry API access.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var defaultClient = VocabularyRegistryApi.ApiClient.instance;
        defaultClient.basePath = registry_api_url;
        var api = new VocabularyRegistryApi.ServicesApi();

        $scope.vocabs = [];
        $scope.filters = {};
        $scope.base_url = base_url;

        // $log.debug($location.search());
        // The form of filters value for this will be <base_url>+/#!/?<filter>=<value>
        // eg. <base_url>+/#!/?q=fish, #!/?q=fish&subjects=Fish
        $scope.filters = $location.search();

        $scope.search = function (isPagination) {
            if (!$scope.filters['q']) $scope.filters['q'] = '';
            if (!isPagination || isPagination == undefined) $scope.filters['p'] = 1;
            if ($scope.searchRedirect()) {
                window.location = base_url + 'search/#!/?q=' + $scope.filters['q'];
            } else {
                $location.path('/').replace();
                window.history.pushState($scope.filters, 'ANDS Research Vocabulary', $location.absUrl());
                api.search({"filtersJson": JSON.stringify($scope.filters)}).
                then(function (data) {
                    $log.debug(data);
                    $scope.result = data;
                    var facets = [];
                    angular.forEach(data.facet_counts.facet_fields, function (item, index) {
                        facets[index] = [];
                        for (var i = 0; i < data.facet_counts.facet_fields[index].length; i += 2) {
                            var fa = {
                                name: data.facet_counts.facet_fields[index][i],
                                value: data.facet_counts.facet_fields[index][i + 1]
                            };
                            facets[index].push(fa);
                        }
                    });
                    $scope.facets = facets;

                    $scope.page = {
                        cur: ($scope.filters['p'] ? parseInt($scope.filters['p']) : 1),
                        rows: ($scope.filters['rows'] ? parseInt($scope.filters['rows']) : 10),
                        range: 3,
                        pages: []
                    }
                    $scope.page.end = Math.ceil($scope.result.response.numFound / $scope.page.rows);
                    for (var x = ($scope.page.cur - $scope.page.range); x < (($scope.page.cur + $scope.page.range)+1);x++ ) {
                        if (x > 0 && x <= $scope.page.end) {
                            $scope.page.pages.push(x);
                        }
                    }
                    // We changed the model outside AngularJS's notice, so we
                    // need to cause a refresh of the form.
                    $scope.$apply();
                });
            }
        };

        $scope.goto = function(x) {
            $scope.filters['p'] = ''+x;
            $scope.search(true);
            $("html, body").animate({ scrollTop: 0 }, 500);
        }

        $scope.searchRedirect = function () {
            return $('#search_app').length <= 0;
        };

        // Seems to be necessary to get started. Unfortunately, the $watch
        // defined below also then kicks in, so the initial search is done
        // twice.
        if (!$scope.searchRedirect()) {
            $scope.search();
        }

        // Works with ng-debounce="500" defined in the search field, goes into effect every 500ms
        $scope.$watch('filters.q', function (newv) {
            if ((newv || newv == '')) {
                $scope.search();
            }
        });

        //Below this line are all the searching directives

        $scope.getHighlight = function (id) {
            if ($scope.result.highlighting && !$.isEmptyObject($scope.result.highlighting[id])) {
                return $scope.result.highlighting[id];
            } else return false;
        };

        $scope.toggleFilter = function (type, value, execute) {
            if ($scope.filters[type]) {
                if ($scope.filters[type] == value) {
                    $scope.clearFilter(type, value);
                } else {
                    if ($scope.filters[type].indexOf(value) == -1) {
                        $scope.addFilter(type, value);
                    } else {
                        $scope.clearFilter(type, value);
                    }
                }
            } else {
                $scope.addFilter(type, value);
            }
            $scope.filters['p'] = 1;
            if (execute) $scope.search();
        };

        $scope.toggleFacet = function (facet_type) {
            $('#more'+facet_type).slideToggle();
            //$('#link'+facet_type).toggle();
            // The slide toggle does not happen instantaneously,
            // and the visibility of the "View More..." text
            // depends on the visibility of the "#more..."
            // element. So after a suitable timeout,
            // force a recalculation of the visibility of
            // the "View More..." text.
            $timeout(function() {
                // A no-op is enough.
            }, 500);
        };

        $scope.addFilter = function (type, value) {
            if ($scope.filters[type]) {
                if (typeof $scope.filters[type] == 'string') {
                    var old = $scope.filters[type];
                    $scope.filters[type] = [];
                    $scope.filters[type].push(old);
                    $scope.filters[type].push(value);
                } else if (typeof $scope.filters[type] == 'object') {
                    $scope.filters[type].push(value);
                }
            } else $scope.filters[type] = value;
        };

        $scope.clearFilter = function (type, value, execute) {
            if (typeof $scope.filters[type] != 'object') {
                // It's a string.
                delete $scope.filters[type];
            } else if (typeof $scope.filters[type] == 'object') {
                // It's an array.
                var index = $scope.filters[type].indexOf(value);
                $scope.filters[type].splice(index, 1);
            }
            if (execute) $scope.search();
        };

        $scope.isFacet = function (type, value) {
            if ($scope.filters[type]) {
                if (typeof $scope.filters[type] == 'string' && $scope.filters[type] == value) {
                    return true;
                } else if (typeof $scope.filters[type] == 'object') {
                    return $scope.filters[type].indexOf(value) != -1;
                }
                return false;
            }
            return false;
        }

        // Utility to support hide/display of "View More..." links.
        $scope.isMoreVisible = function (type) {
            return $("#more" + type ).is(":visible");
        }
    }

})();
