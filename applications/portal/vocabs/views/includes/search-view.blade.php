<section class='section swatch-gray'>
  <div class="container-fluid element-short-bottom element-short-top">
    <div class="row">

      <div class="col-md-4 col-lg-3 sidebar search-sidebar">

        <div class="panel panel-primary">
          <div class="panel-heading">Current search</div>
          <div class="panel-body swatch-white">
            <div ng-if="filters.q.length > 0">
              <h3>Query</h3>
              <ul class="list-current-search">
                <li>
                  <a href="" ng-click="clearQuery()"
                     title="[[ filters.q ]]">
                    [[ filters.q ]]
                    <span class="clear"><i class="fa fa-remove"></i></span></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.subject_labels.length > 0">
              <h3>Subject</h3>
              <ul class="list-current-search">
                <li ng-repeat="filter in filters.subject_labels
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('subject_labels', filter, true)"
                     title="[[ filter ]]">
                    [[ filter ]]
                    <span class="clear"><i class="fa fa-remove"></i></span></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.publisher.length > 0">
              <h3>Publisher</h3>
              <ul class="list-current-search">
                <li ng-repeat="filter in filters.publisher
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('publisher', filter, true)"
                     title="[[ filter ]]">
                    [[ filter ]]
                    <span class="clear"><i class="fa fa-remove"></i></span></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.language.length > 0">
              <h3>Language</h3>
              <ul class="list-current-search">
                <li ng-repeat="filter in filters.language
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('language', filter, true)"
                     title="[[ filter ]]">
                    [[ filter ]]
                    <span class="clear"><i class="fa fa-remove"></i></span></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.format.length > 0">
              <h3>Format</h3>
              <ul class="list-current-search">
                <li ng-repeat="filter in filters.format
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('format', filter, true)"
                     title="[[ filter ]]">
                    [[ filter ]]
                    <span class="clear"><i class="fa fa-remove"></i></span></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.access.length > 0">
              <h3>Access</h3>
              <ul class="list-current-search">
                <li ng-repeat="filter in filters.access
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('access', filter, true)"
                     title="[[ filter ]]">
                    [[ filter ]]
                    <span class="clear"><i class="fa fa-remove"></i></span></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.licence.length > 0">
              <h3>Licence</h3>
              <ul class="list-current-search">
                <li ng-repeat="filter in filters.licence
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('licence', filter, true)"
                     title="[[ filter ]]">
                    [[ filter ]]
                    <span class="clear"><i class="fa fa-remove"></i></span></a>
                </li>
              </ul>
            </div>
            <button id="button_reset_search"
                    type="button"
                    title="Reset search"
                    class="btn btn-primary pull-right"
                    ng-disabled="!anyFilters()"
                    ng-click="resetSearch()">
              <i class="fa fa-remove"></i>
              Reset search
            </button>
          </div>
        </div>

        <!-- Don't need a more complicated test than
             "result.response.numFound gt 0" here, because
             _every_ result at least has a subject.
        -->
        <div ng-if="result.response.numFound > 0"
             class="panel panel-primary">
          <div class="panel-heading">Refine search results</div>
          <div class="panel-body swatch-white">

            <!-- Subjects -->
            <div ng-if="facets.subject_labels.length > 0">
              <h3>Subject</h3>
              <!-- On focus, text input's box-shadow is 3px high, so
                   set padding-bottom to 5px to avoid it. -->
              <div class="input-group"
                   style="padding-bottom:5px">
                <!-- Use model ".name" so as to filter only on name property -->
                <input id="subject-quick-filter"
                       type="text"
                       autocomplete="off" class="form-control"
                       placeholder="Filter subjects..."
                       ng-model="form.subjectQuickFilter.name">
                <span class="input-group-btn">
                  <button id="button-reset-subject-quick-filter"
                          class="btn btn-primary btn-primary-warning"
                          ng-disabled="!form.subjectQuickFilter.name"
                          ng-click="form.subjectQuickFilter.name = ''">
                    <i class="fa fa-remove"></i>
                  </button>
                </span>
              </div>
              <table class="table-facet-filter">
                <tbody class="facet-scrollbar">
                  <tr ng-repeat="facet in facets.subject_labels |
                                 filter:form.subjectQuickFilter">
                    <td>
                      <!-- padding-left on unselected values so as to
                           align with selected filters, which have a border -->
                      <span ng-if="!facet.extra_count"
                            class="text-nowrap"
                            style="padding-left: 3px">
                        <input
                            type="checkbox"
                            ng-checked="isFacet('subject_labels',facet.name)"
                            ng-click="toggleFilter('subject_labels',
                                  facet.name, true)">
                      </span>
                      <span ng-if="facet.extra_count"
                            class="label label-extra-count">
                        <input type="checkbox"
                               ng-checked="isFacet('subject_labels',facet.name)"
                               ng-click="toggleFilter('subject_labels',
                                     facet.name, true)">
                        <span>+[[facet.extra_count]]</span>
                      </span>
                    </td>
                    <td class="filter-value">
                      <a href=""
                         ng-click="toggleFilter('subject_labels', facet.name, true)"
                         title="[[ facet.name ]]">
                        [[ facet.name ]]</a>
                    </td>
                    <td>
                      <a href=""
                         ng-click="toggleFilter('subject_labels', facet.name, true)"
                         title="[[ facet.name ]]">
                        <span>([[facet.result_count]])</span></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Publishers -->
            <div ng-if="facets.publisher.length > 0">
              <h3>Publisher</h3>
              <!-- On focus, text input's box-shadow is 3px high, so
                   set padding-bottom to 5px to avoid it. -->
              <div class="input-group"
                   style="padding-bottom:5px">
                <!-- Use model ".name" so as to filter only on name property -->
                <input id="publisher-quick-filter"
                       type="text"
                       autocomplete="off" class="form-control"
                       placeholder="Filter publishers..."
                       ng-model="form.publisherQuickFilter.name">
                <span class="input-group-btn">
                  <button id="button-reset-publisher-quick-filter"
                          class="btn btn-primary btn-primary-warning"
                          ng-disabled="!form.publisherQuickFilter.name"
                          ng-click="form.publisherQuickFilter.name = ''">
                    <i class="fa fa-remove"></i>
                  </button>
                </span>
              </div>
              <table class="table-facet-filter">
                <tbody class="facet-scrollbar">
                  <tr ng-repeat="facet in facets.publisher |
                                 filter:form.publisherQuickFilter">
                    <td>
                      <!-- padding-left on unselected values so as to
                           align with selected filters, which have a border -->
                      <span ng-if="!facet.extra_count"
                            class="text-nowrap"
                            style="padding-left: 3px">
                        <input
                            type="checkbox"
                            ng-checked="isFacet('publisher',facet.name)"
                            ng-click="toggleFilter('publisher',
                                  facet.name, true)">
                      </span>
                      <span ng-if="facet.extra_count"
                            class="label label-extra-count">
                        <input type="checkbox"
                               ng-checked="isFacet('publisher',facet.name)"
                               ng-click="toggleFilter('publisher',
                                     facet.name, true)">
                        <span>+[[facet.extra_count]]</span>
                      </span>
                    </td>
                    <td class="filter-value">
                      <a href=""
                         ng-click="toggleFilter('publisher', facet.name, true)"
                         title="[[ facet.name ]]">
                        [[ facet.name ]]</a>
                    </td>
                    <td>
                      <a href=""
                         ng-click="toggleFilter('publisher', facet.name, true)"
                         title="[[ facet.name ]]">
                        <span>([[facet.result_count]])</span></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Languages -->
            <div ng-if="facets.language.length > 0">
              <h3>Language</h3>
              <table class="table-facet-filter">
                <tbody>
                  <tr ng-repeat="facet in facets.language">
                    <td>
                      <!-- padding-left on unselected values so as to
                           align with selected filters, which have a border -->
                      <span ng-if="!facet.extra_count"
                            class="text-nowrap"
                            style="padding-left: 3px">
                        <input type="checkbox"
                               ng-checked="isFacet('language',facet.name)"
                               ng-click="toggleFilter('language', facet.name, true)">
                      </span>
                      <span ng-if="facet.extra_count"
                            class="label label-extra-count">
                        <input type="checkbox"
                               ng-checked="isFacet('language',facet.name)"
                               ng-click="toggleFilter('language', facet.name, true)">
                        <span>+[[facet.extra_count]]</span>
                      </span>
                    </td>
                    <td class="filter-value">
                      <a href=""
                         ng-click="toggleFilter('language', facet.name, true)"
                         title="[[ facet.name ]]">
                        [[ facet.name ]]</a>
                    </td>
                    <td>
                      <a href=""
                         ng-click="toggleFilter('language', facet.name, true)"
                         title="[[ facet.name ]]">
                        <span>([[facet.result_count]])</span></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Formats -->
            <div ng-if="facets.format.length > 0">
              <h3>Format</h3>
              <table class="table-facet-filter">
                <tbody>
                  <tr ng-repeat="facet in facets.format">
                    <td>
                      <!-- padding-left on unselected values so as to
                           align with selected filters, which have a border -->
                      <span ng-if="!facet.extra_count"
                            class="text-nowrap"
                            style="padding-left: 3px">
                        <input type="checkbox"
                               ng-checked="isFacet('format',facet.name)"
                               ng-click="toggleFilter('format', facet.name, true)">
                      </span>
                      <span ng-if="facet.extra_count"
                            class="label label-extra-count">
                        <input type="checkbox"
                               ng-checked="isFacet('format',facet.name)"
                               ng-click="toggleFilter('format', facet.name, true)">
                        <span>+[[facet.extra_count]]</span>
                      </span>
                    </td>
                    <td class="filter-value">
                      <a href=""
                         ng-click="toggleFilter('format', facet.name, true)"
                         title="[[ facet.name ]]">
                        [[ facet.name ]]</a>
                    </td>
                    <td>
                      <a href=""
                         ng-click="toggleFilter('format', facet.name, true)"
                         title="[[ facet.name ]]">
                        <span>([[facet.result_count]])</span></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Access -->
            <div ng-if="facets.access.length > 0">
              <h3>Access</h3>
              <table class="table-facet-filter">
                <tbody>
                  <tr ng-repeat="facet in facets.access">
                    <td>
                      <!-- padding-left on unselected values so as to
                           align with selected filters, which have a border -->
                      <span ng-if="!facet.extra_count"
                            class="text-nowrap"
                            style="padding-left: 3px">
                        <input type="checkbox"
                               ng-checked="isFacet('access',facet.name)"
                               ng-click="toggleFilter('access', facet.name, true)">
                      </span>
                      <span ng-if="facet.extra_count"
                            class="label label-extra-count">
                        <input type="checkbox"
                               ng-checked="isFacet('access',facet.name)"
                               ng-click="toggleFilter('access', facet.name, true)">
                        <span>+[[facet.extra_count]]</span>
                      </span>
                    </td>
                    <td class="filter-value">
                      <a href=""
                         ng-click="toggleFilter('access', facet.name, true)"
                         title="[[ facet.name ]]">
                        [[ facet.name ]]</a>
                    </td>
                    <td>
                      <a href=""
                         ng-click="toggleFilter('access', facet.name, true)"
                         title="[[ facet.name ]]">
                        <span>([[facet.result_count]])</span></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Licences -->
            <div ng-if="facets.licence.length > 0">
              <h3>Licence</h3>
              <table class="table-facet-filter">
                <tbody>
                  <tr ng-repeat="facet in facets.licence">
                    <td>
                      <!-- padding-left on unselected values so as to
                           align with selected filters, which have a border -->
                      <span ng-if="!facet.extra_count"
                            class="text-nowrap"
                            style="padding-left: 3px">
                        <input type="checkbox" ng-checked="isFacet('licence',facet.name)"
                               ng-click="toggleFilter('licence', facet.name, true)">
                      </span>
                      <span ng-if="facet.extra_count"
                            class="label label-extra-count">
                        <input type="checkbox" ng-checked="isFacet('licence',facet.name)"
                               ng-click="toggleFilter('licence', facet.name, true)">
                        <span>+[[facet.extra_count]]</span>
                      </span>
                    </td>
                    <td class="filter-value">
                      <a href=""
                         ng-click="toggleFilter('licence', facet.name, true)"
                         title="[[ facet.name ]]">
                        [[ facet.name ]]</a>
                    </td>
                    <td>
                      <a href=""
                         ng-click="toggleFilter('licence', facet.name, true)"
                         title="[[ facet.name ]]">
                        <span>([[facet.result_count]])</span></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

      <div class="col-md-8 col-lg-9">

        <div class="vocab-search-result swatch-white ng-cloak"
             ng-if="result.response.numFound > 0">
          <table width="100%">
            <tbody>
              <tr>
                <td class="text-nowrap">
                  <b>[[ result.response.numFound
                    ]]</b>
                  <ng-pluralize count="result.response.numFound"
                                when="{'1': 'result',
                                       'other': 'results'}">
                  </ng-pluralize>
                  ([[ result.responseHeader.QTime ]]
                  <ng-pluralize count="result.responseHeader.QTime"
                                when="{'1': 'millisecond',
                                       'other': 'milliseconds'}" >
                  </ng-pluralize>)
                </td>
                <td style="width:60%"></td>
                <td style="padding-right: 4px">
                  <select id="sort-select" name="sort-select"
                          class="form-control caret-for-select"
                          style="width:auto"
                          ng-options="option.id as
                              ('Sort by: ' + option.name)
                              for option in sortOptions"
                          ng-model="form.sort"
                          ng-change="search()">
                  </select>
                </td>
                <td style="padding-right: 4px">
                  <select id="show-select" name="show-select"
                          class="form-control caret-for-select"
                          style="width:auto"
                          ng-model="filters.pp"
                          ng-change="search()">
                    <option value="15">Show: 15</option>
                    <option value="30">Show: 30</option>
                    <option value="60">Show: 60</option>
                    <option value="100">Show: 100</option>
                  </select>
                </td>

                <td class="text-nowrap"
                    style="padding: 8px"><small>Page [[ page.cur ]] / [[ page.end ]]</small></td>
                <td ng-if="page.cur!=1"
                    style="padding: 4px"><a href="" ng-click="goto(1)"><span aria-hidden="true">&laquo;</span><span class="sr-only">First</span></a></td>
                <td ng-repeat="x in page.pages"
                    class="pagi"><a ng-class="{'active':page.cur==x}" href="" ng-click="goto(x)">[[x]]</a></td>
                <td ng-if="page.cur!=page.end"
                    style="padding: 4px"><a href="" ng-click="goto(page.end)"><span aria-hidden="true">&raquo;</span><span class="sr-only">Last</span></a></td>

              </tr>
            </tbody>
          </table>
        </div>

        <div ng-repeat="doc in result.response.docs" class="animated fadeInLeft vocab-search-result">

          <span class="label label-default pull-right"
                ng-if="doc.status=='deprecated' || doc.status=='DEPRECATED'"
                style="margin-left:5px">deprecated</span>

          <a id="widget-link" class="pull-right" href="" ng-if="doc.widgetable" tip="&lt;b>Widgetable&lt;/b>&lt;br/>This vocabulary can be readily used for resource description or discovery in your system using our vocabulary widget.&lt;br/>&lt;a id='widget-link2' target='_blank' href='{{portal_url('vocabs/page/widget_explorer')}}'>Learn more&lt;/a>">
            <span class="label label-default pull-right"><img class="widget-icon" height="16" width="16" src="{{asset_url('images/cogwheels_white.png', 'core')}}"/> widgetable</span>
          </a>

          <h3 class="break"><a ng-click="unsetScrollRestoration()" href="[[ base_url ]]viewById/[[ doc.id ]]">[[ doc.title ]]</a></h3>

          <p ng-if="doc.acronym">
            <small>Acronym: [[ doc.acronym ]]</small>
          </p>
          <p ng-if="doc.publisher">
            Publisher: [[ doc.publisher.join(', ') ]]
          </p>
          <p style="margin-bottom:0px" ng-if="hasHighlight(doc.id)===false">[[ doc.description | limitTo:500 ]]<span ng-if="doc.description.length > 500">...</span></p>
          <div ng-repeat="(index, content) in getHighlight(doc.id)">
            <div ng-repeat="c in content track by $index">
              <span ng-bind-html="c | processSolrHighlight"></span> <span class="muted">(in [[ index ]])</span>
            </div>
          </div>
          <div ng-if="doc.last_updated" class="pull-right"
               style="line-height: 1">
            <small>Last updated: [[ doc.last_updated ]]</small>
          </div>
          <div class="clearfix">
          </div>
        </div>

        <div class="vocab-search-result swatch-white ng-cloak"
             ng-if="result.response.numFound > 0">
          <table width="100%">
            <tbody>
              <tr>
                <td class="text-nowrap">
                  <b>[[ result.response.numFound
                    ]]</b>
                  <ng-pluralize count="result.response.numFound"
                                when="{'1': 'result',
                                       'other': 'results'}">
                  </ng-pluralize>
                  ([[ result.responseHeader.QTime ]]
                  <ng-pluralize count="result.responseHeader.QTime"
                                when="{'1': 'millisecond',
                                       'other': 'milliseconds'}" >
                  </ng-pluralize>)
                </td>
                <td style="width:60%"></td>
                <td style="padding-right: 4px">
                  <select id="sort-select" name="sort-select"
                          class="form-control caret-for-select"
                          style="width:auto"
                          ng-options="option.id as
                              ('Sort by: ' + option.name)
                              for option in sortOptions"
                          ng-model="form.sort"
                          ng-change="search()">
                  </select>
                </td>
                <td style="padding-right: 4px">
                  <select id="show-select" name="show-select"
                          class="form-control caret-for-select"
                          style="width:auto"
                          ng-model="filters.pp"
                          ng-change="search()">
                    <option value="15">Show: 15</option>
                    <option value="30">Show: 30</option>
                    <option value="60">Show: 60</option>
                    <option value="100">Show: 100</option>
                  </select>
                </td>

                <td class="text-nowrap"
                    style="padding: 8px"><small>Page [[ page.cur ]] / [[ page.end ]]</small></td>
                <td ng-if="page.cur!=1"
                    style="padding: 4px"><a href="" ng-click="goto(1)"><span aria-hidden="true">&laquo;</span><span class="sr-only">First</span></a></td>
                <td ng-repeat="x in page.pages"
                    class="pagi"><a ng-class="{'active':page.cur==x}" href="" ng-click="goto(x)">[[x]]</a></td>
                <td ng-if="page.cur!=page.end"
                    style="padding: 4px"><a href="" ng-click="goto(page.end)"><span aria-hidden="true">&raquo;</span><span class="sr-only">Last</span></a></td>

              </tr>
            </tbody>
          </table>
        </div>

        <div ng-if="result.response.numFound == 0" class="animated fadeInLeft vocab-search-result">
          Your search did not return any results
        </div>
      </div>

    </div>

  </div>
</section>
