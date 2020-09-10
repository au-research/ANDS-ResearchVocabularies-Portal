<div id="browse-tree" class="panel swatch-white" ng-if="hasTree">
  <div class="panel-body" style="padding-bottom: 0px">
    <p>
      <a href="https://documentation.ardc.edu.au/display/DOC/Browsing+vocabulary+concepts" target="_blank">
        <i class="fa fa-question-circle" style="color: #7e408a"></i> Using browse
      </a>
    </p>
    <table style="width:100%">
      <tr id="large_vocabulary_warning" style="width:100%; display:none">
        <td colspan="6" style="padding-bottom: 6px"><i class="fa fa-exclamation-triangle"></i>
          &nbsp;Due to the size of this vocabulary, you may experience
          degraded browsing performance.
        </td>
      </tr>
      <tr style="width:100%">

        <td style="width:50%">
          <span >
            <button class="btn btn-primary" id="expandAll" title="Expand all">
              <i class="fa fa-level-down"></i>
            </button>
            <button class="btn btn-primary" id="collapseAll" title="Collapse all">
              <i class="fa fa-level-up"></i>
            </button>
            &nbsp;
          </span>
          <!-- CC-2599 To avoid scrolling to this input during page load,
               set display:none here. This is set to display:inline
               by visualiseCtrl.js at the end of initialization. -->
          <input id="browse_filter"
                 type="text"
                 style="display:none;vertical-align:middle;width:40%"
                 name="tree_search"
                 placeholder="Filter..." autocomplete="off"
                 class="form-control"
                 ><button id="button_reset_filter"
                          class="btn btn-primary btn-primary-warning btn-non-rounded">
            <i class="fa fa-remove"></i>
          </button>
          <span id="tree_filter_matches" style="vertical-align: middle"></span>
          <span id="fancytree-spinner"
                class="fancytree-icon fancytree-icon-loading fancytree-helper-spin"
                style="display:none; vertical-align: middle"></span>
        </td>

        <td style="width:2%"></td>

        <td style="width:25%">
          <span id="sort_dropdown" style="display: none">
            <label>Sort by</label>
            <select name="tree_sort" id="tree_sort"
                    class="form-control caret-for-select"
                    style="display:inline; width: auto; float: none">
            </select>
          </span>
        </td>
        <td style="width:1%"></td>
        <!-- Add margin-top to align vertically -->
        <td style="width:5%; white-space:nowrap">
          <label id="label_show_notation" style="margin-top: 5px; display: none">Show notations&nbsp;</label>
        </td>
        <td class="pull-right" style="width:70px; margin-top: 5px">
          <div id="p_show_notation" class="ands-switch" style="display: none">
            <input type="checkbox"
                   class="ands-switch-checkbox"
                   name="show_notation" id="show_notation">
            <label class="ands-switch-label"
                   onclick="$('#show_notation').prop('checked', function(i, val) { return !val; }).trigger('change')"
                   >
              <span class="ands-switch-inner"></span>
              <span class="ands-switch-switch"></span>
            </label>
          </div>
        </td>

      </tr>
      <tr id="node_colour_legend" style="width:100%">
        <td colspan="6" style="padding-top: 10px; padding-bottom: 6px">
          <span id="concept_colour_legend" style="padding-right: 10px">
            <span class="fancytree-title node-concept"></span> Concept
          </span>
          <span id="concept_scheme_colour_legend" style="display:none; padding-right: 10px">
            <span class="fancytree-title node-concept-scheme"></span> Concept scheme
          </span>
          <span id="unordered_collection_colour_legend" style="display:none; padding-right: 10px">
            <span class="fancytree-title node-unordered-collection"></span> Unordered collection
          </span>
          <span id="ordered_collection_colour_legend" style="display:none">
            <span class="fancytree-title node-ordered-collection"></span> Ordered collection
            <a tip="To preserve the semantics of ordered collections, their members are always
                    displayed in the sequence specified by their member lists.">
              <i class="fa fa-warning" style="color: #7e408a"></i>
            </a>
          </span>
        </td>
      </tr>
    </table>
  </div>
  <div class="panel-body element-no-top maxheight500">
    <!-- The visualization appears here. -->
    <div id="tree">
    </div>
  </div>
</div>
