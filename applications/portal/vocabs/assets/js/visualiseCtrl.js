/**
 * Controller for the concept browse visualisation.
 * @namespace visualiseCtrl
 */
/*jslint
    browser: true
*/
/*global
    $, angular
*/

(function() {
    'use strict';

    angular
        .module('app')
        .controller('visualise', visualiseCtrl);

    /** Utility function to make unique keys for
     * tree nodes. Return values are 'key1', 'key2', etc.
     * Adapted from an answer at:
     * https://stackoverflow.com/questions/1535631/static-variables-in-javascript
     * @memberof visualiseCtrl
     */
    var makeUniqueKey = (function() {
        var counter = 0;

        return function() {
            counter = counter + 1;
            return 'key' + counter;
        };
    })();

    /** Count of total number of nodes (including concept refs). Used
     * to determine if we should display a warning about performance.
     * @memberof visualiseCtrl
     */
    var nodeCount = 0;

    /** Shortcut to fancytree's escapeHtml function.
     * @memberof visualiseCtrl
     */
    var escapeHtml = $.ui.fancytree.escapeHtml;

    /** Prepare one concept for display by fancytree.
     *
     * Each concept is assigned:
     * * a refKey, copied from the concept's IRI
     * * a title, based on the concept's prefLabel (or 'No Title', if it
     *   doesn't have one)
     * * a titlesuffix, based on the number of this concept's child
     *   concepts (or an empty string, if it doesn't have any)
     * * a tooltipText to use as the content of the qTip2 tooltip
     * * a setting for folder, if this concept has child concepts
     * * a setting for children, if this concept has child concepts
     * Recursively do the same for all this concept's child concepts.
     * @param element One node of the tree.
     * @param {string} sissvoc_endpoint The SISSVoc endpoint URL to be used
     *          in the href attribute for "View as linked data".
     * @memberof visualiseCtrl
     */
    function postProcessOneConcept(element, sissvoc_endpoint) {
        nodeCount++;
        element.refKey = element.iri;
        // We assign our own (sequential) keys, because the auto-generated
        // ones sometimes aren't unique.
        element.key = makeUniqueKey();
        if ('prefLabel' in element) {
            // Don't need to apply escapeHtml here, as that is
            // done later by fancytree because we are using
            // "escapeTitles: true" in the config.
            element.title = element.prefLabel;
        } else {
            element.title = 'No Title';
        }
        var tipText = '<p><b>' + escapeHtml(element.title) +
            '</b><p/><p><b>IRI:</b> ' + escapeHtml(element.iri) + '</p>';
        if ('definition' in element) {
            tipText = tipText + '<p><b>Definition: </b>' +
                escapeHtml(element.definition) + '</p>';
        }
        if ('notation' in element) {
            tipText = tipText + '<p><b>Notation: </b>' +
                escapeHtml(element.notation) + '</p>';
        }
        if (sissvoc_endpoint != '') {
            tipText = tipText + '<p><a class="pull-right" target="_blank" ' +
                'onclick="clickLinkedData(\'' +
                escapeHtml(element.iri).replace(/&#39;/g, "\\&#39;") +
                '\')" ' +
                'href="' + sissvoc_endpoint +
                '/resource?uri=' +
                encodeURIComponent(element.iri) +
                '">View as linked data</a></p>';
        }

        // Closing the paragraph tag is essential to make
        // jQuery accept _all_ of the content when we do
        // "tip = $(tip);" in the tooltip creation code.
        // Without out, some content can get lost.
        tipText = tipText + '</p>';
        element.tooltipText = tipText;

        if ('narrower' in element) {
            // Setting folder to true means that clicking on the label
            // opens to show the children.
            // (I.e., the clickFolderMode setting applies to
            element.folder = true;
            element.children = element.narrower;
            // Show number of children in the title. See also
            // fixConceptRefs, which patches the titles of nodes
            // of type concept_ref.
            element.titlesuffix = ' <i>(' + element.children.length + ')</i>';
            element.children.forEach(function(child) {
                postProcessOneConcept(child, sissvoc_endpoint);
            });
        } else {
            // Make an empty titlesuffix, so that when we adjust the
            // node title, we don't have to test if the titlesuffix
            // is present.
            element.titlesuffix = '';
        }
    }

    /** Recursively add a sort order to the concepts in the data,
     * based on the original ordering of the data.
     * The original data contains concepts sorted in one particular
     * order. We add a key to each concept with the index of that
     * concept in the array. This is so that if we change the sort
     * order of concepts, we can change _back_ to the original
     * sort order.
     * @param elements An array of tree nodes.
     * @param {!string} key The key to use for the key/value pair to
     *          be inserted into each node.
     * @memberof visualiseCtrl
     */
    function addSortOrder(elements, key) {
        elements.forEach(function(element, i) {
            element[key] = i;
            if ('narrower' in element) {
                addSortOrder(element.narrower, key);
            }
        });
    }

    /** This gets called once we have the tree data from the XHR response.
     * This rewrites it into the structure needed by Fancytree.
     * @param $scope The AngularJS controller scope.
     * @memberof visualiseCtrl
     */
    function conceptTreePostProcess($scope) {
        var data = JSON.parse($scope.treedata);
        var sissvoc_endpoint = '';
        var current_version_sissvoc =
            document.querySelector("a#current_version_sissvoc");
        if (current_version_sissvoc != null) {
            sissvoc_endpoint = current_version_sissvoc.
                getAttribute("sissvoc_endpoint");
        }
        $scope.tree = data.forest;
        var maySortByNotation = data.maySortByNotation;
        if (maySortByNotation) {
            var defaultSortByNotation = data.defaultSortByNotation;
            var notationFormat = data.notationFormat;
            var sort_dropdown = $('#sort_dropdown');
            var sort_dropdown_select = $(sort_dropdown).find('select');
            // Use this to confirm what the notation format is.
            // sort_dropdown_select.append(
            //     '<option label="Notation (' + notationFormat +
            //         ')" value="' + notationFormat + '">' +
            //         'Notation (' + notationFormat + ')</option>');
            sort_dropdown_select.append(
                '<option label="Notation" value="' + notationFormat + '">' +
                    'Notation</option>');
            sort_dropdown.show();
            var label_show_notation = $('#label_show_notation');
            label_show_notation.show();
            var p_show_notation = $('#p_show_notation');
            p_show_notation.show();
            // Pay attention to sort orders here, so that fixConceptRefs
            // will include them when it makes copies.
            if (defaultSortByNotation) {
                // Add notationSortOrder values
                addSortOrder($scope.tree, 'notationSortOrder');
                sort_dropdown_select.val(notationFormat);
                setEnhanceTitle($scope, notationFormat);
            } else {
                // Add prefLabelSortOrder values
                addSortOrder($scope.tree, 'prefLabelSortOrder');
                setEnhanceTitle($scope, 'prefLabel');
            }
        } else {
            setBasicEnhanceTitle($scope);
        }
        $scope.tree.forEach(function(element) {
            postProcessOneConcept(element, sissvoc_endpoint);
        });
    }

    /** There may be concepts in the incoming data that are of
     * type "concept_ref". These are concepts that have children,
     * but for which the children aren't included in the data.
     * So we now patch them up by copying across their children
     * (recursively making clones),
     * and updating the node's folder and titlesuffix settings.
     * This is used as the callback for the loadChildren event,
     * and so accepts the normal parameters for an event.
     * @param event The name of the event. Not used.
     * @param data The data for the event. Used to get the whole tree.
     * @memberof visualiseCtrl
     */
    function fixConceptRefs(event, data) {
        data.tree.visit(function(node) {
            if (node.type === 'concept_ref') {
                var clones = node.getCloneList();
                $.each(clones, function(i, c) {
                    if (c.type === 'concept') {
                        var children = c.getChildren();
                        if (children != null && children.length > 0) {
                            // We now know that node has children,
                            // so we set folder to true, so that
                            // clicking on the label opens to show the children.
                            // (I.e., the clickFolderMode setting applies to
                            // node.)
                            node.folder = true;

                            $.each(children, function(j, child) {
                                // Can't just feed the value of getChildren()
                                // into addChildren(), because there are then
                                // duplicate "key" values.
                                var newChild = child.toDict(true, function(d) {
                                    delete d.key;
                                    // We assign our own (sequential)
                                    // keys, because the auto-generated
                                    // ones sometimes aren't unique.
                                    d.key = makeUniqueKey();
                                });
                                node.addChildren(newChild);
                            });

                            // When the node was originally processed (by
                            // postProcessOneConcept), there
                            // were no children, so the titlesuffix (saying
                            // indicating the number of children) was empty.
                            // Fix up the titlesuffix now.
                            node.data.titlesuffix = ' <i>(' +
                                c.getChildren().length + ')</i>';
                        }
                    }
                });
            }
        });

        // Delete ourself from the tree options, so that
        // we are no longer invoked.
        // It's not obvious, but this function is only invoked once anyway,
        // so in fact we _don't_ need to do this:
        //    delete data.tree.options.loadChildren;
    }

    /** Give a nicely-formatted result for the number of matches.
     * @param {number} n The number of matches.
     * @returns {string} A nicely-formatted string containing the
     *            number of matches, in parentheses.
     * @memberof visualiseCtrl
     */
    function showNumberOfMatches(n) {
        switch (n) {
        case 0:
            $("span#tree_filter_matches").text("(no match)");
            break;
        case 1:
            $("span#tree_filter_matches").text("(1 match)");
            break;
        default:
            $("span#tree_filter_matches").text("(" + n + " matches)");
        }
    }


    /** Utility function to compare two nodes, based on their prefLabels.
     * @param a The first node to be compared.
     * @param b The second node to be compared.
     * @returns {number} The result of the comparison:
     *            -1 if a's prefLabel < b's prefLabel
     *            0 if a's and b's prefLabels are equal
     *            1 if a's prefLabel > b's prefLabel.
     * @memberof visualiseCtrl
     */
    function cmpPrefLabel(a, b) {
        var x = a.data.prefLabelSortOrder,
            y = b.data.prefLabelSortOrder;
        return x === y ? 0 : x > y ? 1 : -1;
    }

    /** Utility function to compare two nodes, based on their notations.
     * @param a The first node to be compared.
     * @param b The second node to be compared.
     * @returns {number} The result of the comparison:
     *            -1 if a's notation < b's notation
     *            0 if a's and b's notations are equal
     *            1 if a's notation > b's notation.
     * @memberof visualiseCtrl
     */
    function cmpNotation(a, b) {
        var x = a.data.notationSortOrder,
            y = b.data.notationSortOrder;
        return x === y ? 0 : x > y ? 1 : -1;
    }

    /** This function is for assignment to the enhanceTitle option
     * of the fancytree config. It is to be used when the data
     * does not include notations. It appends the "titlesuffix"
     * (currently, the count of the number of children) to the node label.
     * @param $scope The AngularJS controller scope.
     * @memberof visualiseCtrl
     */
    function setBasicEnhanceTitle($scope) {
        $scope.enhanceTitle = function(e, data) {
            data.$title.append(data.node.data.titlesuffix);
        };
    }

    /** Set the enhanceTitle option of the fancytree config, based on
     * the notation selection and format.
     * In practice, there's (currently) no difference; the same
     * value is set for enhanceTitle, irrespective of the notation
     * selection and format.
     * It appends the "titlesuffix" (currently, the count of the number
     * of children) to the node label.
     * If the node has a notation, this is prepended within a span that
     * is either visible or hidden, depending on the setting of the
     * show_notation checkbox.
     * @param $scope The AngularJS controller scope.
     * @param {string} sortkey The sort key in play; one of
     *          'prefLabel', 'notationAlpha', etc.
     * @memberof visualiseCtrl
     */
    function setEnhanceTitle($scope, sortkey) {
        switch (sortkey) {
        case 'prefLabel':
            // This way doesn't include notation, even hidden.
            // For now, fall through.
            // tree.options.enhanceTitle = function(e, data) {
            //     var nodedata = data.node.data;
            //     data.$title.append(nodedata.titlesuffix);
            // }
            // break;
        case 'notationAlpha':
        case 'notationFloat':
        case 'notationDotted':
            $scope.enhanceTitle = function(e, data) {
                var nodedata = data.node.data;
                var notation = nodedata.notation;
                if (notation !== undefined) {
                    var isShowNotationChecked =
                        document.getElementById('show_notation').checked;
                    // Do need to use escapeHtml here, as fancytree's
                    // own escaping has already been applied.
                    if (isShowNotationChecked) {
                        data.$title.prepend(
                            '<span class="notation"><i>' +
                                escapeHtml(notation) + '</i>: </span>');
                    } else {
                        data.$title.prepend(
                            '<span class="notation" style="display:none"><i>' +
                                escapeHtml(notation) + '</i>: </span>');
                    }
                }
                data.$title.append(nodedata.titlesuffix);
            };
            break;
        default:
            alert('No such sort key');
        }
    }

    /** Resort child nodes based on the (updated) value of the sort dropdown.
     * @param {string} sortkey The (updated) sort key now in play; one of
     *          'prefLabel', 'notationAlpha', etc.
     * @memberof visualiseCtrl
     */
    function resortChildren(sortkey) {
        var root = $.ui.fancytree.getTree().getRootNode();
        switch (sortkey) {
        case 'prefLabel':
            root.sortChildren(cmpPrefLabel, true);
            break;
        case 'notationAlpha':
        case 'notationFloat':
        case 'notationDotted':
            root.sortChildren(cmpNotation, true);
            break;
        default:
            alert('No such sort key');
        }
    }

    /** Adjust CSS classes on the "li" elements so that the branching
     * display looks right.
     * Each visible "li" element has the 'fancytree-show' class;
     * all invisible "li" elements don't.
     * Within each "ul" element, the first visible "li" element
     * (if there is one) also has the 'fancytree-first-visible' class,
     * and the last visible "li" element (if there is one) has the
     * 'fancytree-last-visible' class.
     * The parameter selector must be either a CSS selector that selects
     * the "ul" element(s) to be considered, or a DOM "ul" element.
     * If no value is specified,
     * it defaults to all of the "ul" elements in the tree.
     * @param selector Either a CSS selector (a string) or a DOM "ul" element.
     *   May be null, in which case, all "ul" elements in the tree are
     *   adjusted.
     * @memberof visualiseCtrl
     */
    function adjustCss(selector) {
        if (selector == undefined) {
            selector = 'ul.fancytree-container, ul.fancytree-container ul';
        }
        $(selector).each(function(i, ul) {
            var allchildren = $(ul).children();
            var visible_li = null;
            allchildren.each(function(j, li) {
                var li$ = $(li);
                if (li$.children().hasClass('fancytree-hide')) {
                    li$.removeClass(
                        'fancytree-show fancytree-first-visible fancytree-last-visible');
                } else {
                    li$.addClass('fancytree-show');
                    li$.removeClass('fancytree-last-visible');
                    if (visible_li == null) {
                        li$.addClass('fancytree-first-visible');
                    } else {
                        li$.removeClass('fancytree-first-visible');
                    }
                    visible_li = li;
                }
            });
            if (visible_li != null) {
                $(visible_li).addClass('fancytree-last-visible');
            }
        });
    }


    // Helper functions from fancytree.

    /** Escape a regular expression.
     * This method is copied from the fancytree source code.
     * @param {string} str A string to be escaped.
     * @returns {string} The value of str, with all characters that
     *            are special in regular expressions escaped.
     * @memberof visualiseCtrl
     */
    function _escapeRegex(str) {
        /*jshint regexdash:true */
        return (str + "").replace(/([.?*+\^\$\[\]\\(){}|-])/g, "\\$1");
    }

    /** Extract the text from a string that may contain HTML tags.
     * This helper function has been modified from the fancytree original,
     * to return an empty string in the case that the actual
     * parameter has the value undefined.
     * @param {string} s A string, possibly containing HTML tags.
     * @returns {string} The text contained in s, with HTML tags removed.
     * @memberof visualiseCtrl
     */
    function extractHtmlText(s) {
        if (s == undefined) {
            return '';
        }
        if (s.indexOf(">") >= 0) {
            return $("<div/>")
                .html(s)
                .text();
        }
        return s;
    }

    /** Perform an operation, with a spinner spinning to suggest
     * to the user that they might need to wait for completion
     * of the operation.
     * @param {!function} f The operation to be performed.
     * @memberof visualiseCtrl
     */
    function doWithSpinner(f) {
        $("#fancytree-spinner").show();
        setTimeout(function() {
            f();
            $("#fancytree-spinner").hide();
        }, 50);
    }

    /** Initialisation of the browse visualisation. This method
     * is invoked once the tree data has been successfully
     * fetched from the Registry. The function creates the
     * tree and attaches event handlers.
     * @param {!object} $scope The AngularJS controller
     *          scope. $scope.tree must contain the tree data as
     *          fetched from the Registry.
     * @param {!object} $scope.tree The tree data as fetched from the
     *          Registry.
     * @memberof visualiseCtrl
     */
    function initialiseVisualisation($scope) {
        // Make the tree template visible; we need access
        // to the elements. Need $scope.$apply as we're
        // not currently in AngularJS apply loop.
        $scope.$apply(function() {
            $scope.hasTree = true;
        });

        // Onclick function for the "View as linked data" link embedded
        // within browse tree concept tooltips. It does analytics logging
        // of the user's click.
        // We take advantage of the fact that the SISSVoc endpoint
        // for the current version is being displayed on the same page,
        // and there's an onclick event on it that has pretty much what
        // we want.
        $scope.clickLinkedData = function(uri) {
            var sissvoc_onclick =
                document.querySelector("a#current_version_sissvoc").
                getAttribute("onclick");
            // FIXME: it may be that we want to append uri to the
            // "ap_url" value.  Make a decision, then implement it.
            var ajax_command = sissvoc_onclick.replace(/return true/, '');
            eval(ajax_command);
        };

        // Cancel any existing filter, and apply filtering to show
        // all of the instances (clones) of a concept, based on its IRI.
        document.filterClones = function(iri) {
            var tree = $.ui.fancytree.getTree();
            var filterFunc = tree.filterNodes;

            doWithSpinner(function() {
                // Cancel any existing filter.
                var searchField = $("input[name=tree_search]");
                searchField.val("");
                tree.clearFilter();

                var n = filterFunc.call(tree, function(node) {
                    return iri == node.data.iri;
                });
                // There's now a filter in place, so change the
                // placeholder, and enable the reset button.
                searchField.attr('placeholder', 'Filtering to duplicates');
                $("button#button_reset_filter").attr("disabled", false);
                showNumberOfMatches(n);
                adjustCss();
            });
        };

        conceptTreePostProcess($scope);

        // Create the tree.
        // Note: some config options are added/updated later.
        $("#tree").fancytree({
            extensions: ["clones", "filter"],
            clickFolderMode: 3,
            icon: false,
            filter: {
                autoExpand: true,
                mode: "hide",
                nodata: 'No matches for filter.'
            },
            source: $scope.tree,
            loadChildren: fixConceptRefs,
            clones: {
                highlightClones: true
            },
            // We do use fancytree's own escaping of titles, but we
            // still need to use escapeHtml ourselves, as we do
            // our own munging (i.e., using enhanceTitle).
            escapeTitles: true,
            enhanceTitle: $scope.enhanceTitle,
            expand: function(e, data) {
                // Only need to adjust the CSS of the node that was
                // just opened.
                adjustCss(data.node.ul);
            }
        });

        // Now add our own custom event handlers.
        $("#tree").on(
            'mouseenter',
            'span.fancytree-title',
            function(event) {
                $('.qtip').each(
                    function() {
                        $(this).data('qtip').destroy();
                    }
                );
                $(this).qtip(
                    {
                        content: {
                            text: function(e, api) {
                                var node = $.ui.fancytree.getNode(this);
                                var tip = node.data.tooltipText;
                                if (node.isClone()) {
                                    // Strip existing trailing </p>, which
                                    // is 4 characters long.
                                    // Be sure to restore the </p>
                                    // afterwards!
                                    // tip = tip.slice(0, -4);
                                    tip = tip +
                                        '<p style="clear: both">' +
                                        'This concept is present in multiple locations ' +
                                        'within this vocabulary. <br />' +
                                        '<a href="#" role="button" ' +
                                        'style="padding: 0px" ' +
                                        'onclick="filterClones(\'' +
                                        escapeHtml(node.data.iri).replace(/&#39;/g, "\\&#39;") +
                                        '\')" ' +
                                        '>Filter to all instances</a>.</p>';
                                }
                                tip = $(tip);
                                $(tip).find('button').click(function() {
                                    api.destroy();
                                    // api.remove();
                                });
                                return tip;
                            }
                        },
                        show: {
                            event: 'mouseenter',
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

        $("input[name=tree_search]").keyup(
            $.ui.fancytree.debounce(500, function(e) {
                var n,
                    tree = $.ui.fancytree.getTree(),
                    filterFunc = tree.filterNodes;
                var match = $(this).val();

                if(e && e.which === $.ui.keyCode.ESCAPE ||
                   $.trim(match) === "") {
                    $("button#button_reset_filter").click();
                    return;
                }

                if($("#regex").is(":checked")) {
                    // Pass function to perform match
                    n = filterFunc.call(tree, function(node) {
                        return new RegExp(match, "i").test(node.title);
                    });
                } else {
                    // Pass a string to perform case insensitive matching
                    // n = filterFunc.call(tree, match);
                    // No, pass in our custom matcher function.

                    // The following code adapted from the original
                    // fancytree implementation of the default
                    // filter behaviour.
                    var matchEscaped = _escapeRegex(match);
                    var re = new RegExp(".*" + matchEscaped + ".*", "i");
                    var reHighlight = new RegExp(_escapeRegex(match), "gi");

                    // Custom filter to search not only titles,
                    // but also definitions and notations.
                    var filterImpl = function(node) {
                        if (!node.title) {
                            return false;
                        }
                        // No, don't use extractHtmlText, because
                        // we've set escapeTitles in the config.
//                        var text = extractHtmlText(node.title),
                        var text = node.title,
                            res = !!re.test(text);
                        if (!res) {
                            // Also test definitions and notations.
                            // Note that we don't override the variable text here;
                            // that continues to hold the node title, as that
                            // is what is highlighted.
                            var definition = extractHtmlText(node.data.definition);
                            res = !!re.test(definition);
                            if (!res) {
                                var notation = extractHtmlText(node.data.notation);
                                res = !!re.test(notation);
                            }
                        }

                        if (res) {
/*
                            if (escapeTitles) {
*/
                                // #740: we must not apply the marks to escaped entity names, e.g. `&quot;`
                                // Use some exotic characters to mark matches:
                                var temp = text.replace(reHighlight, function(s) {
                                    return "\uFFF7" + s + "\uFFF8";
                                });
                                // now we can escape the title...
                                node.titleWithHighlight = escapeHtml(temp)
                                // ... and finally insert the desired `<mark>` tags
                                    .replace(/\uFFF7/g, "<mark>")
                                    .replace(/\uFFF8/g, "</mark>");
/*
                            } else {
                                node.titleWithHighlight = text.replace(
                                    reHighlight,
                                    function(s) {
                                        return "<mark>" + s + "</mark>";
                                    }
                                );
                            }
*/
                            // node.debug("filter", escapeTitles, text, node.titleWithHighlight);
                        }
                        return res;
                    };

                    doWithSpinner(function() {
                        n = filterFunc.call(tree, filterImpl);
                        $("button#button_reset_filter").attr("disabled", false);
                        showNumberOfMatches(n);
                        adjustCss();
                    });

                }
            } // function(e)
                                   ) // debounce
        ).focus();

        // Callback for when the user has clicked the button to
        // reset filtering (whether by search term or clone).
        $("button#button_reset_filter").click(function(e) {
            var tree = $("#tree").fancytree("getTree");
            var searchField = $("input[name=tree_search]");
            searchField.val("");
            // Restore original placeholder, in case it was replaced by
            // the clone placeholder.
            searchField.attr('placeholder', 'Filter...');
            $("span#tree_filter_matches").text("");
            $(e.currentTarget).attr("disabled", true);
            doWithSpinner(function() {
                tree.clearFilter();
                adjustCss();
            });
        }).attr("disabled", true);

        // Callback for when the user has changed the sort dropdown.
        $("select#tree_sort").change(function(e) {
            var tree = $("#tree").fancytree("getTree");
            var newSortOrder = e.currentTarget.value;
            tree.enableUpdate(false);
            setEnhanceTitle($scope, newSortOrder);
            resortChildren(newSortOrder);
            // Force re-rendering of all titles.
            tree.enableUpdate(true);
            adjustCss();
        });

        // Callback for when the user has changed the setting
        // to display/hide notations.
        $("#show_notation").change(function(e) {
            var isChecked = e.currentTarget.checked;
            if (isChecked) {
                $('.notation').show();
            } else {
                $('.notation').hide();
            }
        });

        $("button#expandAll").click(function(e) {
            doWithSpinner(function() {
                $("#tree").fancytree("getTree").expandAll();
            });
            // No need to do adjustCss() here, as it is done
            // for every expanded node by the expand event
            // handler specified in the tree's config.
            //    adjustCss();
        });
        $("button#collapseAll").click(function(e) {
            doWithSpinner(function() {
                $("#tree").fancytree("getTree").expandAll(false);
            });
            // Need to call adjustCss() even here, to cope with
            // the case that a filter is in operation (i.e., which
            // will still be in operation after collapsing).
            adjustCss();
        });

        adjustCss();

        // Maybe display a warning, if too many nodes (either concepts
        // or concept refs). Adjust threshold as necessary.
        if (nodeCount >= 2000) {
            $("#large_vocabulary_warning").show();
        }

        // Prevent the browser jumping to the "Filter..." input.
        $("input[name=tree_search]").blur();

        $scope.$apply();
    }

    /** This is the controller proper.
     * @param $scope The AngularJS controller scope.
     * @param $attrs The AngularJS helper for getting attributes of
     *          the element on which the controller is applied.
     * @memberof visualiseCtrl
     */
    function visualiseCtrl($scope, $attrs) {
        // Get access to the Registry API.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var defaultClient = VocabularyRegistryApi.ApiClient.instance;
        defaultClient.basePath = registry_api_url;
        // Let the registry know that we are the view page,
        // and what URL this page is.
        defaultClient.defaultHeaders['portal-id'] = 'Portal-JS-browse';
        defaultClient.defaultHeaders['portal-referrer'] =
            window.location;
        var api = new VocabularyRegistryApi.ResourcesApi();

        api.getVersionArtefactConceptTree($attrs.versionid)
            .then(function(response) {
                $scope.treedata = response;
                if ($scope.treedata.length>1) {
                    // We got a visualization, so hide
                    // the manually-added top concepts.
                    $("#concept").hide();
                }
                initialiseVisualisation($scope);
            });
    }
})();
