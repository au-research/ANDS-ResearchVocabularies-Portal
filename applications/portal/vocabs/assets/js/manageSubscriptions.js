/**
 * Controller for managing subscriptions.
 * NB: The code currently assumes that email is the only notification mode.
 * If other notification modes are added, the code will need modification.
 */
(function () {
    'use strict';

    angular
        .module('app')
        .controller('manageSubscriptions', manageSubscriptionsCtrl);

    function manageSubscriptionsCtrl($log, $scope, $timeout,
                                     $window, $uibModal) {

        // Initialise Registry API access.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var defaultClient = VocabularyRegistryApi.ApiClient.instance;
        defaultClient.basePath = registry_api_url;
        // Let the registry know that we are the CMS, and what URL this page is.
        defaultClient.defaultHeaders['portal-id'] =
            'Portal-JS-ManageSubscriptions';
        defaultClient.defaultHeaders['portal-referrer'] = $window.location;
        var ServicesAPI = new VocabularyRegistryApi.ServicesApi();

        // The form object is used to encapsulate various "one-off"
        // model elements in the form that have primitive values
        // (e.g., of boolean type), as AngularJS won't otherwise let us
        // access them as model values in nested scopes by a
        // "raw" name. E.g., when nested inside an element that has
        // an ng-if attribute, ng-model="ownerAllSubscriptionUnsubscribe"
        // doesn't work, but ng-model="form.ownerAllSubscriptionUnsubscribe"
        // does work.
        $scope.form = {};

        $scope.authenticationOK = false;
        $scope.authenticationError = false;

        // Collect all the subscriber's subscriptions.
        ServicesAPI.getEmailSubscriptions(token).then(function(data) {
            $log.debug("Subscription data fetched", data);
            $scope.authenticationOK = true;
            unpackData(data);
        }, function(data) {
            $log.debug("Subscription data not fetched", data);
            if (data && data.response && data.response.body &&
                data.response.body.message &&
                data.response.body.message === "Not authenticated") {
                $scope.errorMessage = "Invalid subscriber token.";
            } else {
                $scope.errorMessage = "Registry returned an error.";
            }
            $scope.authenticationError = true;
        }).finally(function() {
            // Either on success or failure, force a model
            // refresh. Without this, the page does not get updated.
            $scope.$apply();
        });

        // Whether the subscriber has any subscription at all.
        $scope.hasAnySubscription = false;

        // Whether the subscriber has a subscription to system
        // notifications.
        $scope.hasSystemSubscription = false;
        // Model for checkbox to unsubscribe to system notifications.
        $scope.form.systemSubscriptionUnsubscribe = false;

        // Whether the subscriber has a subscription to the special
        // owner "*", meaning all owners.
        $scope.hasOwnerAllSubscription = false;
        // Model for checkbox to unsubscribe from owner "*".
        $scope.form.ownerAllSubscriptionUnsubscribe = false;

        // Model for the checkbox for "Select All" vocabularies.
        $scope.form.vocabulariesSelectAll = false;
        // Model for the checkbox for "Select All" owners.
        $scope.form.ownersSelectAll = false;

        // List of owner subscriptions.
        // Elements are objects:
        // { id: owner Id,
        //   title: owner full name,
        //   checked: model for checkbox }
        $scope.ownerSubscriptions = [];

        // List of vocabulary subscriptions.
        // Elements are objects:
        // { id: vocabulary Id,
        //   title: vocabulary title,
        //   checked: model for checkbox }
        $scope.vocabularySubscriptions = [];

        /* Unpack the subscription data that came back from
           the Registry. */
        var unpackData = function(data) {
            var elementTypeEnum = VocabularyRegistryApi.Subscription.
                ElementTypeEnum;
            if (data.getSubscription().length > 0) {
                $scope.hasAnySubscription = true;
            }
            data.getSubscription().forEach(function(subscription) {
                switch (subscription.getElementType()) {
                case elementTypeEnum.vocabulary:
                    $scope.vocabularySubscriptions.push({
                        'id': subscription.getElementId(),
                        'title': subscription.getTitle(),
                        'checked': false
                    });
                    break;
                case elementTypeEnum.owner:
                    if (subscription.getElementId() === '*') {
                        $scope.hasOwnerAllSubscription = true;
                    } else {
                        $scope.ownerSubscriptions.push({
                            'id': subscription.getElementId(),
                            'title': subscription.getTitle(),
                            'checked': false
                        });
                    }
                    break;
                case elementTypeEnum.system:
                    $scope.hasSystemSubscription = true;
                    break;
                default:
                    $log.debug("Unknown element type" +
                               subscription.getElementType());
                }
            });
            // Now sort $scope.vocabularySubscriptions and
            // $scope.ownerSubscriptions by title.
            var compare = function(a,b) {
                var titleA = a.title.toUpperCase();
                var titleB = b.title.toUpperCase();
                if (titleA < titleB) {
                    return -1;
                }
                if (titleA > titleB) {
                    return 1;
                }
                // titles must be equal
                return 0;
            };
            $scope.vocabularySubscriptions.sort(compare);
            $scope.ownerSubscriptions.sort(compare);
        }

        /** Utility to examine a subscription to get its "checked" value.
         * Used by $scope.anyChecked.
         */
        var isChecked = function(subscription) {
            return subscription.checked;
        }

        /** Are any checkboxes checked? Used to enable/disable
         * the "Unsubscribe" button.
         */
        $scope.anyChecked = function() {
            if ($scope.form.systemSubscriptionUnsubscribe) return true;
            if ($scope.form.ownerAllSubscriptionUnsubscribe) return true;
            if ($scope.vocabularySubscriptions.some(isChecked)) return true;
            if ($scope.ownerSubscriptions.some(isChecked)) return true;
            return false;
        }

        /** Implementation of the "Select All" button for vocabularies. */
        $scope.toggleSelectAllVocabularies = function() {
            angular.forEach($scope.vocabularySubscriptions,
                            function(subscription) {
                                subscription.checked =
                                    $scope.form.vocabulariesSelectAll;
                            });
        }

        /** Implementation of the "Select All" button for owners. */
        $scope.toggleSelectAllOwners = function() {
            angular.forEach($scope.ownerSubscriptions, function(subscription) {
                subscription.checked = $scope.form.ownersSelectAll;
            });
            // And special treatment for the "all owners" button, _if_
            // the subscriber has such a subscription.
            if ($scope.hasOwnerAllSubscription) {
                $scope.form.ownerAllSubscriptionUnsubscribe =
                    $scope.form.ownersSelectAll;
            }
        }

        // Set $scope.loading in response to the user clicking a button
        // to request an action (i.e., from the API). It disables
        // the button(s) on the form.
        $scope.loading = false;

        /** Implementation of the "Unsubscribe" button. */
        $scope.unsubscribe = function() {
            $scope.loading = true;
            var promises = [];
            // System subscription, if selected
            if ($scope.form.systemSubscriptionUnsubscribe) {
                promises.push(ServicesAPI.deleteEmailSubscriptionSystem(token));
            }
            // All selected vocabulary subscriptions
            angular.forEach($scope.vocabularySubscriptions,
                function(subscription) {
                    if (subscription.checked) {
                        promises.push(ServicesAPI.
                                      deleteEmailSubscriptionVocabulary(
                                          token, subscription.id));
                    }
                });
            // All selected owner subscriptions
            angular.forEach($scope.ownerSubscriptions,
                function(subscription) {
                    if (subscription.checked) {
                        promises.push(ServicesAPI.
                                      deleteEmailSubscriptionOwner(
                                          token, subscription.id));
                    }
                });
            // Owner = *, if selected
            if ($scope.form.ownerAllSubscriptionUnsubscribe) {
                promises.push(ServicesAPI.deleteEmailSubscriptionOwner(
                    token, '*'));
            }
            // Wait for all to complete.
            Promise.all(promises).then(function(values) {
                console.log('success');
                console.log(values);
                alert('You have successfully been unsubscribed.');
                $window.location.reload();
            }, function(values) {
                console.log('Failure of one of the API calls');
                console.log(values);
                alert('Unable to complete unsubscription due to a ' +
                      'network error.');
                $window.location.reload();
            }).finally(function() {
                $scope.loading = false;
                // Force the setting of $scope.loading to be visible.
                $scope.$apply();
            });
        }

    }

})();
