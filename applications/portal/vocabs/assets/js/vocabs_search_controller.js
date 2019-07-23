/**
 * Controller for search.
 * @namespace searchCtrl
 */
/*jslint
    browser: true
*/
/*global
    $, angular
*/

(function () {
    'use strict';

    angular
        .module('app')
        .controller('searchCtrl', searchController);

    /** Default (maximum) number of search results per page.
     * @memberof searchCtrl
     */
    var defaultPageSize = '15';

    /** List of available sort options, when there is no query term.
     * The code relies on a convention that the default option
     * is the first in the list.
     * The id values must correspond with the values defined
     * in the Registry Schema search-sort-order enumerated type.
     * @memberof searchCtrl
     */
    var sortOptionsWhenNoQueryTerm = [
        { 'id': 'aToZ', 'name': 'Title A-Z'},
        { 'id': 'zToA', 'name': 'Title Z-A'},
        { 'id': 'lastUpdatedAsc', 'name': 'Least-recently updated'},
        { 'id': 'lastUpdatedDesc', 'name': 'Most-recently updated'}
    ];

    /** List of available sort options, when there is a query term.
     * The code relies on a convention that the default option
     * is the first in the list.
     * The id values must correspond with the values defined
     * in the Registry Schema search-sort-order enumerated type.
     * @memberof searchCtrl
     */
    var sortOptionsWhenQueryTerm = [
        { 'id': 'relevance', 'name': 'Relevance'},
        { 'id': 'aToZ', 'name': 'Title A-Z'},
        { 'id': 'zToA', 'name': 'Title Z-A'},
        { 'id': 'lastUpdatedAsc', 'name': 'Least-recently updated'},
        { 'id': 'lastUpdatedDesc', 'name': 'Most-recently updated'}
    ];

    /** Search controller.  See `views/includes/search-view.blade.php`
     * for the AngularJS-enabled search results template.
     * @param $scope The AngularJS controller scope.
     * @param $timeout The AngularJS $timeout service.
     * @param $log The AngularJS $log service.
     * @param $location The AngularJS $log service.
     * @memberof searchCtrl
     */
    function searchController($scope, $timeout, $log, $location) {
        // Initialise Registry API access.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var defaultClient = VocabularyRegistryApi.ApiClient.instance;
        defaultClient.basePath = registry_api_url;
        // Let the Registry know that we are the search controller,
        // and what URL this page is.
        defaultClient.defaultHeaders['portal-id'] = 'Portal-JS-search';
        defaultClient.defaultHeaders['portal-referrer'] = window.location;
        var api = new VocabularyRegistryApi.ServicesApi();

        /** Convenience reference to `base_url`; used in the results
         * template.
         * @memberof searchCtrl
         */
        $scope.base_url = base_url;

        /** Model for form elements. For now, that's just
         * form.query, which is the input in which the user
         * types their search query term(s).
         * @memberof searchCtrl
         */
        $scope.form = {};

        $scope.sortOptions = sortOptionsWhenNoQueryTerm;
        $scope.form.sort = $scope.sortOptions[0].id;

        /** The form of the URL containing a search is:
         * `base_url+"search/#!/?"+filter+"="+value`, e.g.,
         * `base_url+"search/#!/?q=fish"`,
         * `base_url+"search/#!/?q=fish&subjects=Fish"`. In recent
         * AngularJS, `$scope.filters` is a _copy_, not a
         * reference. So need to invoke
         * `$location.search($scope.filters)` whenever there's a
         * change.
         * @memberof searchCtrl
         */
        $scope.filters = $location.search();
        // See the end of this file for special handling to cope
        // with the particular case of the URL being
        // https://.../search, i.e. directly coming to the
        // search page with no filters specified.

        /** Entry point for user-initiated search actions; this is the
         * method invoked by click events for the "Search" button. The
         * effect is currently to keep any query text and filters that
         * are in place, but go (back) to page 1 of search results.
         * @memberof searchCtrl
         */
        $scope.search = function (isPagination) {
            $scope.filters.q = $scope.form.query;
            if (!$scope.filters['q']) {
                $scope.filters['q'] = '';
            }
            if (!$scope.filters['pp']) {
                $scope.filters['pp'] = defaultPageSize;
            }
            // If no isPagination parameter was supplied, or if it is
            // false, then (re)set the p filter to 1.
            if (!isPagination || isPagination == undefined) {
                $scope.filters['p'] = 1;
            }
            var sortFilter = sortSettingForCurrentSettings();
            if (sortFilter === undefined) {
                delete $scope.filters['sort'];
            } else {
                $scope.filters['sort'] = sortFilter;
            }
            if (notAlreadyOnResultsPage()) {
                // We're currently on a page _other than_
                // a search results page. So we redirect
                // to the Portal's PHP search() controller.
                // Use the default page size.
                window.location = $scope.base_url + 'search/#!/?pp=' +
                    defaultPageSize + '&q=' +
                    $scope.filters['q'];
            } else {
                // See comment above about a change to AngularJS. Now,
                // put our $scope.filters into $location.search().
                $location.search($scope.filters);
                // And that will have the desired effect of triggering
                // a change to $location.url(), and causes the search
                // to be performed.  Note that we _don't_ call
                // performSearch() here!  We don't need to: it's
                // invoked by the watcher.  And therefore we
                // _should't_ call performSearch() here, because we
                // would then get an extra call to api.search().
            }
        };

        /** Reset all search filters. Reset the page size to the
         * default, and show page 1 of results.
         * @memberof searchCtrl
         */
        $scope.resetSearch = function () {
            $scope.filters = {};
            $scope.filters['pp'] = defaultPageSize;
            $scope.form.query = "";
            // As noted in the comments for the sort option
            // definitions, we rely on a convention that the default
            // sort option is the first in the list.
            $scope.form.sort = $scope.sortOptions[0].id;
            $scope.search();
        };

        /** Perform a search, and extract the results.
         * @memberof searchCtrl
         */
        var performSearch = function() {
            api.search(JSON.stringify($scope.filters)).
                then(function (data) {
                    // $log.debug(data);
                    $scope.result = data;
                    var facets = [];
                    angular.forEach(data.facet_counts.facet_fields,
                        function (item, index) {
                            facets[index] = [];
                            for (var i = 0;
                                 i < data.facet_counts.facet_fields[index].length; i += 2) {
                                var fa = {
                                    name: data.facet_counts.facet_fields[index][i],
                                    value: data.facet_counts.facet_fields[index][i + 1]
                                };
                                facets[index].push(fa);
                            }
                            // Sort facets case-insentively; they come back
                            // from Solr sorted case-sensitively.
                            facets[index].sort(function (a, b) {
                                // Case-insensitive sort of full names, based
                                // on https://developer.mozilla.org/en-US/docs/Web/
                                //    JavaScript/Reference/Global_Objects/Array/sort
                                var nameA = a.name.toUpperCase();
                                var nameB = b.name.toUpperCase();
                                if (nameA < nameB) {
                                    return -1;
                                }
                                if (nameA > nameB) {
                                    return 1;
                                }
                                return 0;
                            });
                        });
                    $scope.facets = facets;

                    unpackHighlighting();

                    $scope.page = {
                        cur: ($scope.filters['p'] ? parseInt($scope.filters['p']) : 1),
                        rows: ($scope.filters['pp'] ? parseInt($scope.filters['pp']) : 10),
                        range: 3,
                        pages: []
                    }
                    $scope.page.end = Math.ceil(
                        $scope.result.response.numFound / $scope.page.rows);
                    for (var x = ($scope.page.cur - $scope.page.range);
                         x < (($scope.page.cur + $scope.page.range)+1); x++ ) {
                        if (x > 0 && x <= $scope.page.end) {
                            $scope.page.pages.push(x);
                        }
                    }
                    // We changed the model outside AngularJS's notice, so we
                    // need to cause a refresh of the form.
                    $scope.$apply();
                    // And now scroll to the top of the page.
                    $('html, body').animate({ 'scrollTop': 0 }, 'slow');
                });
        }

        // Watcher for this controller.  (We say $scope.$watch(...),
        // which means that both the watchExpression and listener
        // parameters are invoked only with this controller's $scope.)
        // Invoked on _each_ $digest cycle, but we only pay attention
        // when there is some sort of search term.
        // Invoked on page load, and whenever the $location.url()
        // changes. That can happen:
        // (a) after $scope.search() sets $location.search($scope.filters),
        //     i.e., after going to next/previous page of results, or
        //     applying/canceling a filter;
        // (b) after use of the browser forward/back button.
        // Note use of special (but arbitrary) string 'Not interested'
        // in both watchExpression and listener, so as to filter
        // out the events generated when navigating to a page
        // other than the search results page.
        $scope.$watch(
            function () {
                if (! $location.absUrl().slice(base_url.length).
                    startsWith('search')) {
                    // We're not even on the search results page.
                    //  console.log('Not interested');
                    return 'Not interested';
                }
                return $location.url();
            },
            function (url) {
                // console.log('Watcher invoked with url: ' + url);
                if (url === 'Not interested') {
                    // We're not even on the search results page.
                    return;
                }
                // Only do something if there is a url value,
                // i.e., which means there is a search to be performed.
                if (url) {
                    $scope.filters = $location.search();
                    $scope.form.query = $scope.filters.q;
                    // If no page size specified, set to the default.
                    if (!$scope.filters['pp']) {
                        $scope.filters['pp'] = defaultPageSize;
                    }
                    // Set sort options based on whether or not
                    // there is a search term.
                    if ($scope.filters['q']) {
                        $scope.sortOptions = sortOptionsWhenQueryTerm;
                    } else {
                        $scope.sortOptions = sortOptionsWhenNoQueryTerm;
                    }
                    // Restore the setting of the "Sort by" select.
                    if ($scope.filters['sort']) {
                        $scope.form.sort = $scope.filters['sort'];
                    } else {
                        // As noted in the comments for the sort
                        // option definitions, we rely on a convention
                        // that the default sort option is the first
                        // in the list.
                        $scope.form.sort = $scope.sortOptions[0].id;
                    }
                    performSearch();
                }
            });

        /** Callback for page selection within search results.
         * @param {number} newPage The page number to go to.
         * @memberof searchCtrl
         */
        $scope.goto = function(newPage) {
            $scope.filters['p'] = ''+newPage;
            $scope.search(true);
            $("html, body").animate({ scrollTop: 0 }, 500);
        }

        /** Get the value to use for the sort filter, based on the
         * current search settings. That value may be undefined,
         * if the other settings have their default values.
         * @memberof searchCtrl
         */
        var sortSettingForCurrentSettings = function() {
            if ($scope.form.sort == $scope.sortOptions[0].id) {
                // The select has been set to the default value.
                return undefined;
            } else {
                return $scope.form.sort;
            }
        }

        /** Are we on any page _other_ than a search results page?
         * If so, we will do a redirect to the Portal's PHP `search()`
         * controller.
         * _Only_ the search results page has the hidden element
         * with `id="search_app"`.
         * @returns {boolean} True iff we are not already on a search
         *   results page.
         * @memberof searchCtrl
         */
        var notAlreadyOnResultsPage = function () {
            return document.getElementById('search_app') === null;
        };

        // Below are all the user-initiated callbacks and their
        // helpers.

        /** Are any search filters at all in play?  More precisely:
         * are the current search settings not the "defaults"? This is
         * also the case if the user is not on the first page of
         * results, or if they have changed the sort order or page
         * size to something other than the default.
         * @returns {boolean} True, if there are any filters set.
         * @memberof searchCtrl
         */
        $scope.anyFilters = function() {
            var found = false;
            if (typeof $scope.filters === "object" &&
                Object.keys($scope.filters).length > 0) {
                angular.forEach(Object.keys($scope.filters),
                                function (key) {
                                    switch (key) {
                                    case 'q':
                                        if ($scope.filters['q'] != "") {
                                            found = true;
                                        }
                                        return;
                                    case 'p':
                                        if ($scope.filters['p'] != "1") {
                                            found = true;
                                        }
                                        return;
                                    case 'pp':
                                        if ($scope.filters['pp'] !=
                                            defaultPageSize) {
                                            found = true;
                                        }
                                        return;
                                    case 'sort':
                                        if ($scope.filters['sort'] &&
                                            $scope.filters['sort'] !=
                                            $scope.sortOptions[0].id) {
                                            found = true;
                                        }
                                        return;
                                    default: found = true;
                                    }
                                });
            }
            return found;
        }

        /** Processed highlighting data for search results.
         * Keys are document ids; values are the processed highlight
         * data for that document.
         * @memberof searchCtrl
         */
        var highlighting = {};

        /** Unpack highlighting data contained in the search results
         * and put it into highlighting.
         * @memberof searchCtrl
         */
        var unpackHighlighting = function() {
            highlighting = {};
            if ($scope.result.highlighting) {
                angular.forEach(
                    $scope.result.highlighting, function(highlights, id) {
                        var result = {};
                        // The highlighting result for a document
                        // can contain duplicate
                        // results for a field, and it can contain "duplicate"
                        // results for a field "xyz" and also "xyz_search"
                        // and also "xyz_phrase". Remove such duplicates.
                        angular.forEach(highlights, function(value, key) {
                            // Depending on the highlight method, value
                            // might be an empty list. (This is the case
                            // for the "unified" method.) If so, skip it.
                            if (value.length == 0) {
                                return;
                            }
                            if (key.endsWith("_sort")) {
                                // Ignore "*_sort" fields.
                                return;
                            }
                            key = key.replace("_search", "").
                                replace("_phrase", "");
                            if (key in result) {
                                result[key] = result[key].concat(value);
                            } else {
                                result[key] = value;
                            }
                        });
                        // Now go through each key/value pair and
                        // ensure the values are unique. Naive quadratic-time
                        // technique based on:
                        // https://stackoverflow.com/questions/1960473/
                        //   get-all-unique-values-in-a-javascript-array-
                        //   remove-duplicates
                        // When we no longer need to support IE, change
                        // this to use the Set constructor:
                        //   result[key] = [...new Set(result[key])];
                        angular.forEach(result, function(value, key) {
                            result[key] = result[key].filter(
                                function(value, index, self) { 
                                    return self.indexOf(value) === index;
                                }
                            );
                        });
                        highlighting[id] = result;
                    });
            }
        }

        /** Does a result have highlighting data?
         * Used in the results template.
         * Different Solr highlight methods give different
         * structures of results. So if you change the highlight
         * method, you need to change this method (and probably
         * make other changes).
         * The current implementation is good for the unified highlighter.
         * @param id The document id of the search result.
         * @memberof searchCtrl
         */
        $scope.hasHighlight = function (id) {
            return ((id in highlighting) &&
                    (typeof highlighting[id] === "object") &&
                    (Object.keys(highlighting[id]).length > 0));
        };

        /** Get highlighting information for one result.
         * Used in the results template.
         * @param id The document id of the search result.
         * @memberof searchCtrl
         */
        $scope.getHighlight = function (id) {
            return highlighting[id];
        };

        /** Callback to clear the search query.
         * Used in the results template.
         * @memberof searchCtrl
         */
        $scope.clearQuery = function () {
            $scope.form.query = '';
            $scope.search();
        };

        /** Callback to toggle one filter.
         * Used in the results template.
         * @param {string} type The name of the facet on which to
         *   filter, for example, `'subject_labels'`, `'publisher'`.
         * @param {string} value The value of the facet to use as a
         *   filter. For now, all invocations of this method specify
         *   the value `facet.name`.
         * @param {boolean} [execute=false] Whether to execute the
         *   search. For now, all invocations of this method
         *   pass in the value `true`.
         * @memberof searchCtrl
         */
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

        /** Callback to toggle the visibility of additional filter
         * values beyond the first n (where, currently, the value of n
         * used in the template is 8).  Used in the results template.
         * @param {string} facet_type The name of the facet for which
         *   the facet values are to be hidden or shown.
         * @memberof searchCtrl
         */
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

        /** Add a filter to the search terms.
         * Used in the results template.
         * @param {string} type The name of the facet on which to
         *   filter, for example, `'subject_labels'`, `'publisher'`.
         * @param {string} value The value of the facet to use as a
         *   filter. For now, all invocations of this method specify
         *   the value `facet.name`.
         * @memberof searchCtrl
         */
        $scope.addFilter = function (type, value) {
            if ($scope.filters[type]) {
                // filters[type] is present.
                if (typeof $scope.filters[type] == 'string') {
                    // filters[type] is just one string.
                    var old = $scope.filters[type];
                    $scope.filters[type] = [];
                    $scope.filters[type].push(old);
                    $scope.filters[type].push(value);
                } else if (typeof $scope.filters[type] == 'object') {
                    // filters[type] is an array containing more than
                    // one string.
                    $scope.filters[type].push(value);
                }
            } else {
                // filters[type] is not present.
                $scope.filters[type] = value;
            }
        };

        /** Remove one filter from the search terms.
         * Used in the results template.
         * @param {string} type The name of the facet on which to
         *   filter, for example, `'subject_labels'`, `'publisher'`.
         * @param {string} value The value of the facet to use as a
         *   filter. For now, all invocations of this method specify
         *   the value `facet.name`.
         * @param {boolean} [execute=false] Whether to execute the
         *   search. For now, all invocations of this method
         *   don't provide a value for this parameter.
         * @memberof searchCtrl
         */
        $scope.clearFilter = function (type, value, execute) {
            if (typeof $scope.filters[type] != 'object') {
                // filters[type] is a string; we remove the
                // key completely from filters.
                delete $scope.filters[type];
            } else if (typeof $scope.filters[type] == 'object') {
                // filters[type] is an array containing more than one
                // string; remove just this one value.
                var index = $scope.filters[type].indexOf(value);
                $scope.filters[type].splice(index, 1);
                // And remove the key completely if we now have
                // an empty array. This means $scope.anyFilters()
                // can be written more easily (it doesn't have to
                // check if arrays are empty).
                if ($scope.filters[type].length == 0) {
                    delete $scope.filters[type];
                }
            }
            if (execute) {
                $scope.search();
            }
        };

        /** Is there currently a filter in place for a specified facet
         * and value?  Used in the results template.
         * @param {string} type The name of the facet being checked,
         *   for example, `'subject_labels'`, `'publisher'`.
         * @param {string} value The value of the facet to check to
         *   see if is being used as a filter. For now, all
         *   invocations of this method specify the value
         *   `facet.name`.
         * @returns {boolean} True if there is currently a filter
         *   being applied for this facet and value.
         * @memberof searchCtrl
         */
        $scope.isFacet = function (type, value) {
            if ($scope.filters[type]) {
                if (typeof $scope.filters[type] == 'string' &&
                    $scope.filters[type] == value) {
                    return true;
                } else if (typeof $scope.filters[type] == 'object') {
                    return $scope.filters[type].indexOf(value) != -1;
                }
                return false;
            }
            return false;
        }

        /** In the case that there are more values for a facet than
         * the initial display limit (currently, 8), is it the case
         * that all possible values are currently being shown (i.e.,
         * because the user has clicked the "More..." button)?  Used
         * in the results template to show/hide the "More..." and
         * "Less..." buttons.
         * @param {string} type The name of the facet being checked,
         *   for example, `'subject_labels'`, `'publisher'`.
         * @returns {boolean} True if all values for a facet are
         *   currently being displayed.
         * @memberof searchCtrl
         */
        $scope.isMoreVisible = function (type) {
            return $("#more" + type ).is(":visible");
        }

        // Deal with one specific case here: we've come to the page
        // https://.../search directly, and there are no filters in
        // the URL. In that case, the watcher defined above wouldn't
        // do anything without a little help. We call $scope.search()
        // to set the filters to do the default search.
        if ($location.absUrl().slice(base_url.length).
            startsWith('search')) {
            // This is the search page. Now see if there
            // were no filters provided in the URL.
            // (See the initialization of $scope.filters at
            // the top of this file.)
            if (typeof $scope.filters === "object" &&
                Object.keys($scope.filters).length === 0) {
                $scope.search();
            }
        }
    }

})();
