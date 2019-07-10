<section class='section swatch-gray'>
  <div class="container-fluid element-short-bottom element-short-top">
    <div class="row">

      <div class="col-md-4 col-lg-3 sidebar search-sidebar break">

        <div ng-if="anyFilters()"
             class="panel panel-primary">
          <div class="panel-heading">Current search</div>
          <div class="panel-body swatch-white">
            <div ng-if="filters.q.length > 0">
              <h3>Query</h3>
              <ul class="list-unstyled">
                <li>
                  <a href="" ng-click="clearQuery()"
                     title="[[ filters.q ]]">
                    [[ filters.q | limitTo:25]][[ filters.q.length > 25 ? '...' : '' ]] <i class="fa fa-remove pull-right""></i></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.subject_labels.length > 0">
              <h3>Subject</h3>
              <ul class="list-unstyled">
                <li ng-repeat="filter in filters.subject_labels
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('subject_labels', filter, true)"
                     title="[[ filter ]]">
                    [[ filter | limitTo:25 ]][[ filter.length > 25 ? '...' : '' ]] <i class="fa fa-remove pull-right"></i></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.publisher.length > 0">
              <h3>Publisher</h3>
              <ul class="list-unstyled">
                <li ng-repeat="filter in filters.publisher
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('publisher', filter, true)"
                     title="[[ filter ]]">
                    [[ filter | limitTo:25 ]][[ filter.length > 25 ? '...' : '' ]] <i class="fa fa-remove pull-right"></i></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.language.length > 0">
              <h3>Language</h3>
              <ul class="list-unstyled">
                <li ng-repeat="filter in filters.language
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('language', filter, true)"
                     title="[[ filter ]]">
                    [[ filter | limitTo:25 ]][[ filter.length > 25 ? '...' : '' ]] <i class="fa fa-remove pull-right"></i></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.format.length > 0">
              <h3>Format</h3>
              <ul class="list-unstyled">
                <li ng-repeat="filter in filters.format
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('format', filter, true)"
                     title="[[ filter ]]">
                    [[ filter | limitTo:25 ]][[ filter.length > 25 ? '...' : '' ]] <i class="fa fa-remove pull-right"></i></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.access.length > 0">
              <h3>Access</h3>
              <ul class="list-unstyled">
                <li ng-repeat="filter in filters.access
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('access', filter, true)"
                     title="[[ filter ]]">
                    [[ filter | limitTo:25 ]][[ filter.length > 25 ? '...' : '' ]] <i class="fa fa-remove pull-right"></i></a>
                </li>
              </ul>
            </div>
            <div ng-if="filters.licence.length > 0">
              <h3>Licence</h3>
              <ul class="list-unstyled">
                <li ng-repeat="filter in filters.licence
                               | stringToArray track by $index">
                  <a href=""
                     ng-click="toggleFilter('licence', filter, true)"
                     title="[[ filter ]]">
                    [[ filter | limitTo:25 ]][[ filter.length > 25 ? '...' : '' ]] <i class="fa fa-remove pull-right"></i></a>
                </li>
              </ul>
            </div>
            <button id="button_reset_search"
                    type="button"
                    title="Clear search"
                    class="btn btn-primary pull-right"
                    ng-show="anyFilters()"
                    ng-click="resetSearch()">
              <i class="fa fa-remove"></i>
              Clear search
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

            <div ng-if="facets.subject_labels.length > 0">
              <h3>Subject</h3>
              <ul class="listy">
                <li ng-repeat="facet in facets.subject_labels.slice(0,8)">
                  <input type="checkbox" ng-checked="isFacet('subject_labels',facet.name)"
                         ng-click="toggleFilter('subject_labels', facet.name, true)">
                  <a href=""
                     ng-click="toggleFilter('subject_labels', facet.name, true)"
                     title="[[ facet.name ]]">
                    [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                    <span class="count">([[facet.value]])</span></a>
                </li>

                <div id="moresubject_labels" style="display:none">
                  <li ng-repeat="facet in facets.subject_labels.slice(8)">
                    <input type="checkbox" ng-checked="isFacet('subject_labels',facet.name)"
                           ng-click="toggleFilter('subject_labels', facet.name, true)">
                    <a href=""
                       ng-click="toggleFilter('subject_labels', facet.name, true)"
                       title="[[ facet.name ]]">
                      [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                      <span class="count">([[facet.value]])</span></a>
                  </li>
                </div>
                <a href="" ng-click="toggleFacet('subject_labels')" ng-if="facets.subject_labels.length>8" id="linksubjects"  style="display:block">
                  <small>View
                    <span ng-if="isMoreVisible('subject_labels')">Less...</span>
                    <span ng-if="!isMoreVisible('subject_labels')">More...</span>
                  </small>
                </a>
              </ul>
            </div>
            <div ng-if="facets.publisher.length > 0">
              <h3>Publisher</h3>
              <ul class="listy">
                <li ng-repeat="facet in facets.publisher.slice(0,8)">
                  <input type="checkbox" ng-checked="isFacet('publisher',facet.name)"
                         ng-click="toggleFilter('publisher', facet.name, true)">
                  <a href=""
                     ng-click="toggleFilter('publisher', facet.name, true)"
                     title="[[ facet.name ]]">
                    [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                    <span class="count">([[facet.value]])</span></a>
                </li>

                <div id="morepublisher" style="display:none">
                  <li ng-repeat="facet in facets.publisher.slice(8)">
                    <input type="checkbox" ng-checked="isFacet('publisher',facet.name)"
                           ng-click="toggleFilter('publisher', facet.name, true)">
                    <a href=""
                       ng-click="toggleFilter('publisher', facet.name, true)"
                       title="[[ facet.name ]]">
                      [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                      <span class="count">([[facet.value]])</span></a>
                  </li>
                </div>
                <a href="" ng-click="toggleFacet('publisher')" ng-if="facets.publisher.length>8" id="linkpublisher"  style="display:block">
                  <small>View
                    <span ng-if="isMoreVisible('publisher')">Less...</span>
                    <span ng-if="!isMoreVisible('publisher')">More...</span>
                  </small>
                </a>
              </ul>
            </div>

            <div ng-if="facets.language.length > 0">
              <h3>Language</h3>
              <ul class="listy">
                <li ng-repeat="facet in facets.language.slice(0,8)">
                  <input type="checkbox" ng-checked="isFacet('language',facet.name)"
                         ng-click="toggleFilter('language', facet.name, true)">
                  <a href=""
                     ng-click="toggleFilter('language', facet.name, true)"
                     title="[[ facet.name ]]">
                    [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                    <span class="count">([[facet.value]])</span></a>
                </li>

                <div id="morelanguage" style="display:none">
                  <li ng-repeat="facet in facets.language.slice(8)">
                    <input type="checkbox" ng-checked="isFacet('language',facet.name)"
                           ng-click="toggleFilter('language', facet.name, true)">
                    <a href=""
                       ng-click="toggleFilter('language', facet.name, true)"
                       title="[[ facet.name ]]">
                      [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                      <span class="count">([[facet.value]])</span></a>
                  </li>
                </div>
                <a href="" ng-click="toggleFacet('language')" ng-if="facets.language.length>8" id="linklanguage"  style="display:block">
                  <small>View
                    <span ng-if="isMoreVisible('language')">Less...</span>
                    <span ng-if="!isMoreVisible('language')">More...</span>
                  </small>
                </a>
              </ul>
            </div>

            <div ng-if="facets.format.length > 0">
              <h3>Format</h3>
              <ul class="listy">
                <li ng-repeat="facet in facets.format">
                  <input type="checkbox" ng-checked="isFacet('format',facet.name)"
                         ng-click="toggleFilter('format', facet.name, true)">

                  <a href=""
                     ng-click="toggleFilter('format', facet.name, true)"
                     title="[[ facet.name ]]">
                    [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                    <span class="count">([[facet.value]])</span></a>
                </li>
              </ul>
            </div>
            <div ng-if="facets.access.length > 0">
              <h3>Access</h3>
              <ul class="listy">
                <li ng-repeat="facet in facets.access">
                  <input type="checkbox" ng-checked="isFacet('access',facet.name)"
                         ng-click="toggleFilter('access', facet.name, true)">

                  <a href=""
                     ng-click="toggleFilter('access', facet.name, true)"
                     title="[[ facet.name ]]">
                    [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                    <span class="count">([[facet.value]])</span></a>
                </li>
              </ul>
            </div>
            <div ng-if="facets.licence.length > 0">
              <h3>Licence</h3>
              <ul class="listy">
                <li ng-repeat="facet in facets.licence">
                  <input type="checkbox" ng-checked="isFacet('licence',facet.name)"
                         ng-click="toggleFilter('licence', facet.name, true)">

                  <a href=""
                     ng-click="toggleFilter('licence', facet.name, true)"
                     title="[[ facet.name ]]">
                    [[ facet.name | limitTo: 22]][[ facet.name.length > 22 ? '...' : '' ]]
                    <span class="count">([[facet.value]])</span></a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-8 col-lg-9">

        <div class="vocab-search-result ng-cloak"
             ng-if="result.response.numFound > 0">
          <span class="pull-left"><b>[[ result.response.numFound
              ]]</b>
            <ng-pluralize count="result.response.numFound"
                          when="{'1': 'result',
                                'other': 'results'}">
            </ng-pluralize>
            ([[ result.responseHeader.QTime ]]
            <ng-pluralize count="result.responseHeader.QTime"
                          when="{'1': 'millisecond',
                                'other': 'milliseconds'}" >
            </ng-pluralize>)</span>

          <ul class="pagi element pull-right" >
            <li><small>Page [[ page.cur ]] / [[ page.end ]]</small></li>
            <li ng-if="page.cur!=1"><a href="" ng-click="goto(1)"><span aria-hidden="true">&laquo;</span><span class="sr-only">First</span></a></li>
            <li ng-repeat="x in page.pages"><a ng-class="{'active':page.cur==x}" href="" ng-click="goto(x)">[[x]]</a></li>
            <li ng-if="page.cur!=page.end"><a href="" ng-click="goto(page.end)"><span aria-hidden="true">&raquo;</span><span class="sr-only">Last</span></a></li>
          </ul>
          <div class="clearfix"></div>
        </div>

        <div ng-repeat="doc in result.response.docs" class="animated fadeInLeft vocab-search-result">

          <span class="label label-default pull-right"
                ng-if="doc.status=='deprecated' || doc.status=='DEPRECATED'"
                style="margin-left:5px">deprecated</span>

          <a id="widget-link" class="pull-right" href="" ng-if="doc.widgetable" tip="&lt;b>Widgetable&lt;/b>&lt;br/>This vocabulary can be readily used for resource description or discovery in your system using our vocabulary widget.&lt;br/>&lt;a id='widget-link2' target='_blank' href='{{portal_url('vocabs/page/widget_explorer')}}'>Learn more&lt;/a>">
            <span class="label label-default pull-right"><img class="widget-icon" height="16" width="16"src="{{asset_url('images/cogwheels_white.png', 'core')}}"/> widgetable</span>
          </a>

          <h3 class="break"><a href="[[ base_url ]]viewById/[[ doc.id ]]">[[ doc.title ]]</a></h3>

          <p ng-if="doc.acronym">
            <small>Acronym: [[ doc.acronym ]]</small>
          </p>
          <p ng-if="doc.publisher">
            Publisher: [[ doc.publisher.join(', ') ]]
          </p>
          <p ng-if="getHighlight(doc.id)===false">[[ doc.description | limitTo:500 ]]<span ng-if="doc.description.length > 500">...</span></p>
          <div ng-repeat="(index, content) in getHighlight(doc.id)" class="element-shorter-bottom">
            <div ng-repeat="c in content track by $index" class="element-shortest-bottom">
              <span ng-bind-html="c | trustAsHtml"></span> <span class="muted">(in [[ index | removeSearchTail ]])</span>
            </div>
          </div>
        </div>

        <div class="vocab-search-result ng-cloak"
             ng-if="result.response.numFound > 0">
          <span class="pull-left"><b>[[ result.response.numFound
              ]]</b>
            <ng-pluralize count="result.response.numFound"
                          when="{'1': 'result',
                                'other': 'results'}">
            </ng-pluralize>
            ([[ result.responseHeader.QTime ]]
            <ng-pluralize count="result.responseHeader.QTime"
                          when="{'1': 'millisecond',
                                'other': 'milliseconds'}" >
            </ng-pluralize>)</span>

          <ul class="pagi element pull-right">
            <li><small>Page [[ page.cur ]] / [[ page.end ]]</small></li>
            <li ng-if="page.cur!=1"><a href="" ng-click="goto(1)"><span aria-hidden="true">&laquo;</span><span class="sr-only">First</span></a></li>
            <li ng-repeat="x in page.pages"><a ng-class="{'active':page.cur==x}" href="" ng-click="goto(x)">[[x]]</a></li>
            <li ng-if="page.cur!=page.end"><a href="" ng-click="goto(page.end)"><span aria-hidden="true">&raquo;</span><span class="sr-only">Last</span></a></li>
          </ul>
          <div class="clearfix"></div>
        </div>

        <div ng-if="result.response.numFound == 0" class="animated fadeInLeft vocab-search-result">
          Your search did not return any results
        </div>
      </div>

    </div>

  </div>
</section>
