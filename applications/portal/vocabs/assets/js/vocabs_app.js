/*global location, $, angular, base_url */
(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngSanitize', 'ui.bootstrap',
                        'ui.utils', 'angular-loading-bar', 'ngFileUpload',
                        'ui.select', 'ui.tinymce', 'vcRecaptcha'
                       ])
        .config(
            function ($interpolateProvider, $locationProvider, $logProvider) {
                $interpolateProvider.startSymbol('[[');
                $interpolateProvider.endSymbol(']]');
                $locationProvider.hashPrefix('!');
                $logProvider.debugEnabled(true);
            }
        );
})();


$(document).ready(
    function () {
        $("#widget-info").hide();
        if ($("#widget-info").length == 0) {
            $("#widget-link").hide();
        }

        $("#widget-toggle").click(
            function () {
                if ($("#widget-info").is(":visible")) {
                    $("#widget-toggle").text("Show code");
                } else {
                    $("#widget-toggle").text("Hide code");
                }

                $("#widget-info").slideToggle("slow");
            }
        );
        var caretRightElements = $('h4').children('.fa-caret-right');
        // The right/down carets all start out hidden, which
        // is correct if there is only one version.
        // If there is more than one version, show the
        // appropriate carets (triangles): pointing down for the
        // first version, pointing right for all others.
        if (caretRightElements.length > 1) {
            // Only do this if there is more than one version
            // being displayed.
            $($('h4').children('.fa-caret-down')[0]).show();
            caretRightElements.each(
                function (index) {
                    if (index != 0) {
                        $(this).show();
                    }
                }
            );
        }
    }
);

// Richard's note: I think this next statement has no effect,
// because it is not inside the document ready() above.
// The second and later versions are hidden in the first
// case by the blade HTML itself.
$('.box-content:not(:first-child)').hide();

$(document).on(
    'click',
    '.box-title',
    function (event) {
        var this_element = $(this);
        var box          = this_element.siblings('.box-content');
        if (box.is(":visible")) {
            return false;
        }

        // console.log(this_element.siblings('.box-content').length);
        $('.box-content:visible').slideUp('fast');
        this_element.siblings('.box-content').slideToggle('fast');
        // Now do the little carets next to version titles
        // to guide the user.
        // Nota bene: if we reached this point, there is more
        // than one version, so some little carets
        // _are_ already visible, and it is OK to be
        // showing/hiding them. (Cf. the case where there
        // is only one version, in which case all carets should
        // remain hidden.)
        var all_caret_right = $('h4').children('.fa-caret-right');
        var all_caret_down  = $('h4').children('.fa-caret-down');
        all_caret_right.show();
        all_caret_down.hide();
        var box_caret_right = this_element.children('h4').
        children('.fa-caret-right');
        var box_caret_down  = this_element.children('h4').
        children('.fa-caret-down');
        box_caret_right.hide();
        box_caret_down.show();
        return undefined;
    }
);

$(document).on(
    'mouseover',
    'a[tip]',
    function (event) {
        $(this).qtip(
            {
                content: {
                    text: function (e, api) {
                        var tip     = $(this).attr('tip');
                        var content = tip;
                        if (tip.indexOf('#') == 0 || tip.indexOf('.') == 0) {
                            if ($(tip.toString()).length) {
                                content = $(tip.toString()).html();
                            }
                        }

                        return content;
                    }
                },
                show: {
                    event: 'mouseover, click',
                    ready: true
                },
                hide: {
                    delay: 1000,
                    fixed: true
                },
                position: {
                    target: 'mouse',
                    adjust: {
                        mouse: false,
                        method: 'shift'
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap'
                }
            }
        );
    }
);

$(document).on(
    'mouseover',
    'a[concept-tip]',
    function (event) {
        $('.qtip').each(
            function () {
                $(this).data('qtip').destroy();
            }
        );
        $(this).qtip(
            {
                content: {
                    text: function (e, api) {
                        var tip     = $(this).attr('concept-tip');
                        var content = tip;
                        if (tip.indexOf('#') == 0 || tip.indexOf('.') == 0) {
                            if ($(tip.toString()).length) {
                                content = $(tip.toString()).html();
                            }
                        }

                        return content;
                    }
                },
                show: {
                    event: 'mouseover',
                    ready: true
                },
                hide: {
                    delay: 500,
                    leave: false,
                    fixed: true
                },
                position: {
                    target: this,
                    my: 'center left',
                    at: 'center right',
                    adjust: {
                        mouse: false,
                        screen: false,
                        resize: false
                    }
                },
                style: {
                    classes: 'qtip-rounded qtip-blue concept-tip'
                }
            }
        );
    }
);

$(document).on(
    'click',
    '.download-chooser',
    function (event) {
        event.preventDefault();
        $(this).qtip(
            {
                show: {
                    event: event.type,
                    ready: 'true'
                },
                hide: {
                    delay: 1000,
                    fixed: true
                },
                content: {
                    text: function (event, api) {
                        var box     = $(this).parents('.box-content');
                        var content = $('.download-content', box);
                        return content.html();
                    }
                },
                position: {
                    my: 'center left',
                    at: 'center right',
                    adjust: {
                        mouse: false
                    }
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap'
                }
            },
            event
        );
    }
).on(
    'click',
    '.showsp',
    function (event) {
            event.preventDefault();
            $(this).hide();
            var box     = $(this).parents('.box-content');
            var content = $('.sp', box);
            content.slideDown('fast');
    }
);

/* Display tooltips where the content comes from a Confluence page
   structured in a particular way. The content of the confluence_tip
   attribute is the name of an anchor into the already-loaded content.
   But (because of the way Confluence positions anchors) we have to navigate
   to get to the "real" beginning of the content. (See repeated calls to
   parent() and next().)
   Note use of adjust method shift which helps dealing with the larger tooltips.
*/
$(document).on(
    'mouseover',
    'span[confluence_tip]',
    function (event) {
        $(this).qtip(
            {
                content: {
                    text: function (e, api) {
                        var tip     = $(this).attr('confluence_tip');
                        var content = tip;
                        if ($('h2[id="' + tip.toString() + '"]').length) {
                            content = ($('h2[id="' + tip.toString()
                                         + '"]').parent().parent().parent()
                                       .next().html());
                        }

                        return content;
                    }
                },
                show: {
                    event: 'mouseover, click',
                    ready: true
                },
                hide: {
                    delay: 1000,
                    fixed: true
                },
                position: {
                    target: 'mouse',
                    adjust: {
                        mouse: false,
                        method: 'shift'
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap cms-help-tip'
                }
            }
        );
    }
);

$(document).on(
    'click',
    '.re_preview',
    function (event) {
        event.preventDefault();
        $(this).qtip(
            {
                show: {
                    event: event.type,
                    ready: 'true'
                },
                hide: {
                    delay: 1000,
                    fixed: true
                },
                content: {
                    text: function (event, api) {
                        api.elements.content.html('Loading...');
                        if ($(this).attr('related')) {
                            // return "we have some text for re "+$(this).attr('re_id');
                            var url = (base_url
                                       + 'vocabs/relatedPreview/?related='
                                       + encodeURIComponent($(this).attr('related'))
                                       + '&v_id=' + $(this).attr('v_id')
                                       + '&sub_type='
                                       + $(this).attr('sub_type'));
                        }

                        if (url) {
                            return $.ajax(
                                {
                                    url: url
                                }
                            ).then(
                                function (content) {
                                    return content;
                                },
                                function (xhr, status, error) {
                                    api.set('content.text',
                                            status + ': ' + error);
                                }
                            );
                        } else {
                            return 'Error displaying preview';
                        }
                    }
                },
                position: {
                    target: 'mouse',
                    adjust: {
                        // The method was 'shift', but is now 'flip shift'
                        // after removing the escaping of the description,
                        // as the width of the tooltip was no longer
                        // fully expanding to make full use of max-width.
                        method: 'flip shift',
                        mouse: false
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap re-help-tip'
                }
            },
            event
        );
    }
);

// Subscribe button.
// First, mouseover. This is just like a[tip],
// except the tooltip is moved down (class element-shorter-top)
// and out of the way of the element, so that click events are always
// processed. See:
// https://stackoverflow.com/questions/18670334/qtip2-prevents-clicks-on-underlaying-elements
$(document).on(
    'mouseover',
    '#subscribe-link',
    function (event) {
        event.preventDefault();
        $(this).qtip(
            {
                content: {
                    text: 'Open the subscription dialog.'
                },
                show: {
                    event: 'mouseover',
                    ready: true
                },
                hide: {
                    event: 'mouseleave click unfocus',
                    fixed: true
                },
                position: {
                    target: 'mouse',
                    adjust: {
                        mouse: false,
                        method: 'shift'
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap element-shorter-top'
                }
            }
        );
    }
);

// Show a tooltip over the subscribe button _after_ the user
// has requested a download. Clicking on the tooltip opens
// the subscribe modal dialog.
$(document).on(
    'click',
    '.download-link',
    function (event) {
        // Timeout seems to be necessary, otherwise the qtip can get
        // lost.
        setTimeout(function() {
            $('#subscribe-link').qtip(
                {
                    content: {
                        text: 'Subscribe to be notified of changes to this vocabulary.'
                    },
                    show: {
                        ready: true
                    },
                    hide: {
                        leave: false,
                        inactive: 5000,
                        event: 'mouseleave click unfocus',
                        fixed: true
                    },
                    position: {
                        viewport: $(window)
                    },
                    style: {
                        classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap element-shorter-top'
                    },
                    events: {
                        render: function(event, api) {
                            // Clicking on the qtip opens the
                            // subscribe modal dialog.
                            var tooltip = api.elements.tooltip;
                            tooltip.bind('click', function(event, api) {
                                angular.element(document.getElementById(
                                    'subscribe-link')).scope().openDialog();
                            });
                        }
                    }
                }
            );
        }, 1000);
    }
);

// Feedback button
window.ATL_JQ_PAGE_PROPS = {
    "triggerFunction": function (showCollectorDialog) {
        // Requires that jQuery is available!
        $(".feedback_button, .myCustomTrigger").click(
            function (e) {
                e.preventDefault();
                showCollectorDialog();
            }
        );

    }
};

$(document).on(
    'click',
    '.deleteVocab',
    function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this vocabulary, '
              + 'including all endpoints? This action cannot be reversed.')) {
            var vocab_id = $(this).attr('vocab_id');
            var delete_mode = $(this).attr('delete_mode');
            $.ajax(
                {
                    url: base_url + 'vocabs/delete',
                    type: 'POST',
                    data: {
                        id: vocab_id,
                        mode: delete_mode,
                    },
                    dataType: 'json',
                    success: function (data) {
                        var response = data;
                        if (data.status == 'success') {
                            location.reload();
                        } else {
                            alert('Delete failed: ' + data.message);
                        }
                    }
                }
            );
        } else {
            return false;
        } // end if
        return undefined;
    }
);


function showWidget()
{
    $('html, body').animate(
        {
            scrollTop: $('#widget').offset().top
        },
        1000
    );
    if ($("#widget-info").is(":hidden")) {
        $("#widget-toggle").click();
    }

    return undefined;
}

// Utility function to get a cookie.
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

// Polyfill Array find() method from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
// Needed for IE (sigh).
// Used in relatedCtrl.js.
//https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}
