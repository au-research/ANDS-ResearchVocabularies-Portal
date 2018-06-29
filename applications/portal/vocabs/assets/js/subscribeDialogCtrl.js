/**
 * Controller for adding subscriptions.
 * NB: The code currently assumes that email is the only notification mode.
 * If other notification modes are added, the code will need modification.
 */
(function () {
    'use strict';

    angular
        .module('app')
        .controller('subscribeDialogCtrl', subscribeDialogCtrl)
        .controller('subscribeModalCtrl', subscribeModalCtrl);

    /** This controller only has to support opening the modal dialog. */
    function subscribeDialogCtrl($scope, $uibModal) {
        $scope.openDialog = function() {
            var subscribeModal = $uibModal.open({
                templateUrl: base_url +
                    'assets/vocabs/templates/subscribeModal.html',
                controller: 'subscribeModalCtrl',
                size: 'lg',
                windowClass: 'modal-center',
                resolve: {
                    vocabId: function() {
                        return document.querySelector(
                            "meta[property='vocab:id']").
                            getAttribute("content"); },
                    vocabTitle: function() {
                        return document.querySelector(
                            "meta[property='vocab:title']").
                            getAttribute("content"); },
                    vocabOwner: function() {
                        return document.querySelector(
                            "meta[property='vocab:owner']").
                            getAttribute("content"); }
                }
            });
            subscribeModal.result.then(function(obj) {
                // Success
            }, function() {
                // Cancel
            });
        }
    }

    /** This is the controller for the modal dialog. */
    function subscribeModalCtrl($log, $scope, $timeout,
                                $http,
                                $window, $uibModalInstance,
                                vcRecaptchaService,
                                vocabId, vocabTitle, vocabOwner) {

        // Initialise Registry API access.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var defaultClient = VocabularyRegistryApi.ApiClient.instance;
        defaultClient.basePath = registry_api_url;
        // Let the registry know that we are the CMS, and what URL this page is.
        defaultClient.defaultHeaders['portal-id'] =
            'Portal-JS-ManageSubscriptions';
        defaultClient.defaultHeaders['portal-referrer'] = $window.location;
        var ServicesAPI = new VocabularyRegistryApi.ServicesApi();

        // The dialog has two "modes":
        // allowInteraction: The user is being prompted to enter data.
        //     The form is visible.
        // success: The user clicked Subscribe, and the operation completed
        //     succesfully. The form is not visible; only a message
        //     and an "OK" button are visible.
        $scope.allowInteraction = true;
        $scope.success = false;

        // Make vocabulary metadata available for the template.
        $scope.vocabId = vocabId;
        $scope.vocabTitle = vocabTitle;
        $scope.vocabOwner = vocabOwner;

        // The form object is used to encapsulate various "one-off"
        // model elements in the form that have primitive values
        // (e.g., of boolean type), as AngularJS won't otherwise let us
        // access them as model values in nested scopes by a
        // "raw" name. E.g., when nested inside an element that has
        // an ng-if attribute, ng-model="subscribeSystem"
        // doesn't work, but ng-model="form.subscribeSystem"
        // does work.
        $scope.form = {};
        // The radio button has the vocabulary option selected by default.
        $scope.form.subscribeRadio = 'vocabulary';
        $scope.form.subscribeSystem = false;
        $scope.form.subscriberEmail = '';

        // Model for the public key for reCAPTCHA.
        $scope.reCAPTCHA = {
            key: recaptcha_site_key
        }
        // The reCAPTCHA widget Id, and the response.
        var reCAPTCHAWidgetId = null;
        var reCAPTCHAResponse = null;
        $scope.showReCAPTCHA = true;

        // Dismiss the modal by clicking the "x" button.
        $scope.dismiss = function () {
            $uibModalInstance.dismiss();
        };

        // Dismiss the modal by clicking the "OK" button.
        $scope.close = function () {
            $uibModalInstance.close();
        };

        /** Is a subscription type selected? Used to enable/disable
         * the "Subscribe" button.
         */
        $scope.anyChecked = function() {
            // Don't need to check subscriberEmail, as that is
            // explicitly required by the ng-disabled attribute.
            if ($scope.form.subscribeRadio !== '') return true;
            if ($scope.form.subscribeSystem) return true;
            return false;
        }

        // Set $scope.loading in response to the user clicking a button
        // to request an action (i.e., from the API). It disables
        // the button(s) on the form.
        $scope.loading = false;

        /** Accept the widget Id from reCAPTCHA. */
        $scope.setReCAPTCHAWidgetId = function(widgetId) {
            reCAPTCHAWidgetId = widgetId;
        }

        /** Accept the response from reCAPTCHA. */
        $scope.setReCAPTCHAResponse = function(response) {
            reCAPTCHAResponse = response;
            checkReCAPTCHAResponse();
        }

        $scope.expireReCAPTCHA = function() {
            reCAPTCHAResponse = null;
        }

        /** Implementation of the "Subscribe" button. Do reCAPTCHA check. */
        $scope.clickSubscribe = function() {
            if ($scope.form.subscriberEmail == undefined ||
                $scope.form.subscriberEmail == '') {
                alert('Empty email address');
                return;
            }
            $scope.loading = true;
            if (reCAPTCHAResponse == null) {
                vcRecaptchaService.execute(reCAPTCHAWidgetId);
            } else {
                checkReCAPTCHAResponse();
            }
        }

        /** Send reCAPTCHA for validation. On success, do the subscription. */
        var checkReCAPTCHAResponse = function() {
            $http.post(base_url + 'vocabs/checkReCAPTCHA',
                       {'recaptcha' : reCAPTCHAResponse}).
                then(function(response) {
                    if (response.data.status == 'OK') {
                        doSubscribe();
                    } else {
                        alert('Unable to validate reCAPTCHA.');
                    }
                });
        }

        /** Invoke the API methods to do the requested subscriptions. */
        var doSubscribe = function() {
            var promises = [];
            switch ($scope.form.subscribeRadio) {
            case 'vocabulary':
                promises.push(ServicesAPI.createEmailSubscriptionVocabulary(
                    vocabId, $scope.form.subscriberEmail));
                break;
            case 'thisOwner':
                promises.push(ServicesAPI.createEmailSubscriptionOwner(
                    vocabOwner, $scope.form.subscriberEmail));
                break;
            case 'allOwners':
                promises.push(ServicesAPI.createEmailSubscriptionOwner(
                    '*', $scope.form.subscriberEmail));
                break;
            default:
                break;
            }
            // System subscription, if selected.
            if ($scope.form.subscribeSystem) {
                promises.push(ServicesAPI.createEmailSubscriptionSystem(
                    $scope.form.subscriberEmail));
            }
            // Wait for all to complete.
            Promise.all(promises).then(function(values) {
                console.log('success');
                console.log(values);
                $scope.loading = false;
                $scope.allowInteraction = false;
                $scope.success = true;
            }, function(values) {
                console.log('Failure of one of the API calls');
                console.log(values);
                alert('Unable to complete subscription due to a ' +
                      'network error.');
                $scope.loading = false;
            }).finally(function() {
                // Force updating of the model.
                $scope.$apply();
            });
        }

    }

})();