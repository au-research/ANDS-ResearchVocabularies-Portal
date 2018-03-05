(function () {
    'use strict';

    angular
        .module('app')
        .filter('trustAsHtml', ['$sce', function ($sce) {
            return function (text) {
                var decoded = $('<div/>').html(text).text();
                return $sce.trustAsHtml(decoded);
            }
        }])
        .filter('languageFilter', function ($log) {
            return function (ln, langs) {
                for (var i = 0; i < langs.length; i++) {
                    if (ln == langs[i].value) {
                        return langs[i].text
                    }
                }
                return ln;
            }
        })
        .filter('removeSearchTail', function(){
            return function (text) {
                return text.replace("_search", "");
            }
        })
        .filter('trim', function () {
           return function(text, length) {
               var trimmedString = text.substring(0, length);
               var extension = /(?:.([^.]+))?$/.exec(text)[1];

               if (trimmedString !== text) {
                   trimmedString += ' ...';
                   trimmedString += extension;
               }

               return trimmedString;
           }
        });
    ;
})();