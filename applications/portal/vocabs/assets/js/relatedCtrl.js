(function () {
    'use strict';

    angular
        .module('app')
        .controller('relatedCtrl', relatedCtrl);

    function relatedCtrl($scope, $uibModalInstance, $log, $timeout,
                         $templateCache,
                         entity, type, user_orgs, confluenceTip) {
        $log.debug("Related Modal", entity, user_orgs);
        // Make the modal dialog (at least, temporarily) movable,
        // to be consistent with the version modal (which was
        // as per request in SD-11572, CC-2050).
        $timeout(function() {
            $('.modal-content').draggable({ revert: true });
        });
        // Set up access to the Registry API.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var api = new VocabularyRegistryApi.ResourcesApi();

        /* Define all the relationships, per type. The "types" value
           is an array of the types for which this relation is valid.
           For now, only "hasAssociationWith" has more than one supported
           type. */
        $scope.allRelatedEntityRelations = [
            {"value": "publishedBy", "text": "Publisher", "types": ["party"]},
            {"value": "hasAuthor", "text": "Author", "types": ["party"]},
            {"value": "hasContributor", "text": "Contributor",
             "types": ["party"]},
            {"value": "pointOfContact", "text": "Point of contact",
             "types": ["party"]},
            {"value": "implementedBy", "text": "Implementer",
             "types": ["party"]},
            {"value": "consumerOf", "text": "Consumer", "types": ["party"]},
            {"value": "hasAssociationWith", "text": "Associated with",
             "types": ["service", "vocabulary"]},
            {"value": "isPresentedBy", "text": "Presented by",
             "types": ["service"]},
            {"value": "isUsedBy", "text": "Used by", "types": ["service"]},
            {"value": "isDerivedFrom", "text": "Derived from",
             "types": ["vocabulary"]},
            {"value": "enriches", "text": "Enriches", "types": ["vocabulary"]},
            {"value": "isPartOf", "text": "Part of", "types": ["vocabulary"]}
        ];

        /* Regular expression for URLs and PURLs. Based on what comes with AngularJS. */
        var URL_REGEXP = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i;
        var PURL_REGEXP = /^https?:\/\/purl.org\/(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i;

        /* Define all the related entity identifier types. */
        var ite = VocabularyRegistryApi.RelatedEntityIdentifier.
            IdentifierTypeEnum;
        $scope.rei_types = [
            {"id": ite.auAnlPeau, "label": "AU-ANL:PEAU",
             "placeholder": "nla.party-12345",
             "validate": /^nla\.party-\d+$/},
            {"id": ite.doi, "label": "DOI",
             "placeholder": "10.12345",
             "validate": /^10\../},
            {"id": ite.handle, "label": "Handle",
             "placeholder": "123.456/abc",
             "validate": /^\d.*\/./},
            {"id": ite.infouri, "label": "InfoURI",
             "placeholder": "info:abc",
             "validate": /^info:./},
            {"id": ite.isil, "label": "ISIL",
             "placeholder": "DK-710100",
             "validate":
               /^([A-Z]{2}|[A-Za-z]|[A-Za-z]{3,4})-[A-Za-z0-9:/-]{1,11}$/},
            {"id": ite.isni, "label": "ISNI",
             "placeholder": "000000012150090X",
             "validate": /^\d{15}[\dX]$/},
            {"id": ite.local, "label": "Local",
             "placeholder": "ABC 123",
             "validate": /^/},
            {"id": ite.orcid, "label": "OrcID",
             "placeholder": "0000-0002-1825-0097",
             "validate": /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/},
            {"id": ite.purl, "label": "Purl",
             "placeholder": "http://purl.org/my-identifier",
             "validate": PURL_REGEXP},
            {"id": ite.researcherID, "label": "Researcher ID",
             "placeholder": "A-1009-2008",
             "validate": /^[A-Z]{1,3}-[1-9][0-9]{3}-[0-9]{4}$/},
            {"id": ite.uri, "label": "URI",
             "placeholder": "http://my.url/123",
             "validate": URL_REGEXP},
            {"id": ite.viaf, "label": "VIAF",
             "placeholder": "49224511",
             "validate": /^[1-9]\d(\d{0,7}|\d{17,20})$/}
        ];

        /** A list of the multi-valued elements that are the elements
            of $scope.entity. Useful when iterating over all of these. */
        $scope.multi_valued_lists = [ 'relationship', 'identifiers', 'urls' ];

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

        $scope.relatedEntityTypes = ['publisher', 'vocabulary', 'service'];
        $scope.entity = false;
        // "Intent" is derived from what the user did on the main CMS page.
        // If they clicked "Add", then the intent is "add".
        // If they clicked a related entity title already in the list
        // in the "Related" section of the CMS page, then the intent is "save".
        $scope.intent = 'add';
        $scope.type = type;
        // Maybe comment-out next line for production; uncomment as needed
        // for debugging.
        $scope.user_orgs = user_orgs;
        $scope.confluenceTip = confluenceTip;

        /* True, if we are allowing the user to edit the email, phone
         * etc. metadata, because this user "owns" the related entity.
         * False, if we are using a related entity "owned" by someone
         * else. */

        if (entity) {
            // Note that we make a copy. This is because the existing item
            // will appear as the first entry in the Title dropdown.
            // If the user makes a different selection from the dropdown,
            // then comes back to the dropdown and clicks the first item,
            // we can restore the original values. (See the other instance
            // of angular.copy(entity) in the populate() method below.)
            $scope.entity = angular.copy(entity);
            $scope.intent = 'save';
            // This is an edit operation, so work out if edits should
            // be enabled. They should be enabled if either:
            // (a) this RE was newly-created in the same edit session
            // (in which case, there is no owner defined), or (b) this
            // is an existing RE, and our organisational roles give us
            // permission to modify it.
            $scope.allowEdits = !('owner' in $scope.entity) ||
                    $scope.user_orgs.indexOf($scope.entity.owner) >= 0;
        } else {
            // Ensure minimum details to enable the form to work.
            $scope.entity = {};
            $scope.ensure_all_minimal_lists();
            // This is a new entity, so enable editing.
            $scope.allowEdits = true;
        }

        /* Please note behaviour here. Magic value for type
           "publisher": this sets up a relationship in which
           the type is in fact "party'. */
        if ($scope.type == "publisher") {
            $scope.type = 'party';
            $scope.entity = {
                'relationship': ['publishedBy']
            }
            $scope.ensure_all_minimal_lists();
        }

        $scope.inputReady = true;

        /* Filter the entity relations based on type. */
        $scope.getRelation = function() {
            return $scope.allRelatedEntityRelations.filter(
                function(rel) { return rel.types.indexOf($scope.type) != -1; }
            );
        }

        /* Set valid relations for this type. Note that this statement
           must occur _after_ the preceding "if" statement because
           of the treatment of type="publisher". */
        $scope.relatedEntityRelations = $scope.getRelation();

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
            $scope.inputReady = !$scope.inputReady;

            $log.debug("Populating with", item);

            if (item === undefined) {
                // Type-in name. In this case, leave the fields,
                // but _do_ remove the owner, and allow editing.
                // Hmm, this code was in play during early development, but
                // now I'm not sure if it can be reached.
                if ($scope.entity instanceof
                        VocabularyRegistryApi.RelatedEntity) {
                    $scope.entity.setId(null);
                    $scope.entity.setOwner(null);
                } else {
                    delete $scope.entity.id;
                    delete $scope.entity.owner;
                }
                return;
            }
            if (!('id' in item)) {
                // User has confirmed a title they typed in, rather
                // than selecting from the dropdown.
                $scope.entity.title = item.title;
                delete $scope.entity.id;
                delete $scope.entity.owner;
                $scope.allowEdits = true;
                return;
            }
            if (item.id === undefined) {
                // We are coming back to editing an RE that the user
                // has created/saved in this edit session.
                // The user has now clicked on the title of this RE,
                // as it appears as the first item
                // in the dropdown. Restore the original values.
                $scope.entity = angular.copy(entity);
                $scope.allowEdits = true;
                return;
            }
            $scope.entity.owner = item.getOwner();
            // Use owner to determine if edits are allowed.
            $scope.allowEdits = !('owner' in $scope.entity) ||
                $scope.user_orgs.indexOf($scope.entity.owner) != -1;

            $scope.entity.title = item.getTitle();
            $scope.entity.email = item.getEmail();
            $scope.entity.phone = item.getPhone();
            // This is a pre-existing RE, so we have an ID. Keep track of it.
            // (We also do this for identifiers below.)
            $scope.entity.id = item.getId();

            $scope.entity.urls = [];
            angular.forEach(item.getUrl(), function(url) {
                $scope.entity.urls.push({'url' : url});
            });

            api.getRelatedEntityById(item.getId()).
            then(function (data) {
                $scope.entity.identifiers = [];
                angular.forEach(data.getRelatedEntityIdentifier(),
                        function(rei) {
                            $scope.entity.identifiers.push({
                                'id': rei.getId(),
                                'rei_type': rei.getIdentifierType(),
                                'rei_value': rei.getIdentifierValue()
                            });
                });
                // Having added identifiers, need to inform AngularJS
                // that we changed the model. In this case, only need
                // to refresh _this_ scope; no need to go to $rootScope().
                // This can be done with $digest().
                $scope.$digest();
            });
        };

        // Callback from ui-select, when the user has confirmed a title, but
        // not selected from the dropdown, thus requesting the creation
        // of a new related entity.
        $scope.addNew = function (title) {
            // Preserve any fields the user has already filled in ...
            var entity = angular.copy($scope.entity);
            // except for id and owner.
            delete entity.id;
            delete entity.owner;
            entity.title = title;
            return entity;
        };

        // Unlock to allow editing. This will mean the creation of a
        // new related entity. To force this to happen, remove the
        // id and owner settings.
        $scope.unlock = function() {
            $scope.allowEdits = true;
            delete $scope.entity.id;
            delete $scope.entity.owner;
        };


        $scope.list_add = function (type, obj) {
            if (type == 'identifiers') {
                obj = {};
            } else if (type == 'urls') {
                obj = {url: ''};
            }
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
            $scope.entity.identifiers = $scope.entity.identifiers.filter(
                    function(ident) {
                        return (ident != null) && (ident.rei_type);
                    });
            $scope.entity.urls = $scope.entity.urls.filter(function(url) {
                return (url != null) && (url.url);
            });
        };

        $scope.save = function () {
            if ($scope.validateEntity()) {
                $scope.entity.type = $scope.type;
                var ret = {
                    'intent': $scope.intent,
                    'data': $scope.entity
                };

                // TODO: handle related entity update and creation before closing
                // TODO: Migrate creation and updating of re here
                $uibModalInstance.close(ret);
            } else {
                // Put back the multi-value lists ready for more editing.
                $scope.ensure_all_minimal_lists();
                return false;
            }
        };

        $scope.validateEntity = function () {
            delete $scope.error_message;

            // Tidy up empty fields before validation.
            $scope.ensure_all_minimal_lists();
            $scope.tidy_empty();

            if ($scope.form.reForm.$valid) {

                if (!$scope.entity || !$scope.entity.title ) {
                    $scope.error_message = 'Title is required';
                    return false;
                }

                //at least 1 relationship
                if (!$scope.entity || !$scope.entity.relationship || $scope.entity.relationship.length == 0) {
                    $scope.error_message = 'At least 1 relationship is required';
                    return false;
                }

                //at least 1 identifier, changed CC-1257, identifier no longer required
                // if (!$scope.entity || !$scope.entity.identifiers || $scope.entity.identifiers.length == 0) {
                //     $scope.error_message = 'At least 1 identifier is required';
                //     return false
                // }


                return true;
            } else {
                $scope.error_message = 'Form Validation Failed';
                return false;
            }
        };

        $scope.dismiss = function () {
            $uibModalInstance.dismiss();
        };

        // Get all existing related entities of the same type, in order
        // to be able to provide suggestions.
        api.getRelatedEntities({"relatedEntityType" : $scope.type}).
        then(function (data) {
            var suggestions = data.getRelatedEntity();
            $scope.suggestions = angular.copy(suggestions);
            // Results come back from the API unsorted, so sort
            // them by title.
            // Need $scope.$apply() to force an update if the dialog
            // appears before the API call returns.
            $scope.suggestions.sort(function(a,b) {
                return a.getTitle().localeCompare(b.getTitle());});
            if (('title' in $scope.entity) && !('id' in $scope.entity)) {
                // We are now coming back to editing something that the user
                // has created in the same edit session. Create a
                // dummy RelatedEntity object and stick it at the front
                // of the suggestions.
                var entity = new VocabularyRegistryApi.RelatedEntity();
                entity.setTitle($scope.entity.title);
                entity.setOwner("You");
//                entity.setEmail(entity.email);
//                entity.setPhone(entity.phone);
                $scope.suggestions.unshift(entity);
                $scope.selected = entity;
//                alert('Id: ' + $scope.entity.id);
            } else if ('id' in $scope.entity) {
                // We are editing an existing RE. Find the selected
                // RE among the suggestions.
                $scope.selected = $scope.suggestions.find(
                        function(element) {
                            return element.id == $scope.entity.id;
                        });
            }
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
