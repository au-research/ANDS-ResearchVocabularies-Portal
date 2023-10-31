/* Use this directive in conjunction with the url input type.
   E.g.:
   <input id="newValueApUri" type="url"
          url-better-validation required name="uri"
          class="form-control"
          placeholder="URI"
          ng-model="newValue.ap.uri">
*/
(function () {
    'use strict';

    angular
        .module('app')
        .directive('urlBetterValidation', urlBetterValidation);

    function urlBetterValidation() {
        // For reference, the off-the-shelf AngularJS validator
        // regular expression is:
        // var URL_REGEXP = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i;

        // https://gist.github.com/dperini/729294
        // Regular Expression for URL validation
        //
        // Author: Diego Perini
        // Created: 2010/12/05
        // Updated: 2018/09/12
        // License: MIT
        //
        // Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)
        //
        // Permission is hereby granted, free of charge, to any person
        // obtaining a copy of this software and associated documentation
        // files (the "Software"), to deal in the Software without
        // restriction, including without limitation the rights to use,
        // copy, modify, merge, publish, distribute, sublicense, and/or sell
        // copies of the Software, and to permit persons to whom the
        // Software is furnished to do so, subject to the following
        // conditions:
        //
        // The above copyright notice and this permission notice shall be
        // included in all copies or substantial portions of the Software.
        var RE_WEBURL = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

        return {
            require: '?ngModel',
            link: function(scope, elm, attrs, ctrl) {
                // only apply the validator if ngModel is present and AngularJS has added the url validator
                if (ctrl && ctrl.$validators.url) {

                    // this will overwrite the default AngularJS url validator
                    ctrl.$validators.url = function(modelValue, viewValue) {
                        var value = modelValue || viewValue;
                        if (ctrl.$isEmpty(value)) {
                            return true;
                        }
                        try {
                            new URL(value);
                            return RE_WEBURL.test(value);
                        } catch (e) {
                            return false;
                        }
                    };
                }
            }
        };
    }

})();
