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
        .filter('processSolrHighlight', ['$sce', function($sce) {
            return function(text) {
                // Special filter for processing the result
                // of Solr highlighting.
                if (text) {
                    // Escape any HTML entities, then put bold tags around
                    // highlighted content.
                    // NB: The strings "HL_START" and "HL_END" must
                    // match the values of the constants HIGHLIGHT_PRE
                    // and HIGHLIGHT_POST defined in the Registry's
                    // SearchIndex method!
                    return $sce.trustAsHtml(text.
                                            replace(/&/g, '&amp;').
                                            replace(/</g, '&lt;').
                                            replace(/>/g, '&gt;').
                                            replace(/HL_START/g, '<b>').
                                            replace(/HL_END/g, '</b>'));
                }
                return '';
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
        .filter('stringToArray', function(){
            // Used by the search controller to support iterating over
            // _either_ an array or just one string. (We want to
            // treat a string value as a one-element array.)
            return function (text) {
                if (typeof text == 'string') {
                    return [ text ];
                }
                return text;
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
