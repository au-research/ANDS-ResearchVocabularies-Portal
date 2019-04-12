<div id="browse-tree" class="panel swatch-white" ng-if="hasTree">
  <div class="panel-body" style="padding-bottom: 0px">
    <table style="width:100%">
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
          <input type="text"
                 style="display:inline;vertical-align:middle;width:40%"
                 name="tree_search"
                 placeholder="Filter..." autocomplete="off"
                 class="form-control"
                 ><button id="button_reset_filter"
                  class="btn btn-primary btn-primary-warning">
            <i class="fa fa-remove"></i>
          </button>
          <span id="tree_filter_matches" style="vertical-align: middle"></span>
        </td>

        <td style="width:9%"></td>

        <td style="width:25%">
            <span id="sort_dropdown" style="display: none">
              <label>Sort by</label>
              <select name="tree_sort" id="tree_sort"
                      class="form-control caret-for-select"
                      style="display:inline; width: auto; float: none">
                <option label="Preferred label"
                        value="prefLabel">Preferred label</option>
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
    </table>
  </div>
  <div class="panel-body element-no-top maxheight500">
    <!-- The visualization appears here. -->
    <div id="tree">
    </div>
  </div>
</div>
