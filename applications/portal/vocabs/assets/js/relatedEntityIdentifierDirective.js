/**
 * Implementation of the "related-entity-identifier-directive" attribute,
 * used for related entity identifier entry on the vocabs CMS page.
 */
(function () {
    'use strict';

    angular
        .module('app')
        .directive('relatedEntityIdentifierDirective',
                relatedEntityIdentifierDirective);

    function relatedEntityIdentifierDirective()
    {
        return {
            restrict: 'AE',
            require: '^form',
            priority: 99,
            scope: {
                // Isolated scope. The following are visible in
                // the local scope.
                editingDisabled: '=ngDisabled',
                reiType: '=',
                reiValue: '=',
                index: '=',
                close: '&onClose'
            },
            templateUrl: (base_url
                          + 'assets/vocabs/templates/relatedEntityIdentifierDirective.html'),
            link: function (scope, elem, iAttrs, form) {
                scope.form = form;
                // See relatedCtrl.js for a description of the format
                // of rei_types.
                // This gives us a shortcut to the (shared) value
                // from the parent scope.
                // NB: This is used in relatedEntityIdentifierDirective.html to
                // populate the identifier type dropdown!
                scope.rei_types = scope.$parent.rei_types;

                // Invoke this after a change to the parent scope's
                // identifiers setting, e.g., after a deletion.
                // This forces an update of the dropdown.
                scope.setSelected = function() {
                    var oldSelected = scope.selected;
                    scope.selected = undefined;
                    scope.reiPattern = /^/;
                    for (var v in scope.rei_types) {
                        if (scope.rei_types[v].id ===
                            scope.reiType) {
                            scope.selected = scope.rei_types[v];
                            scope.reiPattern = scope.selected.validate;
                            break;
                        }
                    }
                }
                // And call it now, to set selected.
                scope.setSelected();


                // The model for the type dropdown
                // is "selected", not "reiType".
                // So we need to set the type explicitly after making
                // a selection from the dropdown.
                scope.setType = function() {
                    if (scope.selected == null) {
                        // User set the dropdown back to the placeholder.
                        scope.reiType = '';
                        scope.reiPattern = '';
                    } else {
                        scope.reiType = scope.selected.id;
                        scope.reiPattern = scope.selected.validate;
                    }
                }

                // And conversely, set a watch on the reiType value
                // to update scope.selected.
                scope.$watch('reiType', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        scope.setSelected();
                    }
                });

                // Locate the type dropdown.
                var reiTypeInput = $(elem).find('.rei-type');
                // And set a watch on it.
                reiTypeInput.on(
                    "change",
                    function (e) {
                        // Wipe out any existing label. Note use of
                        // $apply to make sure AngularJS notices the
                        // changes to model values.
                        scope.$apply(
                            function () {
                                scope.reiValue = '';
                            });
                    }
                );

                scope.invalid = function() {
                    return scope.form['rei_value_name_'+scope.index].$invalid;
                }

            }
        }
    }
})();
