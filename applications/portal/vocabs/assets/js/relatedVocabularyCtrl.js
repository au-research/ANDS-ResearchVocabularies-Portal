(function () {
    'use strict';

    angular
        .module('app')
        .controller('relatedVocabularyCtrl', relatedVocabularyCtrl);

    /** Controller for modal dialog for entering/editing
     * related internal vocabularies.
     * This is a much-simplified version of relatedCtrl.
     * @param $scope
     * @param $uibModalInstance
     * @param $log
     * @param $timeout
     * @param $templateCache
     * @param entity
     * @param confluenceTip
     * @returns
     */
    function relatedVocabularyCtrl($scope, $uibModalInstance, $log, $timeout,
                         $templateCache,
                         entity, confluenceTip) {

        // Make the modal dialog (at least, temporarily) movable,
        // to be consistent with the version modal (which was
        // as per request in SD-11572, CC-2050).
        $timeout(function(){
            $('.modal-content').draggable({ revert: true });
        });
        // Set up access to the Registry API.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var api = new VocabularyRegistryApi.ResourcesApi();

        /* List the relationships allowed. */
        $scope.relatedVocabularyRelations = [
            {"value": "hasAssociationWith", "text": "Associated with"},
            {"value": "isDerivedFrom", "text": "Derived from"},
            {"value": "enriches", "text": "Enriches"},
            {"value": "isPartOf", "text": "Part of"}
        ];

        /** A list of the multi-valued elements that are the elements
            of $scope.entity. Useful when iterating over all of these. */
        $scope.multi_valued_lists = [ 'relationship' ];

        // Some utility functions used by initialization (and by save).
        /** Ensure that a multi-value field has a minimal content, ready
            for editing. For some types, this could be an empty list;
            for others, a list with one (blank) element. */
        $scope.ensure_minimal_list = function (type) {
            if ((!(type in $scope.entity)) ||
                    ($scope.entity[type].length == 0)) {
                // Now an empty list. Do we put back a placeholder?
                switch (type) {
                case 'relationship':
                    $scope.entity[type] = [null];
                    break;
                default:
                    $scope.entity[type] = [];
                }
            }
        }

        /** Ensure that all multi-value fields have minimal content, ready
            for editing. For some types, this could be an empty list;
            for others, a list with one (blank) element. */
        $scope.ensure_all_minimal_lists = function () {
            angular.forEach($scope.multi_valued_lists, function (type) {
                $scope.ensure_minimal_list(type);
            });
        }

        // Initialization proper starts here.

        $scope.entity = false;
        // "Intent" is derived from what the user did on the main CMS page.
        // If they clicked "Add", then the intent is "add".
        // If they clicked a vocabulary title already in the list
        // in the "Related" section of the CMS page, then the intent is "save".
        $scope.intent = 'add';
        $scope.confluenceTip = confluenceTip;

        if (entity) {
            $scope.entity = entity;
            $scope.intent = 'save';
        } else {
            // Ensure minimum details to enable the form to work.
            $scope.entity = {};
            $scope.ensure_all_minimal_lists();
//            $scope.entity = {'relationship':[null]};
        }

        /* Set valid relations for this type. */
        $scope.relatedEntityRelations = $scope.relatedVocabularyRelations;

        $scope.form = {
            reForm:{}
        }


        $scope.onFocus = function (e) {
            $timeout(function () {
              $(e.target).trigger('input');
              $(e.target).trigger('change'); // for IE
            });
          };

        $scope.populate = function (item) {
            $scope.entity.id = item.getId();
            $scope.entity.title = item.getTitle();
        };

        $scope.list_add = function (type, obj) {
            if (!$scope.entity) $scope.entity = {};
            if (!$scope.entity[type]) $scope.entity[type] = [];
            if (obj) {
                $scope.entity[type].push(obj);
            }
        };

        /**
         * Add an item to a multi-valued list.
         * @param name of list: for now, should be 'relationship'.
         */
        $scope.addtolist = function (list) {
            if (!$scope.entity[list]) $scope.entity[list] = [];

            var newValue;
            newValue = null;

            // Add new blank item to list.
            $scope.entity[list].push(newValue);
        };

        /**
         * Remove an item from a multi-valued list. The list
         * is left in good condition: specifically,
         * $scope.ensure_minimal_list is called after the item
         * is removed.
         * @param name of list: one of the values in $scope.multi_valued_lists,
         *   e.g., 'top_concept'.
         * @param index of the item to be removed.
         */
        $scope.list_remove = function (type, index) {
            if (index > 0) {
                $scope.entity[type].splice(index, 1);
            } else {
                $scope.entity[type].splice(0, 1);
            }
            $scope.ensure_minimal_list(type);
        };

        /** Utility function for validation of fields that can have
            multiple entries. The list is supposed to have at least one
            element that is a non-empty string. This method returns true
            if this is not the case. */
        $scope.array_has_no_nonempty_strings = function (list) {
            return list === undefined || list.filter(Boolean).length == 0;
        }

        /** Tidy up all empty fields. To be used before saving.
            Note that this does not guarantee validity.
         */
        $scope.tidy_empty = function() {
            $scope.entity.relationship = $scope.entity.relationship.filter(Boolean);
        }

        $scope.save = function () {
            if ($scope.validateVocabulary()) {
                var ret = {
                    'intent': $scope.intent,
                    'data': $scope.entity
                };
                $uibModalInstance.close(ret);
            } else {
                // Put back the multi-value lists ready for more editing.
                $scope.ensure_all_minimal_lists();
                return false;
            }
        };

        $scope.validateVocabulary = function () {
            delete $scope.error_message;

            // Tidy up empty fields before validation.
            $scope.tidy_empty();

            if ($scope.form.reForm.$valid) {

                //at least 1 relationship
                if (!$scope.entity || !$scope.entity.relationship || $scope.entity.relationship.length == 0) {
                    $scope.error_message = 'At least 1 relationship is required';
                    return false
                }
                return true;
            } else {
                $scope.error_message = 'Form Validation Failed';
                return false;
            }
        };

        $scope.dismiss = function () {
            $uibModalInstance.dismiss();
        };

        // Get all existing vocabularies, in order
        // to be able to provide suggestions.
        api.getVocabularies().
        then(function (data) {
            // See if we are creating, or updating this vocabulary.
            // Easiest way is to see if there is a vocab_id element.
            var vocab_id = $('#vocab_id').val();
            if (vocab_id) {
                // We're updating. Filter out the current vocabulary,
                // so as to disallow self-references.
                $scope.suggestions = data.getVocabulary().filter(
                    function(v) { return v.getId() != vocab_id; }
                );
            } else {
                // We're creating a vocabulary. OK to offer
                // all vocabularies.
                $scope.suggestions = data.getVocabulary();
            }
            // Results come back from the API unsorted, so sort
            // them by title.
            // Need $scope.$apply() to force an update if the dialog
            // appears before the API call returns.
            $scope.$apply(function() {$scope.suggestions.sort(function(a,b) {
                return a.getTitle().localeCompare(b.getTitle());});
            });
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

    }

})();
