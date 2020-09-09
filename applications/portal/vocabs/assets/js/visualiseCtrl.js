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

    /** Flag to indicate if the vocabulary content contains a concept
     * scheme node.  Used to determine if we should display a legend
     * for the colour used for concept schemes.
     * @memberof visualiseCtrl
     */
    var showConceptSchemeLegend = false;
    /** Flag to indicate if the vocabulary content contains an
     * unordered collection node.  Used to determine if we should
     * display a legend for the colour used for unordered collections.
     * @memberof visualiseCtrl
     */
    var showUnorderedCollectionLegend = false;
    /** Flag to indicate if the vocabulary content contains an
     * ordered collection node.  Used to determine if we should
     * display a legend for the colour used for ordered collections.
     * @memberof visualiseCtrl
     */
    var showOrderedCollectionLegend = false;

    /** Shortcut to fancytree's escapeHtml function.
     * @memberof visualiseCtrl
     */
    var escapeHtml = $.ui.fancytree.escapeHtml;

    /** Flag to determine if we make resource IRIs
     * displayed in tooltips "active", i.e., by
     * using a tags.
     * Supported for format version 3.
     * @memberof visualiseCtrl
     */
    var makeIRIsActive = false;

    /** Prepare one concept for display by fancytree.
     * This is for version 2 of the format.
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
    function postProcessOneConcept_v2(element, sissvoc_endpoint) {
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
                '\',\'' +
                escapeHtml(element.title) +
                '\')" ' +
                'href="' + sissvoc_endpoint +
                '/resource?uri=' +
                encodeURIComponent(element.iri) +
                '">View as linked data</a></p>';
        }

        // Closing the paragraph tag is essential to make
        // jQuery accept _all_ of the content when we do
        // "tip = $(tip);" in the tooltip creation code.
        // Without it, some content can get lost.
        tipText = tipText + '</p>';
        element.tooltipText = tipText;

        if ('narrower' in element) {
            // Setting folder to true means that clicking on the label
            // opens to show the children.
            // (I.e., the clickFolderMode setting applies to
            element.folder = true;
            element.children = element.narrower;
            // Show number of children in the title. See also
            // fixConceptRefs_v2, which patches the titles of nodes
            // of type concept_ref.
            element.titlesuffix = ' <i>(' + element.children.length + ')</i>';
            element.children.forEach(function(child) {
                postProcessOneConcept_v2(child, sissvoc_endpoint);
            });
        } else {
            // Make an empty titlesuffix, so that when we adjust the
            // node title, we don't have to test if the titlesuffix
            // is present.
            element.titlesuffix = '';
        }
    }


    /** Given a resource type, maybe set one of the flags to indicate
     * that the resource type should be shown in the legend.
     * @param {string} resourceType The resource type to consider.
     * @memberof visualiseCtrl
     */
    function setTypeFlag(resourceType) {
        switch (resourceType) {
        case 'concept':
        case 'concept_ref':
            // No special flag for concepts.
            return;
        case 'concept_scheme':
            showConceptSchemeLegend = true;
            return;
        case 'unordered_collection':
        case 'unordered_collection_ref':
            showUnorderedCollectionLegend = true;
            return;
        case 'ordered_collection':
        case 'ordered_collection_ref':
            showOrderedCollectionLegend = true;
            return;
        default:
            // Oops!
            return;
        }
    }

    /** Given a resource type, return a human-readable description of
     * the type. This is used in tooltips when the node is a clone.
     * @param {string} resourceType The resource type to consider.
     * @returns {string} A human-readable representation of the node
     *     type.  If the node type is not recognized, an empty string
     *     is returned.
     * @memberof visualiseCtrl
     */
    function typeAsText(resourceType) {
        switch (resourceType) {
        case 'concept':
        case 'concept_ref':
            return 'concept';
        case 'concept_scheme':
            return 'concept scheme';
        case 'unordered_collection':
        case 'unordered_collection_ref':
        case 'ordered_collection':
        case 'ordered_collection_ref':
            return 'collection';
        default:
            // Unknown!
            return 'resource';
        }
    }

    /** Given a resource type, return the CSS class to be added to the
     * HTML element for the title.
     * @param {string} resourceType The resource type to consider.
     * @returns {string} The CSS class to be added to the HTML element
     *     for the title, if one should be added, or null, if not.
     * @memberof visualiseCtrl
     */
    function extraCssClass(resourceType) {
        switch (resourceType) {
        case 'concept':
        case 'concept_ref':
            return null;
        case 'concept_scheme':
            return 'node-concept-scheme';
        case 'unordered_collection':
        case 'unordered_collection_ref':
            return 'node-unordered-collection';
        case 'ordered_collection':
        case 'ordered_collection_ref':
            return 'node-ordered-collection';
        default:
            // Unknown!
            return null;
        }
    }

    /** Prepare one concept for display by fancytree.
     * This is for version 3 of the format.
     * Each concept is assigned:
     * * a refKey, copied from the concept's IRI
     * * a title, based on the concept's label (or 'No Title', if it
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
    function postProcessOneResource_v3(element, sissvoc_endpoint) {
        nodeCount++;
        element.refKey = element.iri;
        // We assign our own (sequential) keys, because the auto-generated
        // ones sometimes aren't unique.
        element.key = makeUniqueKey();
        if ('label' in element) {
            // Don't need to apply escapeHtml here, as that is
            // done later by fancytree because we are using
            // "escapeTitles: true" in the config.
            element.title = element.label;
        } else {
            element.title = 'No Title';
        }

        // Keep track of what types of resources we've seen,
        // so we can provide a customized legend.
        setTypeFlag(element.type);

        var tipText = '<p><b>' + escapeHtml(element.title) +
            '</b><p/><p><b>IRI:</b> ';
        if (makeIRIsActive) {
            var url;
            if ('url' in element) {
                url = element.url;
            } else {
                url = element.iri;
            }
            tipText = tipText + '<a href="' + escapeHtml(url) +
                '" target="_blank">' + escapeHtml(element.iri) + '</a>';
        } else {
            tipText = tipText + escapeHtml(element.iri);
        }
        tipText = tipText + '</p>';


        if ('isTopConceptOfContext' in element && element['isTopConceptOfContext'] == true) {
            tipText = tipText + '<p><span class="t-for-top-concept">T</span> ' +
                'This is a top concept of the containing concept scheme.</p>';
        }

        if ('definition' in element) {
            tipText = tipText + '<p><b>Definition: </b>' +
                escapeHtml(element.definition) + '</p>';
        }
        // Show description, but only if different from definition.
        if (('dctermsDescription' in element) &&
           element.dctermsDescription != element.definition) {
            tipText = tipText + '<p><b>Description: </b>' +
                escapeHtml(element.dctermsDescription) + '</p>';
        }
        if ('notation' in element) {
            tipText = tipText + '<p><b>Notation: </b>' +
                escapeHtml(element.notation) + '</p>';
        }
        if (sissvoc_endpoint != '') {
            tipText = tipText + '<p><a class="pull-right" target="_blank" ' +
                'onclick="clickLinkedData(\'' +
                escapeHtml(element.iri).replace(/&#39;/g, "\\&#39;") +
                '\',\'' +
                escapeHtml(element.title) +
                '\')" ' +
                'href="' + sissvoc_endpoint +
                '/resource?uri=' +
                encodeURIComponent(element.iri) +
                '">View as linked data</a></p>';
        }

        // Closing the paragraph tag is essential to make
        // jQuery accept _all_ of the content when we do
        // "tip = $(tip);" in the tooltip creation code.
        // Without it, some content can get lost.
        tipText = tipText + '</p>';
        element.tooltipText = tipText;

        if ('children' in element) {
            // Setting folder to true means that clicking on the label
            // opens to show the children.
            // (I.e., the clickFolderMode setting applies to
            element.folder = true;
            // Show number of children in the title. See also
            // loadChildrenHandler_v3, which patches the titles of nodes
            // of type concept_ref.
            element.titlesuffix = ' <i>(' + element.children.length + ')</i>';
            element.children.forEach(function(child) {
                postProcessOneResource_v3(child, sissvoc_endpoint);
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
     * This is for version 2 of the format.
     * @param elements An array of tree nodes.
     * @param {!string} key The key to use for the key/value pair to
     *          be inserted into each node.
     * @memberof visualiseCtrl
     */
    function addSortOrder_v2(elements, key) {
        elements.forEach(function(element, i) {
            element[key] = i;
            if ('narrower' in element) {
                addSortOrder_v2(element.narrower, key);
            }
        });
    }

    /** Recursively add a sort order to the concepts in the data,
     * based on the original ordering of the data.
     * The original data contains concepts sorted in one particular
     * order. We add a key to each concept with the index of that
     * concept in the array. This is so that if we change the sort
     * order of concepts, we can change _back_ to the original
     * sort order.
     * This is for version 3 of the format.
     * @param elements An array of tree nodes.
     * @param {!string} key The key to use for the key/value pair to
     *          be inserted into each node.
     * @memberof visualiseCtrl
     */
    function addSortOrder_v3(elements, key) {
        elements.forEach(function(element, i) {
            element[key] = i;
            if ('children' in element) {
                addSortOrder_v3(element.children, key);
            }
        });
    }

    /** This gets called once we have the tree data from the XHR response.
     * This rewrites it into the structure needed by Fancytree.
     * @param $scope The AngularJS controller scope.
     * This is for version 2 of the format.
     * @memberof visualiseCtrl
     */
    function conceptTreePostProcess_v2($scope, data) {
        var sissvoc_endpoint = '';
        var current_version_sissvoc =
            document.querySelector("a#current_version_sissvoc");
        if (current_version_sissvoc != null) {
            sissvoc_endpoint = current_version_sissvoc.
                getAttribute("sissvoc_endpoint");
        }
        $scope.tree = data.forest;
        // Process browse flags.
        var maySortByNotation = data.maySortByNotation;
        if (maySortByNotation) {
            // Configure sort dropdown options.
            var sort_dropdown = $('#sort_dropdown');
            var sort_dropdown_select = $(sort_dropdown).find('select');
            // Always support prefLabel.
            sort_dropdown_select.append(
                '<option label="Preferred label" value="prefLabel">' +
                    'Preferred label</option>');
            var defaultSortByNotation = data.defaultSortByNotation;
            var notationFormat = data.notationFormat;
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
            // Pay attention to sort orders here, so that fixConceptRefs_v2
            // will include them when it makes copies.
            if (defaultSortByNotation) {
                // Add notationSortOrder values
                addSortOrder_v2($scope.tree, 'notationSortOrder');
                sort_dropdown_select.val(notationFormat);
                setEnhanceTitle($scope, notationFormat);
            } else {
                // Add prefLabelSortOrder values
                addSortOrder_v2($scope.tree, 'prefLabelSortOrder');
                setEnhanceTitle($scope, 'prefLabel');
            }
        } else {
            setBasicEnhanceTitle($scope);
        }
        $scope.tree.forEach(function(element) {
            postProcessOneConcept_v2(element, sissvoc_endpoint);
        });
    }

    /** This gets called once we have the tree data from the XHR response.
     * This rewrites it into the structure needed by Fancytree.
     * This is for version 3 of the format.
     * @param $scope The AngularJS controller scope.
     * @memberof visualiseCtrl
     */
    function conceptTreePostProcess_v3($scope, data) {
        var sissvoc_endpoint = '';
        var current_version_sissvoc =
            document.querySelector("a#current_version_sissvoc");
        if (current_version_sissvoc != null) {
            sissvoc_endpoint = current_version_sissvoc.
                getAttribute("sissvoc_endpoint");
        }
        $scope.tree = data.forest;
        // Process browse flags.
        if ('mayResolveResources' in data) {
            makeIRIsActive = true;
        }
        var maySortByNotation = data.maySortByNotation;
        if (maySortByNotation) {
            // Configure sort dropdown options.
            var sort_dropdown = $('#sort_dropdown');
            var sort_dropdown_select = $(sort_dropdown).find('select');
            // Always support label.
            sort_dropdown_select.append(
                '<option label="Label" value="label">' +
                    'Label</option>');
            var defaultSortByNotation = data.defaultSortByNotation;
            var notationFormat = data.notationFormat;
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
            // Pay attention to sort orders here, so that loadChildrenHandler_v3
            // will include them when it makes copies.
            if (defaultSortByNotation) {
                // Add notationSortOrder values
                addSortOrder_v3($scope.tree, 'notationSortOrder');
                sort_dropdown_select.val(notationFormat);
                setEnhanceTitle($scope, notationFormat);
            } else {
                // Add labelSortOrder values
                addSortOrder_v3($scope.tree, 'labelSortOrder');
                setEnhanceTitle($scope, 'label');
            }
        } else {
            setBasicEnhanceTitle($scope);
        }
        $scope.tree.forEach(function(element) {
            postProcessOneResource_v3(element, sissvoc_endpoint);
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
     * This is for version 2 of the format.
     * @param event The name of the event. Not used.
     * @param data The data for the event. Used to get the whole tree.
     * @memberof visualiseCtrl
     */
    function fixConceptRefs_v2(event, data) {
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
                            // postProcessOneConcept_v2), there
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

    /** From a tree node, traverse upwards to find the node's
     * ancestor that is at the top level of the forest.
     * @param node The data for the event. Used to get the whole tree.
     * @returns The node directly below the system root that is the
     * ancestor of node. Returns null, if node is null; returns
     * the system root, if null is the system root.
     * @memberof visualiseCtrl
     */
    function getAncestorNodeAtTopOfForest(node) {
        if (node == null) {
            // Oops, shouldn't be seeing this, but handle it if we do.
            return null;
        }
        var tree = $.ui.fancytree.getTree();
        var root = tree.getRootNode();
        if (node === root) {
            // Already at the "invisible system root node".
            return node;
        }
        var parent = node.getParent();
        // Shouldn't see null when ascending the hierarchy,
        // but fall out if we do see it.
        while (parent !== null && parent !== root) {
            node = parent;
            parent = node.getParent();
        }
        return node;
    }

    /** A queue of nodes, used by fixConceptRefs() and
     * fixConceptRefsVisitor. Used to store nodes created during
     * visiting which themselves need to be visited.
     * @memberof visualiseCtrl
     */
    var loadChildrenRefsQueue;

    /** This is the visitor function invoked by
     * loadChildrenHandler_v3().
     * @param node A node to be visited.
     * @memberof visualiseCtrl
     */
    var loadChildren_v3_Visitor = function(node) {
        // Add node-type-specific additional CSS classes.
        var extraClass = extraCssClass(node.type);
        if (extraClass != null) {
            node.addClass(extraClass);
        }
        // Process node types "..._ref".
        if (node.type.endsWith('_ref')) {
            // if (node.type === 'concept_ref') {
            var clones = node.getCloneList();
            $.each(clones, function(i, c) {
                // Only consider non-cloned nodes further.
                if ('isClonedFromRef' in c) {
                    return;
                }
                // Now determine if we found the right one.
                // Collections are easiest now.
                if (node.type.endsWith('collection_ref') &&
                    (!(c.type.endsWith('collection')))) {
                    return;
                }
                if (node.type === 'concept_ref') {
                    // Only consider concepts further.
                    if (c.type !== 'concept') {
                        return;
                    }
                    // We need to find the "right" original concept.
                    var nodeAncestor = getAncestorNodeAtTopOfForest(node);
                    var cAncestor = getAncestorNodeAtTopOfForest(c);
                    // If node is in a concept scheme, then c
                    // must have the same ancestor.
                    // If node is not in a concept scheme, then c
                    // must also not be in a concept scheme.
                    if ((nodeAncestor.type === 'concept_scheme' &&
                         cAncestor !== nodeAncestor) ||
                        (nodeAncestor.type !== 'concept_scheme' &&
                         cAncestor.type !== 'concept')) {
                        return;
                    }
                    // console.log('Cloned ' + node.title + ';
                    // nodeAncestor title:' + nodeAncestor.title + ';
                    // cAncestor title: ' + cAncestor.title );
                }
                // If we reached this point, c is the correct node
                // to copy.
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
                        var newNode = node.addChildren(newChild);
                        // Set a custom property isClonedFromRef to
                        // prevent multiple additions of the same
                        // child. We test for it above.
                        newNode['isClonedFromRef'] = true;
                        // We must visit this new node.
                        if (newChild.type.endsWith('_ref')) {
                            loadChildrenRefsQueue.push(newNode);
                        }
                    });

                    // When the node was originally processed (by
                    // postProcessOneResource_v3), there
                    // were no children, so the titlesuffix (saying
                    // indicating the number of children) was empty.
                    // Fix up the titlesuffix now.
                    node.data.titlesuffix = ' <i>(' +
                        c.getChildren().length + ')</i>';
                }
            });
        }
    }

    /** This is used as the callback for the loadChildren event.
     * It does any necessary "patching-up" of the nodes
     * after fancytree has created them, but before we want
     * the user to see them.
     * The "patching-up" is as follows.
     * We add node-type-specific custom CSS classes.
     * There may be resources in the incoming data that are of
     * type "..._ref". These are resources that have children,
     * but for which the children aren't included in the data.
     * So we now patch them up by copying across their children
     * (recursively making clones),
     * and updating the node's folder and titlesuffix settings.
     * As this function is the callback for the loadChildren event,
     * it accepts the normal parameters for an event.
     * This is for version 3 of the format.
     * @param event The name of the event. Not used.
     * @param data The data for the event. Used to get the whole tree.
     * @memberof visualiseCtrl
     */
    function loadChildrenHandler_v3(event, data) {
        loadChildrenRefsQueue = [];
        data.tree.visit(loadChildren_v3_Visitor);
        while (loadChildrenRefsQueue.length > 0) {
            var resource_ref = loadChildrenRefsQueue.shift();
            // console.log('Also visiting: ' + concept_ref.getPath());
            resource_ref.visit(loadChildren_v3_Visitor, true);
        }

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
     * For version 2 of the format.
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

    /** Utility function to compare two nodes, based on their labels.
     * For version 3+ of the format.
     * @param a The first node to be compared.
     * @param b The second node to be compared.
     * @returns {number} The result of the comparison:
     *            -1 if a's prefLabel < b's prefLabel
     *            0 if a's and b's prefLabels are equal
     *            1 if a's prefLabel > b's prefLabel.
     * @memberof visualiseCtrl
     */
    function cmpLabel(a, b) {
        var x = a.data.labelSortOrder,
            y = b.data.labelSortOrder;
        return x === y ? 0 : x > y ? 1 : -1;
    }

    /** Utility function to compare two nodes, based on their notations.
     * For version 2+ of the format.
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
     * It also adds the "clone" icon for nodes that should have it.
     * @param $scope The AngularJS controller scope.
     * @memberof visualiseCtrl
     */
    function setBasicEnhanceTitle($scope) {
        $scope.enhanceTitle = function(e, data) {
            data.$title.append(data.node.data.titlesuffix);
            // Add clone icon where needed.
            var datanode = data.node;
            if (datanode.isClone()) {
                data.$title.append(
                    ' <i class="fa fa-clone"></i>');
            }
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
        case 'label':
            // 'label' for version 3+ of the format.
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
                // This callback may be called more than once, so we
                // need the following to make sure that the
                // "enhancements" are only applied once.  We insert
                // <span class="enhanced"></span> within the
                // title. Note: it _doesn't_ work to do just
                // data.$title.addClass('enhanced'), as the top-level
                // span is not iself _removed_ by filtering, but just
                // the inner text is, leaving the class untouched.
                if (data.$title.find('span.enhanced').length > 0) {
                    // We already did this node.
                    return;
                } else {
                    data.$title.prepend('<span class="enhanced"></span>');
                }
                // Customize the titles: add notation as prefix,
                // add icons as appropriate.
                var datanode = data.node;
                var nodedata = datanode.data;
                var notation = nodedata.notation;
                var nodetype = datanode.type;
                // T for top concept.
                if (('isTopConceptOfContext' in nodedata) &&
                    (nodedata.isTopConceptOfContext == true)) {
                    data.$title.append(
                        ' <span class="t-for-top-concept">T</span>');
                }
                // Clones.
                if (datanode.isClone()) {
                    data.$title.append(
                        ' <i class="fa fa-clone"></i>');
                }

                // Notation.
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
                // Second, append child count as suffix.
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
        case 'label':
            root.sortChildren(cmpLabel, true);
            break;
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

    /** Format-specific initialization of the visualisation.
     * This is for version 2 of the format.
     * @param {!object} $scope The AngularJS controller
     *          scope. $scope.tree must contain the tree data as
     *          fetched from the Registry.
     * @param {!object} $scope.tree The tree data as fetched from the
     *          Registry.
     * @memberof visualiseCtrl
     */
    function initialiseVisualisation_v2($scope, data) {
        conceptTreePostProcess_v2($scope, data);

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
            loadChildren: fixConceptRefs_v2,
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
    }

    /** Format-specific initialization of the visualisation.
     * This is for version 3 of the format.
     * @param {!object} $scope The AngularJS controller
     *          scope. $scope.tree must contain the tree data as
     *          fetched from the Registry.
     * @param {!object} $scope.tree The tree data as fetched from the
     *          Registry.
     * @memberof visualiseCtrl
     */
    function initialiseVisualisation_v3($scope, data) {
        conceptTreePostProcess_v3($scope, data);

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
            loadChildren: loadChildrenHandler_v3,
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

        var data = JSON.parse($scope.treedata);
        // Format-specific initialization and configuration.
        if (!('format' in data)) {
            // No "format" field
            initialiseVisualisation_v2($scope, data);
        } else {
            var format = data.format;
            if (format === "3") {
                initialiseVisualisation_v3($scope, data);
            } else {
                // Unknown format!
                return;
            }
        }

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
                                        '<i class="fa fa-clone"></i> ' +
                                        'This ' +
                                        typeAsText(node.type) +
                                        ' is present in multiple locations ' +
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
        // Also, in this case, disable the animation
        // when expanding/collapsing nodes (i.e., for expand/collapse
        // all, and when applying/cancelling a filter).
        if (nodeCount >= 2000) {
            $("#large_vocabulary_warning").show();
            $.ui.fancytree.getTree().setOption("toggleEffect", false);
        }

        /* Show the parts of the colour legend that are required
           based on the vocabulary content. */
        if (showConceptSchemeLegend) {
            $("#concept_scheme_colour_legend").show();
            // In the first draft of the implementation, we only
            // showed the legend if there were any resources other
            // than concepts. We later decided always to show the
            // legend.
            // $("#node_colour_legend").show();
        }
        if (showUnorderedCollectionLegend) {
            $("#unordered_collection_colour_legend").show();
            // $("#node_colour_legend").show();
        }
        if (showOrderedCollectionLegend) {
            $("#ordered_collection_colour_legend").show();
            // $("#node_colour_legend").show();
        }

        // CC-2599 We prevent the browser jumping to the "Filter..."
        // input during page load by defining the input with
        // display:none, then making the input visible only now.
        $("input[name=tree_search]").css("display", "inline");

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
            truncateHeader(window.location.toString());
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
