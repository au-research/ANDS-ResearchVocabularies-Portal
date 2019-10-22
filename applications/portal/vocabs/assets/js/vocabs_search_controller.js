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

// TODO: use either iso-639-1 for language selection:
// https://www.npmjs.com/package/iso-639-1
// or langs:
// https://www.npmjs.com/package/langs
// For PHP, use:
// https://github.com/matriphe/php-iso-639

(function () {
    'use strict';

    angular
        .module('app')
        .controller('searchCtrl', searchController);

    /** Default active tab.
     * @memberof searchCtrl
     */
    var defaultActiveTab = 'vocabularies';

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
        { 'id': 'lastUpdatedAsc', 'name': 'Least recently updated'},
        { 'id': 'lastUpdatedDesc', 'name': 'Most recently updated'}
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
        { 'id': 'lastUpdatedAsc', 'name': 'Least recently updated'},
        { 'id': 'lastUpdatedDesc', 'name': 'Most recently updated'}
    ];

    /** A mapping of URIs that are possible values of the rdf_type
     * field, to some nice human-readable values, for display in
     * the portal search results.
     * @memberof searchCtrl
     */
    var rdfTypesHumanReadable = {
        'NONE': 'None (manually-entered)',
        'http://www.w3.org/2004/02/skos/core#Concept': 'SKOS Concept',
        'http://www.w3.org/2004/02/skos/core#ConceptScheme':
        'SKOS Concept Scheme',
        'http://www.w3.org/2004/02/skos/core#Collection': 'SKOS Collection',
        'http://www.w3.org/2004/02/skos/core#OrderedCollection':
        'SKOS Ordered Collection'
    };

    /** Search controller.  See `views/includes/search-view.blade.php`
     * for the AngularJS-enabled search results template.
     * @param $scope The AngularJS controller scope.
     * @param $timeout The AngularJS $timeout service.
     * @param $log The AngularJS $log service.
     * @param $location The AngularJS $log service.
     * @memberof searchCtrl
     */
    function searchController($scope, $timeout, $log, $location,
                              $templateCache) {

        /* Define our template for the bottom tabset. The effect of this
           is to hide the "body" of each tab when we don't use it.
        */
        $templateCache.put("tabset-hidden.html",
    "<div>\n" +
    "  <ul class=\"nav nav-{{tabset.type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\" style=\"display:none\">\n" +
    "    <div class=\"tab-pane\"\n" +
    "         ng-repeat=\"tab in tabset.tabs\"\n" +
    "         ng-class=\"{active: tabset.active === tab.index}\"\n" +
    "         uib-tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");

        // Initialise Registry API access.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var defaultClient = VocabularyRegistryApi.ApiClient.instance;
        defaultClient.basePath = registry_api_url;
        // Let the Registry know that we are the search controller,
        // and what URL this page is.
        defaultClient.defaultHeaders['portal-id'] = 'Portal-JS-search';
        defaultClient.defaultHeaders['portal-referrer'] =
            truncateHeader(window.location.toString());
        var api = new VocabularyRegistryApi.ServicesApi();

        /** Convenience reference to `base_url`; used in the results
         * template.
         * @memberof searchCtrl
         */
        $scope.base_url = base_url;

        /** Container for settings and values of the vocabularies tab.
         * vocabularies.facets, vocabularies.result.
         * @memberof searchCtrl
         */
        $scope.vocabularies = {
            /* Processed highlighting data for search results.  Keys
             * are document ids; values are the processed highlight
             * data for that document. See unpackHighlighting().
             */
            'highlighting' : {}
        };

        /** Container for settings and values of the vocabularies tab.
         * resources.facets, resources.result.
         * @memberof searchCtrl
         */
        $scope.resources = {
            /* See the comments in the definition of
             * $scope.vocabularies. */
            'highlighting' : {}
        };

        /** Get the container for the settings and values of the
         * active tab.  Returns either $scope.vocabularies or
         * $scope.resources. Defaults to $scope.vocabularies if there
         * is no current setting of the active tab.
         * @memberof searchCtrl
         */
        $scope.activeContainer = function () {
            if (!$scope.filters['activeTab']) {
                return $scope.vocabularies;
            }
            switch ($scope.filters['activeTab']) {
            case 'resources':
                return $scope.resources;
            case 'vocabularies':
            default:
                return $scope.vocabularies;
            }
        }

        /** List of available collapse options for the resource search.
         * The code relies on a convention that the default option
         * is the first in the list.
         * The id values must correspond with the values defined
         * in the Registry Schema search-resources-collapse enumerated type.
         * @memberof searchCtrl
         */
        $scope.collapseOptions = [
            { 'id': 'vocabularyIdIri',
              'name': 'Collapse results with the same IRI, per vocabulary'},
            { 'id': 'iri', 'name': 'Collapse results with the same IRI'},
            { 'id': 'none', 'name': 'Don\'t collapse results'}
        ];

        /** Model for form elements. That includes:
         * form.query, the input in which the user
         * types their search query term(s);
         * form.sort: the selected sort order;
         * form.collapse: the selected collapse option,
         * and the various xQuickFilter text inputs.
         * @memberof searchCtrl
         */
        $scope.form = {};

        $scope.sortOptions = sortOptionsWhenNoQueryTerm;
        $scope.form.sort = $scope.sortOptions[0].id;
        $scope.form.collapse = $scope.collapseOptions[0].id;

        /** The collection of all filters, for all tabs.
         * Keys are:
         * 'activeTab': Which search results tab is "active", i.e., currently
         * visible to users. Possible values are 'vocabularies' and
         * 'resources'.
         * 'q': The user-entered search query.
         * 'pp': The number of results per page.
         * 'sort': The sort order.
         * 'v_*': Filters specific to the vocabularies tab.
         * 'r_*': Filters specific to the resources tab.
         * Example filters for the vocabularies tab:
         * 'v_p': The page number of the vocabulary search results.
         * 'v_subject_labels': The current subject label filters.
         *
         * The form of the URL containing a search is:
         * `base_url+"search/#!/?"+filter+"="+value`, e.g.,
         * `base_url+"search/#!/?q=fish"`,
         * `base_url+"search/#!/?q=fish&subjects=Fish"`. In recent
         * AngularJS, `$scope.filters` is a _copy_, not a
         * reference. So need to invoke
         * `$location.search($scope.filters)` whenever there's a
         * change.
         * All filters for all tabs go into here. Filters that
         * "belong" to just one tab have a prefix: "v_" for
         * filters just for the vocabularies tab, "r_" for
         * filters just for the resources tab.
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
            // Reset all quick filters to help prevent user confusion.
            $scope.resetQuickFilters();
            $scope.filters.q = $scope.form.query;
            if (!$scope.filters['activeTab']) {
                $scope.filters['activeTab'] = defaultActiveTab;
            }
            if (!$scope.filters['q']) {
                $scope.filters['q'] = '';
            }
            if (!$scope.filters['pp']) {
                $scope.filters['pp'] = defaultPageSize;
            }
            // If no isPagination parameter was supplied, or if it is
            // false, then (re)set the p filters to 1.
            // NB: this happens when the user changes the page size
            // (filters.pp), so that we go back to the first page
            // of results. And this now happens for _both_ tabs.
            if (!isPagination || isPagination == undefined) {
                $scope.filters['v_p'] = 1;
                $scope.filters['r_p'] = 1;
            }
            var sortFilter = sortSettingForCurrentSettings();
            if (sortFilter === undefined) {
                delete $scope.filters['sort'];
            } else {
                $scope.filters['sort'] = sortFilter;
            }
            if ($scope.form.collapse === undefined) {
                delete $scope.filters['r_collapse_expand'];
            } else {
                $scope.filters['r_collapse_expand'] = $scope.form.collapse;
            }
            if (notAlreadyOnResultsPage()) {
                // We're currently on a page _other than_
                // a search results page. So we redirect
                // to the Portal's PHP search() controller.
                // Use the default page size.
                window.location = $scope.base_url + 'search/#!/?' +
                    'activeTab=' + defaultActiveTab +
                    '&pp=' + defaultPageSize +
                    '&q=' + encodeURIComponent($scope.filters['q']);
            } else {
                // CC-2600 When coming back to this search result
                // using the browser back button, don't scroll to
                // where the user was, but come back to the top of the
                // page.
                setScrollRestoration();
                scrollToTop();
                // See comment above about a change to AngularJS. Now,
                // put our $scope.filters into $location.search().
                $location.search($scope.filters);
                // And that will have the desired effect of triggering
                // a change to $location.url(), and causes the search
                // to be performed.  Note that we _don't_ call
                // performVocabulariesSearch() here!  We don't need to: it's
                // invoked by the watcher.  And therefore we
                // _should't_ call performVocabulariesSearch() here, because we
                // would then get an extra call to api.search().
            }
        };

        /** Reset all quick filters.
         * @memberof searchCtrl
         */
        $scope.resetQuickFilters = function () {
            $scope.form.v_subjectQuickFilter = {};
            $scope.form.v_publisherQuickFilter = {};
            $scope.form.r_subjectQuickFilter = {};
            $scope.form.r_publisherQuickFilter = {};
        };

        /** If the browser supports it, set history scroll restoration
         * to "manual".
         * @memberof searchCtrl
         */
        function setScrollRestoration() {
            if ('scrollRestoration' in history) {
                // Browser-dependent. Not IE/Edge (yet).
                history.scrollRestoration = 'manual';
            }
        }

        /** If the browser supports it, set history scroll restoration
         * (back) to "auto". We need this on search result links
         * for Chrome. Without using this, the setting would
         * remain 'manual'.
         * @memberof searchCtrl
         */
        $scope.unsetScrollRestoration = function() {
            if ('scrollRestoration' in history) {
                // Browser-dependent. Not IE/Edge (yet).
                history.scrollRestoration = 'auto';
            }
        }

        /** Scroll to the top of the page.
         * @memberof searchCtrl
         */
        function scrollToTop() {
            $('html, body').animate({ 'scrollTop': 0 }, 500);
        }

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
            // Ditto for collapse options.
            $scope.form.collapse = $scope.collapseOptions[0].id;
            // $scope.search also resets quick filters.
            $scope.search();
        };

        /** Perform a search on vocabulary metadata, and extract the results.
         * @memberof searchCtrl
         */
        function performVocabulariesSearch() {
            // Clear last facet results.  If we were to have warning
            // icons in the current search breadbox, this would avoid
            // "blinking" of those warning icons.  (But we don't yet
            // have warning icons ...)
            // Oops, let's comment this out for now, as it _causes_
            // "blinking" of the "Refine" section!
            //    $scope.vocabularies.facets = undefined;

            var filtersToSend = {};
            // We'll send only the filters that apply to searching
            // vocabulary metadata. And we strip the 'v_' prefix
            // from vocabularies-search-specific filter names.
            angular.forEach($scope.filters, function(value, key) {
                if (isFilterForTab(key, 'vocabularies')) {
                    filtersToSend[key.replace(/^v_/, '')] = value;
                }
            });

            api.search(JSON.stringify(filtersToSend)).
                then(function (data) {
                    // $log.debug(data);
                    $scope.vocabularies.result = data;
                    var facets = [];
                    // data.facet_counts are the facet counts from the search;
                    // there _may_ also be
                    // data.facet_counts_extra['subject_labels'], etc.
                    // For each facet f, merge data from
                    // data.facet_counts[f] and data.facet_counts_extra[f].
                    var facet_counts = data.facet_counts;
                    var facet_counts_extra = data['facets'];
                    if (facet_counts_extra == undefined) {
                        facet_counts_extra = {};
                    }
                    angular.forEach(facet_counts.facet_fields,
                        function (item, index) {
                            facets[index] = [];
                            for (var i = 0;
                                 i < facet_counts.facet_fields[index].length;
                                 i += 2) {
                                var fa = {
                                    name: facet_counts.facet_fields[index][i],
                                    result_count:
                                    facet_counts.facet_fields[index][i + 1]
                                };
                                facets[index].push(fa);
                            }
                            // Now see if there is more info in
                            // facet_counts_extra.
                            if (index in facet_counts_extra) {
                                var facet_counts_extra_to_merge =
                                    facet_counts_extra[index].buckets;
                                // Now merge facets_extra into facets[index].
                                facets[index] = mergeFacets(facets[index],
                                                 facet_counts_extra_to_merge);
                            }
                            // Sort facets case-insensitively; they come back
                            // from Solr sorted case-sensitively.
                            facets[index].sort(caseInsensitiveCompare);
                        });
                    $scope.vocabularies.facets = facets;

                    unpackHighlighting($scope.vocabularies);

                    $scope.vocabularies.page = {
                        cur: ($scope.filters['v_p'] ?
                              parseInt($scope.filters['v_p']) : 1),
                        rows: ($scope.filters['pp'] ?
                               parseInt($scope.filters['pp']) : 10),
                        range: 3,
                        pages: []
                    }
                    $scope.vocabularies.page.end = Math.ceil(
                        $scope.vocabularies.result.response.numFound /
                            $scope.vocabularies.page.rows);
                    for (var x = ($scope.vocabularies.page.cur -
                                  $scope.vocabularies.page.range);
                         x < (($scope.vocabularies.page.cur +
                               $scope.vocabularies.page.range)+1); x++ ) {
                        if (x > 0 && x <= $scope.vocabularies.page.end) {
                            $scope.vocabularies.page.pages.push(x);
                        }
                    }
                    // We changed the model outside AngularJS's notice, so we
                    // need to cause a refresh of the form.
                    $scope.$apply();
                    // Scroll to top, if we've come back/forward to a
                    // page we already set to "manual" scroll
                    // restoration.  This happens going back/forward
                    // to one of "our" pages, except when that's the
                    // _last_ page in the contiguous sequence of
                    // search results pages.
                    if ('scrollRestoration' in history) {
                        // Browser-dependent. Not IE/Edge (yet).
                        if (history.scrollRestoration == 'manual') {
                            scrollToTop();
                        }
                    }
                });
        }

        /** Tidy the field names of the highlighting results
         * for one Solr document returned from a resources search.
         * @param {object} result The highlighting results for one
         *     Solr document. The keys are field names.
         * @returns {object} The highlighting results, but with
         *     the keys made "pretty".
         * @memberof searchCtrl
         */
        function tidyResourceFieldNames(result) {
            var tidied = {};
            angular.forEach(result, function(value, key) {
                var newKey = key;
                // Deal with:
                // top_concept
                // rdfs_label
                // rdfs_label_all
                // skos_prefLabel
                // skos_prefLabel_all
                // dcterms_description
                // dcterms_description_all
                // etc.
                // Make sure that all underscores _other_ than
                // the one that precedes a language key are gone
                // before the final replace!
                newKey = newKey.
                    replace(/^top_concept/, "top concept").
                    replace(/^rdfs_/, "RDF Schema ").
                    replace(/^skos_/, "SKOS ").
                    replace(/^dcterms_/, "DC Terms ").
                    replace (/_all$/, "").
                    replace (/_([A-Za-z]+)$/, " , language: $1");
                tidied[newKey] = value;
            });
            return tidied;
        }


        /** Perform a search on resource data, and extract the
         * results.
         * @memberof searchCtrl
         */
        function performResourcesSearch() {
            // Clear last facet results.  If we were to have warning
            // icons in the current search breadbox, this would avoid
            // "blinking" of those warning icons.  (But we don't yet
            // have warning icons ...)
            // Oops, let's comment this out for now, as it _causes_
            // "blinking" of the "Refine" section!
            //    $scope.resources.facets = undefined;

            var filtersToSend = {};
            // We'll send only the filters that apply to searching
            // resource data. And we strip the 'r_' prefix from
            // resources-search-specific filter names.
            angular.forEach($scope.filters, function(value, key) {
                if (isFilterForTab(key, 'resources')) {
                    filtersToSend[key.replace(/^r_/, '')] = value;
                }
            });

            api.searchResources(JSON.stringify(filtersToSend)).
                then(function (data) {
                    // $log.debug(data);
                    $scope.resources.result = data;
                    var facets = [];
                    // data.facet_counts are the facet counts from the search;
                    // there _may_ also be
                    // data.facet_counts_extra['subject_labels'], etc.
                    // For each facet f, merge data from
                    // data.facet_counts[f] and data.facet_counts_extra[f].
                    var facet_counts = data.facet_counts;
                    var facet_counts_extra = data['facets'];
                    if (facet_counts_extra == undefined) {
                        facet_counts_extra = {};
                    }
                    angular.forEach(facet_counts.facet_fields,
                        function (item, index) {
                            facets[index] = [];
                            for (var i = 0;
                                 i < facet_counts.facet_fields[index].length;
                                 i += 2) {
                                var fa = {
                                    name: facet_counts.facet_fields[index][i],
                                    result_count:
                                    facet_counts.facet_fields[index][i + 1]
                                };
                                facets[index].push(fa);
                            }
                            // Now see if there is more info in
                            // facet_counts_extra.
                            if (index in facet_counts_extra) {
                                var facet_counts_extra_to_merge =
                                    facet_counts_extra[index].buckets;
                                // Now merge facets_extra into facets[index].
                                facets[index] = mergeFacets(facets[index],
                                                 facet_counts_extra_to_merge);
                            }
                            // Sort facets case-insensitively; they come back
                            // from Solr sorted case-sensitively.
                            facets[index].sort(caseInsensitiveCompare);
                        });
                    $scope.resources.facets = facets;

                    unpackHighlighting($scope.resources,
                                       tidyResourceFieldNames);
                    postprocessExpandedResults();

                    $scope.resources.page = {
                        cur: ($scope.filters['r_p'] ?
                              parseInt($scope.filters['r_p']) : 1),
                        rows: ($scope.filters['pp'] ?
                               parseInt($scope.filters['pp']) : 10),
                        range: 3,
                        pages: []
                    }
                    $scope.resources.page.end = Math.ceil(
                        $scope.resources.result.response.numFound /
                            $scope.resources.page.rows);
                    for (var x = ($scope.resources.page.cur -
                                  $scope.resources.page.range);
                         x < (($scope.resources.page.cur +
                               $scope.resources.page.range)+1); x++ ) {
                        if (x > 0 && x <= $scope.resources.page.end) {
                            $scope.resources.page.pages.push(x);
                        }
                    }
                    // We changed the model outside AngularJS's notice, so we
                    // need to cause a refresh of the form.
                    $scope.$apply();
                    // Scroll to top, if we've come back/forward to a
                    // page we already set to "manual" scroll
                    // restoration.  This happens going back/forward
                    // to one of "our" pages, except when that's the
                    // _last_ page in the contiguous sequence of
                    // search results pages.
                    if ('scrollRestoration' in history) {
                        // Browser-dependent. Not IE/Edge (yet).
                        if (history.scrollRestoration == 'manual') {
                            scrollToTop();
                        }
                    }
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
                // Ensure we get rid of any open modal popup.  Without
                // this, if you have an open popup, then use the back
                // button, the popup goes away, but the remaining page
                // is still fully overlaid with the dark gray that
                // stops the user interacting with the underlying
                // page.  May need to revisit this if/when we change
                // the default tab to be the resources tab.
                $('.modal').modal('hide');

                // Only do something if there is a url value,
                // i.e., which means there is a search to be performed.
                if (url) {
                    $scope.filters = $location.search();
                    $scope.form.query = $scope.filters.q;
                    // If no active tab specified, set to the default.
                    if (!$scope.filters['activeTab']) {
                        $scope.filters['activeTab'] = defaultActiveTab;
                    }
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
                    // Same for the "Collapse by" select.
                    if ($scope.filters['r_collapse_expand']) {
                        $scope.form.collapse =
                            $scope.filters['r_collapse_expand'];
                    } else {
                        // As noted in the comments for the sort
                        // option definitions, we rely on a convention
                        // that the default sort option is the first
                        // in the list.
                        $scope.form.collapse = $scope.collapseOptions[0].id;
                    }
                    performVocabulariesSearch();
                    performResourcesSearch();
                }
            });

        /* Utility methods for processing facet value/count data. */

        /** Compare two facet values by name, case-insensitively.
         * Pass this function as the parameter to the sort() function.
         * The two parameters specify their names as a.name and b.name.
         * @param {object} a The first facet value to be compared.
         * @param {object} b The second facet value to be compared.
         * @returns {number} -1 if a < b, 0 if a == b, and 1 if a > b.
         * @memberof searchCtrl
         */
        function caseInsensitiveCompare(a, b) {
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
        };

        /** Compare two facet values by name, case-sensitively.
         * The two parameters specify their names used differently:
         * a.name, but b.val.
         * @param {object} a The first facet value to be compared.
         * @param {object} b The second facet value to be compared.
         * @returns {number} -1 if a < b, 0 if a == b, and 1 if a > b.
         * @memberof searchCtrl
         */
        function caseSensitiveCompare(a, b) {
            // Case-sensitive sort of full names, based
            // on https://developer.mozilla.org/en-US/docs/Web/
            //    JavaScript/Reference/Global_Objects/Array/sort
            var nameA = a.name;
            var nameB = b.val;
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        };

        /** Merge two arrays of facet results.
         * The two arrays must already be sorted.
         * @param {object[]} a The first array of facet values to be merged.
         *   The elements of this array have a name and result_count key/value.
         * @param {object[]} b The second array of facet values to be merged.
         *   The elements of this array have a val and count key/value.
         * @param {object[]} A new array, containing the values of both
         *   a and b. Every array element has the keys name and result_count,
         *   and _may_ also have the key extra_count.
         *   Where an element has come only from b, the value
         *   of result_count is set to 0.
         *   Where an element from a has been combined with
         *   an element of b, the resulting value contains the
         *   result_count value from the element of a and the
         *   extra_count value from the element of b.
         * @memberof searchCtrl
         */
        function mergeFacets(a, b) {
            // The result of the merge.
            var merged = [];
            // Cursor over a.
            var i = 0;
            // Cursor over b.
            var j = 0;
            while (i < a.length) {
                if (j == b.length) {
                    // We reached the end of b, but there is more of a.
                    merged.push(a[i]);
                    i++;
                    continue;
                }
                // There is more of both a and b.
                // Very important!: comparison must be based on
                // an _exact_ (i.e., not case-insensitive) match,
                // otherwise we might "merge" two values that
                // are in fact different and which must be kept separate.
                switch (caseSensitiveCompare(a[i], b[j])) {
                case 0:
                    merged.push({
                        name: a[i].name,
                        result_count: a[i].result_count,
                        extra_count: b[j].count
                    });
                    i++;
                    j++;
                    break;
                case -1:
                    merged.push(a[i]);
                    i++;
                    break;
                case 1:
                    merged.push({
                        name: b[j].val,
                        result_count: 0,
                        extra_count: b[j].count
                    });
                    j++;
                    break;
                default:
                    // Broken!
                    throw new Exception('Defect in caseSensitiveCompare');
                }
            }
            // Now we've processed all of a; append the rest of b.
            while (j < b.length) {
                // There is more of b.
                merged.push({
                        name: b[j].val,
                        result_count: 0,
                        extra_count: b[j].count
                    });
                j++;
            }
            return merged;
        }

        /** Callback for page selection within search results.
         * @param {number} newPage The page number to go to.
         * @memberof searchCtrl
         */
        $scope.goto = function(newPage) {
            if (!$scope.filters['activeTab']) {
                // Oops!
                $scope.filters['v_p'] = ''+newPage;
                $scope.search(true);
            } else {
                switch ($scope.filters['activeTab']) {
                case 'resources':
                    $scope.filters['r_p'] = ''+newPage;
                    $scope.search(true);
                    break;
                case 'vocabularies':
                default:
                    //If default, then oops!
                    $scope.filters['v_p'] = ''+newPage;
                    $scope.search(true);
                }
            }
        }

        /** Get the value to use for the sort filter, based on the
         * current search settings. That value may be undefined,
         * if the other settings have their default values.
         * @memberof searchCtrl
         */
        function sortSettingForCurrentSettings() {
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
        function notAlreadyOnResultsPage() {
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
                                    case 'activeTab':
                                        // Don't care about the active tab.
                                        return;
                                    case 'q':
                                        if ($scope.filters['q'] != "") {
                                            found = true;
                                        }
                                        return;
                                    case 'v_p':
                                        if ($scope.filters['v_p'] != "1") {
                                            found = true;
                                        }
                                        return;
                                    case 'r_p':
                                        if ($scope.filters['r_p'] != "1") {
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

        /** Unpack highlighting data contained in the search results
         * and put it into highlighting.
         * @param {object} tab The container for settings for a tab.
         *     Pass in either $scope.vocabularies or $scope.resources.
         * @param {function} tidyFieldNames If specified, a callback
         *     to tidy the field names of results. Invoked on each
         *     set of highlighting results for one document. If not
         *     required, pass in undefined.
         * @memberof searchCtrl
         */
        function unpackHighlighting(tab, tidyFieldNames) {
            tab.highlighting = {};
            if (tab.result.highlighting) {
                angular.forEach(
                    tab.result.highlighting,
                    function(highlights, id) {
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
                        if (tidyFieldNames != undefined) {
                            result = tidyFieldNames(result);
                        }
                        tab.highlighting[id] = result;
                    });
            }
        }

        /** The contents of expanded results of a resource search,
         * repackaged into a more convenient structure for the portal.
         * @memberof searchCtrl
         */
        $scope.repackagedExpanded = {};

        /** Unpack the expanded results of a resource search, and
         * repackage them into a more convenient structure for the portal.
         * @memberof searchCtrl
         */
        function postprocessExpandedResults() {
            $scope.repackagedExpanded = {};
            if (!('expanded' in $scope.resources.result)) {
                // Not even an expanded section; nothing more to do.
                return;
            }
            // The Solr response has an expanded section;
            // it may still be an empty object ({}).
            // We need the main response to get the vocabulary ID of
            // each collapsed result.
            var responseDocs = $scope.resources.result.response.docs;
            var expanded = $scope.resources.result.expanded;
            /* In general, the result should look like this. The
               top-level keys are "collapse Ids", which may be
               either (a) IRIs (b) combined vocabulary Id and IRI.
               $scope.repackagedExpanded = {
                 'http://...': {
                   'vocabulary_id': '27',
                   'same': [
                     { doc for another version of vocabulary_id 27 },
                     { another doc for another version of vocabulary_id 27 },
                     ],
                   'other': {
                     '28' : [
                       { one doc with vocabulary_id 28 },
                       { another doc with vocabulary_id 28 },
                     ]
                   }
                 }
               }
            */
            angular.forEach(responseDocs, function(doc) {
                if (!('iri' in doc)) {
                    // No IRI, so this is a manually-entered top concept.
                    return;
                }
                var iri = doc.iri;
                var vocab_id = doc.vocabulary_id;
                // If we got this far, there must be a value for the
                // collapse_id field.
                var collapse_id = doc.collapse_id;
                if (collapse_id in expanded) {
                    var edocs = expanded[collapse_id].docs;
                    var repackagedDoc = { 'vocabulary_id' : vocab_id };
                    angular.forEach(edocs, function(edoc) {
                        if (edoc.vocabulary_id == vocab_id) {
                            // same
                            if (!('same' in repackagedDoc)) {
                                repackagedDoc.same = [];
                            }
                            repackagedDoc.same.push(edoc);
                        } else {
                            // other
                            if (!('other' in repackagedDoc)) {
                                repackagedDoc.other = {};
                            }
                            if (!(edoc.vocabulary_id in repackagedDoc.other)) {
                                repackagedDoc.other[edoc.vocabulary_id] = [];
                            }
                            repackagedDoc.other[edoc.vocabulary_id].push(edoc);
                        }
                    });
                    $scope.repackagedExpanded[collapse_id] = repackagedDoc;
                }
            });
        }

        /** Does a result have highlighting data?
         * Used in the results template.
         * Different Solr highlight methods give different
         * structures of results. So if you change the highlight
         * method, you need to change this method (and probably
         * make other changes).
         * The current implementation is good for the unified highlighter.
         * @param {object} tab The container for settings for a tab.
         *     Pass in either $scope.vocabularies or $scope.resources.
         * @param id The document id of the search result.
         * @memberof searchCtrl
         */
        $scope.hasHighlight = function (tab, id) {
            return ((id in tab.highlighting) &&
                    (typeof tab.highlighting[id] === "object") &&
                    (Object.keys(tab.highlighting[id]).length > 0));
        };

        /** Get highlighting information for one result.
         * Used in the results template.
         * @param {object} tab The container for settings for a tab.
         *     Pass in either $scope.vocabularies or $scope.resources.
         * @param id The document id of the search result.
         * @memberof searchCtrl
         */
        $scope.getHighlight = function (tab, id) {
            return tab.highlighting[id];
        };

        /** Callback to clear the search query.
         * Used in the results template.
         * @memberof searchCtrl
         */
        $scope.clearQuery = function () {
            $scope.form.query = '';
            $scope.search();
        };

        /** Is a particular filter name applicable to a particular
         * tab?
         * @param filter The name of a filter, e.g., 'v_p'.
         * @param tab The name of a tab; either 'vocabularies' or
         *            'resources'.
         * @returns {boolean} True if the the filter is applicable
         *   to the tab.
         * @memberof searchCtrl
         */
        function isFilterForTab(filter, tab) {
            switch (filter) {
            case 'q':
            case 'pp':
            case 'sort':
                return true;
            default:
                if (filter.startsWith('v_') && tab == 'vocabularies') {
                    return true;
                }
                if (filter.startsWith('r_') && tab == 'resources') {
                    return true;
                }
                return false;
            }
        }

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
            if (!$scope.filters['activeTab']) {
                // Oops!
                $scope.filters['v_p'] = 1;
            } else {
                switch ($scope.filters['activeTab']) {
                case 'resources':
                    $scope.filters['r_p'] = 1;
                    break;
                case 'vocabularies':
                default:
                    //If default, then oops!
                    $scope.filters['v_p'] = 1;
                }
            }
            if (execute) {
                $scope.search();
            }
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
        };

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

        /** Get a "human-readable" version of the collapse setting.
         * If there is no current setting, return the "human-readable"
         * of the default setting.
         * If we can't give one (oops, that "shouldn't" happen),
         * return the id of the collapse setting.
         * @returns {string} The "human-readable" version of the collapse
         *   setting, or its id, if we don't have one.
         * @memberof searchCtrl
         */
        $scope.collapseOptionPretty = function () {
            if (!('collapse' in $scope.form) ||
                $scope.form.collapse == undefined) {
                return $scope.collapseOptions[0].name;
            }
            var entity = $scope.collapseOptions.find(function(o) {
                return o.id === $scope.form.collapse;
            });
            if (entity == undefined) {
                return $scope.collapseOptions[0].name;
            }
            return entity.name;
        }

        /** Callback to reset the collapse option.
         * @memberof searchCtrl
         */
        $scope.resetCollapse = function () {
            $scope.filters['r_collapse_expand'] = $scope.collapseOptions[0].id;
            $scope.form.collapse = $scope.collapseOptions[0].id;
            $scope.search();
        };

        /** Get a "human-readable" version of an RDF type for use in
         * faceting.
         * If we can't give one (oops, that "shouldn't" happen),
         * return the IRI of the RDF type.
         * @param {string} iri The IRI of the RDF type.
         * @returns {string} The "human-readable" version of the type,
         *   or the IRI, if we don't have one.
         * @memberof searchCtrl
         */
        $scope.rdfTypePretty = function (iri) {
            if (iri in rdfTypesHumanReadable) {
                return rdfTypesHumanReadable[iri];
            }
            return iri;
        }

        /** Get a "human-readable" version of an RDF type for use in
         * a "lozenge" for a search result.
         * If we can't give one (oops, that "shouldn't" happen),
         * return the IRI of the RDF type.
         * The difference between this method and rdfTypePretty()
         * is that this method gives a different answer for the
         * special iri "NONE".
         * @param {string} iri The IRI of the RDF type.
         * @returns {string} The "human-readable" version of the type,
         *   or the IRI, if we don't have one.
         * @memberof searchCtrl
         */
        $scope.rdfTypePrettyForLozenge = function (iri) {
            if (iri == 'NONE') {
                return 'Manually-entered';
            }
            if (iri in rdfTypesHumanReadable) {
                return rdfTypesHumanReadable[iri];
            }
            return iri;
        }

        /** Get a "human-readable" version of a version status.
         * @param {string} status The version status, as returned from
         *   Solr.
         * @returns {string} The "human-readable" version of the version
         *   status.
         * @memberof searchCtrl
         */
        $scope.versionStatusPretty = function (status) {
            return status.toLowerCase();
        }

        /** Callback invoked when the user has clicked a tab heading.
         * Note: this is invoked irrespective of whether the tab is
         * already the active tab.
         * @param {string} newTab The selected tab, either 'vocabularies'
         *   or 'resources'.
         * @memberof searchCtrl
         */
        $scope.tabChanged = function (newTab) {
            // console.log('tabChanged called with tab: ' + newTab);
            if (newTab == $scope.filters['activeTab']) {
                // console.log('tabChanged did nothing');
                return;
            }
            if ('result' in $scope.vocabularies
                && 'response' in $scope.vocabularies.result) {
                $scope.vocabularies.result.response.docs = [];
            }
            if ('result' in $scope.resources
                && 'response' in $scope.resources.result) {
                $scope.resources.result.response.docs = [];
            }
            $scope.filters.activeTab = newTab;
            $location.search($scope.filters);
        }

        /**
         * @param {object} doc The Solr document to be analysed.
         * @param {string} fieldName The base field name, e.g.,
         *   'skos_prefLabel'.
         * @memberof searchCtrl
         */
        $scope.getFieldValuesForField = function(doc, fieldName) {
            // In the following, we use a running example of
            // fieldName=='skos_prefLabel'.
            // There are three possibilities:
            // (1) doc contains a field skos_prefLabel_all.
            //
            // (2) doc _doesn't_ contain a field skos_prefLabel_all,
            // (3) doc _doesn't_ contain any fields skos_prefLabel*.

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
