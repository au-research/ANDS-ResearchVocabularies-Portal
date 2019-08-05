/**
 * Created by leomonus on 19/02/16.
 */
(function () {
    'use strict';

    angular
        .module('app')
        .directive('widgetDirective', widgetDirective);

    function widgetDirective($templateCache, vocabs_factory) {
        return {
            restrict: 'AE',
            templateUrl: base_url + 'assets/vocabs/templates/widgetDirective.html',
            link: function (scope, elem) {

                // Initialise Registry API access.
                var VocabularyRegistryApi = require('vocabulary_registry_api');
                var defaultClient = VocabularyRegistryApi.ApiClient.instance;
                defaultClient.basePath = registry_api_url;
                // Let the registry know that we are the search controller,
                // and what URL this page is.
                defaultClient.defaultHeaders['portal-id'] =
                    'Portal-JS-widget';
                defaultClient.defaultHeaders['portal-referrer'] =
                    truncateHeader(window.location.toString());
                var api = new VocabularyRegistryApi.ServicesApi();

                scope.vocabList = [];
                scope.base_url = base_url;

                // For now, do a filtered search to get the widgetable
                // vocabularies. The Solr documentation says don't do this
                // (i.e., using "pp":-1 here to have the API method ask for
                // a "ridiculously large" number of result rows).
                // So, we should look to implement an API method that does
                // a database query instead of a Solr query.
                api.search("{\"pp\": -1, \"widgetable\":true}").
                then(function (data) {
                    scope.vocabList = data.response.docs;
                    // If desired, uncomment the following to
                    // preset the dropdown to the first vocab in the list (if any).
                    /*
                    if (scope.vocabList instanceof Array
                        && scope.vocabList.length > 0) {
                        scope.selectVocab(scope.vocabList[0]);
                    }
                    */
                });

                // Override the Bootstrap templates defined
                // at the end of assets/js/lib/ui-select/dist/select.js.

                // In select.tpl.html,
                // <div class="ui-select-container ... dropdown"
                // is changed to
                // <div class="ui-select-container ... dropdown swatch-white"
                $templateCache.put("bootstrap/select.tpl.html","<div class=\"ui-select-container ui-select-bootstrap dropdown swatch-white\" ng-class=\"{open: $select.open}\"><div class=\"ui-select-match\"></div><span ng-show=\"$select.open && $select.refreshing && $select.spinnerEnabled\" class=\"ui-select-refreshing {{$select.spinnerClass}}\"></span> <input type=\"search\" autocomplete=\"off\" tabindex=\"-1\" aria-expanded=\"true\" aria-label=\"{{ $select.baseTitle }}\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" class=\"form-control ui-select-search\" ng-class=\"{ \'ui-select-search-hidden\' : !$select.searchEnabled }\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-show=\"$select.open\"><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");

                // In match.tpl.html,
                // <span ... class="btn btn-default..."
                // is changed to
                // <span ... class="btn btn-primary..."
                $templateCache.put("bootstrap/match.tpl.html","<div class=\"ui-select-match\" ng-hide=\"$select.open && $select.searchEnabled\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\"><span tabindex=\"-1\" class=\"btn btn-primary form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\"><span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}</span> <span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\"></span> <i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\"></i> <a ng-show=\"$select.allowClear && !$select.isEmpty() && ($select.disabled !== true)\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 10px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\"><i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></i></a></span></div>");

                scope.items = [];

                scope.selectVocab = function (vocab) {
                    scope.selectedVocab = vocab;
                }
            }
        }
    }

})();
