<div id="browse-tree" class="panel swatch-white" ng-if="hasTree">
  <!-- <div id="browse-tree" class="panel swatch-white" > -->
  <div class="panel-heading clearfix">
    Browse<br />
  </div>
  <div class="panel-body">
    <div class="input-group" style="width:100%">
      <div class="pull-left" style="width:50%">
        <input type="text"
               style="width:60%"
               name="tree_search"
               placeholder="Filter..." autocomplete="off"
               class="form-control"
               >
        <button id="button_reset_filter"
                class="btn btn-primary btn-primary-warning"
                ><i class="fa fa-remove"></i></button>
        <span id="tree_filter_matches"></span>
      </div>
      <!-- Add margin-top to align vertically -->
      <div class="pull-right" style="margin-top:5px;">
        <span id="sort_dropdown" style="display: none">
          <label>Sort by</label>
          <select name="tree_sort" id="tree_sort"
                  class="caret-for-select"
                  >
            <option label="Preferred label"
                    value="prefLabel">Preferred label</option>
          </select>
        </span>
        <span style="padding-right: 2em"></span>
        <span id="p_show_notation" style="display: none">
          <label>Show notations</label>
          <input type="checkbox" name="show_notation" id="show_notation">
        </span>
      </div>
    </div>
    <br />
    <div>
      <button id="expandAll">Expand all</button>
      <button id="collapseAll">Collapse all</button>
    </div>
  </div>
  <div class="panel-body element-no-top maxheight500">
    <!-- The visualization appears here. -->
    <div id="tree">
    </div>

  </div>
</div>
