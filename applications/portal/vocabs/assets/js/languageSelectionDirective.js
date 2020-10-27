/**
 * Directive for language selection, built on ui-select.
 * @namespace languageSelectionDirective
 */
/*jslint
    browser: true
*/
/*global
    angular
*/
(function () {
    'use strict';

    angular
        .module('app')
        .directive('languageSelection', languageSelectionDirective);

    /** Implementation of the language selection directive.
     * @param $templateCache Injected template cache
     * @param $parse Injected AngularJS parser
     * @memberof languageSelectionDirective
     */
    function languageSelectionDirective($templateCache, $parse) {
        var link = function($scope, $element, attrs) {
            // We provide our own theme "bootstrap-languageSelection",
            // because we need choices.tpl.html to be different from
            // the other instances where we customize the bootstrap
            // templates.

            // In select.tpl.html,
            // <div class="ui-select-container ... dropdown"
            // is changed to
            // <div class="ui-select-container ... dropdown swatch-white"
            $templateCache.put("bootstrap-languageSelection/select.tpl.html","<div class=\"ui-select-container ui-select-bootstrap dropdown swatch-white\" ng-class=\"{open: $select.open}\"><div class=\"ui-select-match\"></div><span ng-show=\"$select.open && $select.refreshing && $select.spinnerEnabled\" class=\"ui-select-refreshing {{$select.spinnerClass}}\"></span> <input type=\"search\" autocomplete=\"off\" tabindex=\"-1\" aria-expanded=\"true\" aria-label=\"{{ $select.baseTitle }}\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" class=\"form-control ui-select-search\" ng-class=\"{ \'ui-select-search-hidden\' : !$select.searchEnabled }\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-show=\"$select.open\"><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");

            // In match.tpl.html,
            // <span ... class="btn btn-default..."
            // is changed to
            // <span ... class="btn btn-primary..."
            $templateCache.put("bootstrap-languageSelection/match.tpl.html","<div class=\"ui-select-match\" ng-hide=\"$select.open && $select.searchEnabled\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\"><span tabindex=\"-1\" class=\"btn btn-primary form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\"><span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}</span> <span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\"></span> <i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\"></i> <a ng-show=\"$select.allowClear && !$select.isEmpty() && ($select.disabled !== true)\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 10px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\"><i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></i></a></span></div>");

            // In choices.tpl.html,
            // An extra <li ...> is inserted to show the "placeholder" text.
            $templateCache.put("bootstrap-languageSelection/choices.tpl.html","<ul class=\"ui-select-choices ui-select-choices-content ui-select-dropdown dropdown-menu\" ng-show=\"$select.open && $select.items.length > 0\"><li ng-show=\"$select.open && $select.search.length > 0\">&nbsp;&nbsp;<i>Make a selection from the list, or press Enter to look up a BCP 47 tag</i></li><li class=\"ui-select-choices-group\" id=\"ui-select-choices-{{ $select.generatedId }}\"><div class=\"divider\" ng-show=\"$select.isGrouped && $index > 0\"></div><div ng-show=\"$select.isGrouped\" class=\"ui-select-choices-group-label dropdown-header\" ng-bind=\"$group.name\"></div><div ng-attr-id=\"ui-select-choices-row-{{ $select.generatedId }}-{{$index}}\" class=\"ui-select-choices-row\" ng-class=\"{active: $select.isActive(this), disabled: $select.isDisabled(this)}\" role=\"option\"><span class=\"ui-select-choices-row-inner\"></span></div></li></ul>");

            // This value is unchanged from
            // bootstrap/no-choice.tpl.html. We need to provide a
            // value for the theme anyway.
            $templateCache.put("bootstrap-languageSelection/no-choice.tpl.html","<ul class=\"ui-select-no-choice dropdown-menu\" ng-show=\"$select.items.length == 0\"><li ng-transclude=\"\"></li></ul>");

            // Require that there be a ng-model attribute.
            if (!attrs.ngModel) {
                // No model.
                return;
            }
            // Container for the ui-select's model.
            $scope.containerModel = {};

            // Now, a way of accessing the model in the parent scope.
            var model = $parse(attrs.ngModel);
            var modelSetter = model.assign;

            // Access the shared language configuration from the
            // parent scope.
            var languagesConfig = $scope.$parent.languagesConfig;
            var customGroup = languagesConfig.customGroup;
            $scope.langList = languagesConfig.languageList;

            // Group information for the ui-select.
            $scope.groupBy = function(item) {
                return item.group;
            }

            // Callback from ui-select when the user types in a value.
            $scope.addNew = function(tag) {
                // Is tag already there?
                var found = $scope.langList.find(function(element) {
                    return element.tag === tag || element.description === tag;
                });
                if (found !== undefined) {
                    // This is a hack to make ui-select accept it:
                    // we return a clone, and add a "cloned"
                    // key, so that ui-select thinks it's different.
                    // Then, in $scope.onSelect, we revert to the value
                    // found.
                    var cloned = angular.copy(found);
                    cloned.cloneOf = found;
                    return cloned;
                }

                $scope.$parent.UtilitiesAPI.parseLanguageTag(tag).then(function(data) {
                    // Canonicalization may mean that we get back a
                    // tag that's already in langList.  So we check if
                    // data.tag is already in langList.  Sample test
                    // data: EN, zh-hak.
                    var found = $scope.langList.find(function(element) {
                        return element.tag === data.tag;
                    });
                    if (found !== undefined) {
                        $scope.$apply(function() {
                            $scope.containerModel.language = found;
                            updateParentModel();
                        });
                        return;
                    }
                    // Not already in langList; make a new entry.
                    var newLang = { 'group': customGroup,
                                    'tag': data.tag,
                                    'description': data.description};
                    $scope.langList.unshift(newLang);
                    // This doesn't work ...
                    //   $select.select(newLang);
                    // ... this does:
                    $scope.$apply(function() {
                        $scope.containerModel.language = newLang;
                        updateParentModel();
                    });
                }, function(response) {
                    // Error response.
                    $scope.$apply(function() {
                        delete $scope.containerModel.language;
                        updateParentModel();
                    });
                    var errorText = ['Unable to resolve tag "' + tag + '":'];
                    if ((response != undefined) && ('response' in response) &&
                        ('body' in response.response) &&
                        ('constraintViolation' in response.response.body)) {
                        angular.forEach(response.response.body.constraintViolation,
                                        function(cv) {
                                            errorText.push(cv.message);
                                        });
                    }
                    $scope.$parent.$apply(function() {
                        $scope.$parent.setLanguageErrors(errorText);
                    });
                });

                var pleaseWait = { 'tag': 'pleaseWait',
                                'description': 'Please wait'};
                return pleaseWait;
            }

            // Callback from ui-select, whenever a value is selected.
            $scope.onSelect = function(item, model) {
                // Check if we just selected an item from the list;
                // see $scope.addNew.
                if ('cloneOf' in item) {
                    // This doesn't work, at least by itself; may need $scope.apply():
                    // $select.select(found);
                    // This _does_ work:
                    $scope.containerModel.language = item.cloneOf;
                }
                updateParentModel();
                $scope.$parent.setLanguageErrors(undefined);
            }

            // Update the parent model when the user has made a
            // change.
            function updateParentModel() {
                if ($scope.containerModel.language == undefined) {
                    modelSetter($scope.$parent, undefined);
                } else {
                    modelSetter($scope.$parent, $scope.containerModel.language.tag);
                }
            }

            // Called whenever the value of the parent model changed.
            function parentModelWasChanged() {
                // Happens, when "the ground shifted under us".
                var newValue = model($scope.$parent);
                var found = $scope.langList.find(function(element) {
                    return element.tag === newValue;
                });
                if (found !== undefined) {
                    $scope.containerModel.language = found;
                } else {
                    // Happens when the user deletes a language
                    // "higher up" in the list of languages, and
                    // we're now on an empty selection.
                    delete $scope.containerModel.language;
                    // Clear any previous "active" selection.
                    // See also the "nasty hack" described below.
                    $scope.selectController.activeIndex = -1;
                }
            }

            // Watcher on the model value in the parent scope, so
            // we get notified if this instance gets "shifted up"
            // by the user deleting an instance "higher up" in the list.
            $scope.$watch(function () { return model($scope.$parent); },
                          function(newValue, oldValue) {
                              if (newValue != oldValue) {
                                  parentModelWasChanged();
                              }
                          });

            // Nasty hack that ensures that on initialization of a
            // brand-new instance with no selection, when you open the
            // dropdown, no value is active. Without this hack, the
            // first option may be "active" already.
            $scope.$watch(function () { return $scope.selectController; },
                          function(newValue, oldValue) {
                              $scope.selectController.tagging.isActivated = true;
                          });

            // Now populate the selection if the parent model
            // value is set.
            if (model($scope.$parent) != undefined) {
                var initialParentModelValue = model($scope.$parent);
                var found = $scope.langList.find(function(element) {
                    return element.tag === initialParentModelValue;
                });
                if (found !== undefined) {
                    $scope.containerModel.language = found;
                }
                // And this is why we can't just have
                // called parentModelWasChanged() ... we can't
                // use the "else" clause at this point,
                // because $scope.selectController hasn't
                // been set yet.
            }

        };

        return {
            restrict: 'E',
            scope: {},
            templateUrl: base_url + 'assets/vocabs/templates/languageSelectionDirective.html',
            link: link
        };
    }

})();
