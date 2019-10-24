@section('modal-popup')
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close"
                data-dismiss="modal"
                aria-label="Close">
          <span aria-hidden="true">&times;</span></button>
        <span ng-if="doc.sissvoc_endpoint" class="pull-right"
              style="padding-right: 8px">
          <a ng-click="unsetScrollRestoration()"
             target="_blank"
             href="[[ doc.sissvoc_endpoint ]]/resource?uri=[[ doc.iri ]]"><i class="fa fa-sm fa-share-alt"></i> View resource as linked data</a>
          &emsp;
        </span>
        <h4 class="modal-title" id="myModalLabel">[[ doc.title ]]</h4>
      </div>
      <div class="modal-body">
        <table class="table-resource">
          <tbody>
            <tr ng-if="doc.top_concept">
              <td></td>
              <td>This is a manually-entered concept in the
                vocabulary's metadata.</td>
            </tr>
            <tr ng-if="doc.iri">
              <th>IRI</th><td>[[ doc.iri ]]</td>
            </tr>

            <tr ng-repeat="rdfType in doc.rdf_type
                           track by $index">
              <th>RDF type</th><td>[[ rdfTypePretty(rdfType) ]]</td>
            </tr>

            <tr ng-repeat="rdfsLabel in doc.rdfs_label_all
                           track by $index">
              <th>RDF Schema label</th><td>[[ rdfsLabel ]]</td>
            </tr>

            <tr ng-repeat="prefLabel in doc.skos_prefLabel_all
                           track by $index">
              <th>SKOS prefLabel</th><td>[[ prefLabel ]]</td>
            </tr>

            <tr ng-repeat="altLabel in doc.skos_altLabel_all
                           track by $index">
              <th>SKOS altLabel</th><td>[[ altLabel ]]</td>
            </tr>

            <tr ng-repeat="hiddenLabel in doc.skos_hiddenLabel_all
                           track by $index">
              <th>SKOS hiddenLabel</th><td>[[ hiddenLabel ]]</td>
            </tr>

            <tr ng-repeat="dcTitle in doc.dcterms_title_all
                           track by $index">
              <th>DC Terms title</th><td>[[ dcTitle ]]</td>
            </tr>

            <tr ng-repeat="definition in doc.skos_definition_all
                           track by $index">
              <th>SKOS definition</th>
              <td style="white-space: pre-line">[[ definition ]]</td>
            </tr>

            <tr ng-repeat="dcDescription in doc.dcterms_description_all
                           track by $index">
              <th>DC Terms description</th>
              <td style="white-space: pre-line">[[ dcDescription ]]</td>
            </tr>

            <tr ng-repeat="notation in doc.skos_notation
                           track by $index">
              <th>SKOS notation</th><td>[[ notation ]]</td>
            </tr>

            <tr>
              <th>Vocabulary</th>
              <td><a ng-click="unsetScrollRestoration()"
                     target="_blank"
                     href="[[ base_url ]]viewById/[[ doc.vocabulary_id ]]">[[ doc.vocabulary_title ]]</a></td>
            </tr>
            <tr>
              <th>Vocabulary
                <ng-pluralize count="doc.publisher.length"
                              when="{'1': 'publisher',
                                     'other': 'publishers'}">
                </ng-pluralize></th>
              <td>[[ doc.publisher.join(', ') ]]</td>
            </tr>
            <tr>
              <th>Version</th>
              <td>[[ doc.version_title ]]
                ([[ versionStatusPretty(doc.status) ]])</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
@stop

<section class='section swatch-gray'>
  <div class="container-fluid element-short-bottom element-short-top">
    <div class="row">

      <div class="col-md-4 col-lg-3 sidebar search-sidebar">

        <div class="panel panel-primary">
          <div class="panel-heading">Current search</div>
          <div class="panel-body swatch-white">

            <!-- Breadbox contents for vocabularies tab -->
            <div ng-if="filters.activeTab == 'vocabularies'">
              <div ng-if="filters.q.length > 0">
                <h3>Query</h3>
                <ul class="list-current-search">
                  <li>
                    <a href="" ng-click="clearQuery()"
                       title="[[ filters.q ]]">
                      [[ filters.q ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.v_subject_labels.length > 0">
                <h3>Subject</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.v_subject_labels
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('v_subject_labels', filter, true)"
                       title="[[ filter ]]">
                      [[ filter ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.v_publisher.length > 0">
                <h3>Publisher</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.v_publisher
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('v_publisher', filter, true)"
                       title="[[ filter ]]">
                      [[ filter ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.v_language.length > 0">
                <h3>Language</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.v_language
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('v_language', filter, true)"
                       title="[[ filter ]]">
                      [[ filter ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.v_format.length > 0">
                <h3>Format</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.v_format
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('v_format', filter, true)"
                       title="[[ filter ]]">
                      [[ filter ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.v_access.length > 0">
                <h3>Access</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.v_access
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('v_access', filter, true)"
                       title="[[ filter ]]">
                      [[ filter ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.v_licence.length > 0">
                <h3>Licence</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.v_licence
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('v_licence', filter, true)"
                       title="[[ filter ]]">
                      [[ filter ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
            </div>  <!-- End of breadbox contents for vocabularies tab -->

            <!-- Breadbox contents for resources tab -->
            <div ng-if="filters.activeTab == 'resources'">
              <div ng-if="filters.q.length > 0">
                <h3>Query</h3>
                <ul class="list-current-search">
                  <li>
                    <a href="" ng-click="clearQuery()"
                       title="[[ filters.q ]]">
                      [[ filters.q ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.r_subject_labels.length > 0">
                <h3>Subject</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.r_subject_labels
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('r_subject_labels', filter, true)"
                       title="[[ filter ]]">
                      [[ filter ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.r_publisher.length > 0">
                <h3>Publisher</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.r_publisher
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('r_publisher', filter, true)"
                       title="[[ filter ]]">
                      [[ filter ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.r_rdf_type.length > 0">
                <h3>RDF Type</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.r_rdf_type
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('r_rdf_type', filter, true)"
                       title="[[ rdfTypePretty(filter) ]]">
                      [[ rdfTypePretty(filter) ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <div ng-if="filters.r_status.length > 0">
                <h3>Version status</h3>
                <ul class="list-current-search">
                  <li ng-repeat="filter in filters.r_status
                                 | stringToArray track by $index">
                    <a href=""
                       ng-click="toggleFilter('r_status', filter, true)"
                       title="[[ versionStatusPretty(filter) ]]">
                      [[ versionStatusPretty(filter) ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
              <!-- TODO: language  -->
              <div ng-if="filters.r_collapse_expand && filters.r_collapse_expand != 'vocabularyIdIri'">
                <h3>Collapse</h3>
                <ul class="list-current-search">
                  <li>
                    <a href=""
                       ng-click="resetCollapse()"
                       title="[[ collapseOptionPretty() ]]">
                      [[ collapseOptionPretty() ]]
                      <span class="clear">
                        <i class="fa fa-remove"></i></span></a>
                  </li>
                </ul>
              </div>
            </div>  <!-- End of breadbox contents for vocabularies tab -->

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
        </div> <!-- End of breadbox div panel/panel-primary -->


        <!-- Facet/filter contents for vocabularies tab -->
        <div ng-if="filters.activeTab == 'vocabularies'">

          <!-- Don't need a more complicated test than
               "vocabularies.result.response.numFound gt 0" here, because
               _every_ result at least has a subject.
          -->
          <div ng-if="vocabularies.result.response.numFound > 0"
               class="panel panel-primary">
            <div class="panel-heading">Refine vocabulary search results</div>
            <div class="panel-body swatch-white">

              <!-- Subjects -->
              <div ng-if="vocabularies.facets.subject_labels.length > 0">
                <h3>Subject</h3>
                <!-- On focus, text input's box-shadow is 3px high, so
                     set padding-bottom to 5px to avoid it. -->
                <div class="input-group"
                     style="padding-bottom:5px">
                  <!-- Use model ".name" so as to filter only on name
                       property -->
                  <input id="subject-quick-filter"
                         type="text"
                         autocomplete="off" class="form-control"
                         placeholder="Filter subjects..."
                         ng-model="form.v_subjectQuickFilter.name">
                  <span class="input-group-btn">
                    <button id="button-reset-subject-quick-filter"
                            class="btn btn-primary btn-primary-warning"
                            ng-disabled="!form.v_subjectQuickFilter.name"
                            ng-click="form.v_subjectQuickFilter.name = ''">
                      <i class="fa fa-remove"></i>
                    </button>
                  </span>
                </div>
                <table class="table-facet-filter">
                  <tbody class="facet-scrollbar">
                    <tr ng-repeat="facet in vocabularies.facets.subject_labels |
                                   filter:form.v_subjectQuickFilter">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input
                              type="checkbox"
                              ng-checked="isFacet('v_subject_labels',
                                    facet.name)"
                              ng-click="toggleFilter('v_subject_labels',
                                    facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_subject_labels',
                                       facet.name)"
                                 ng-click="toggleFilter('v_subject_labels',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('v_subject_labels',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          [[ facet.name ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('v_subject_labels',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Publishers -->
              <div ng-if="vocabularies.facets.publisher.length > 0">
                <h3>Publisher</h3>
                <!-- On focus, text input's box-shadow is 3px high, so
                     set padding-bottom to 5px to avoid it. -->
                <div class="input-group"
                     style="padding-bottom:5px">
                  <!-- Use model ".name" so as to filter only on name
                       property -->
                  <input id="publisher-quick-filter"
                         type="text"
                         autocomplete="off" class="form-control"
                         placeholder="Filter publishers..."
                         ng-model="form.v_publisherQuickFilter.name">
                  <span class="input-group-btn">
                    <button id="button-reset-publisher-quick-filter"
                            class="btn btn-primary btn-primary-warning"
                            ng-disabled="!form.v_publisherQuickFilter.name"
                            ng-click="form.v_publisherQuickFilter.name = ''">
                      <i class="fa fa-remove"></i>
                    </button>
                  </span>
                </div>
                <table class="table-facet-filter">
                  <tbody class="facet-scrollbar">
                    <tr ng-repeat="facet in vocabularies.facets.publisher |
                                   filter:form.v_publisherQuickFilter">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input
                              type="checkbox"
                              ng-checked="isFacet('v_publisher',facet.name)"
                              ng-click="toggleFilter('v_publisher',
                                    facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_publisher',facet.name)"
                                 ng-click="toggleFilter('v_publisher',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('v_publisher',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          [[ facet.name ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('v_publisher',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Languages -->
              <div ng-if="vocabularies.facets.language.length > 0">
                <h3>Language</h3>
                <table class="table-facet-filter">
                  <tbody>
                    <tr ng-repeat="facet in vocabularies.facets.language">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_language',facet.name)"
                                 ng-click="toggleFilter('v_language',
                                       facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_language',facet.name)"
                                 ng-click="toggleFilter('v_language',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('v_language',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          [[ facet.name ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('v_language',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Formats -->
              <div ng-if="vocabularies.facets.format.length > 0">
                <h3>Format</h3>
                <table class="table-facet-filter">
                  <tbody>
                    <tr ng-repeat="facet in vocabularies.facets.format">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_format',facet.name)"
                                 ng-click="toggleFilter('v_format',
                                       facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_format',facet.name)"
                                 ng-click="toggleFilter('v_format',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('v_format',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          [[ facet.name ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('v_format',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Access -->
              <div ng-if="vocabularies.facets.access.length > 0">
                <h3>Access</h3>
                <table class="table-facet-filter">
                  <tbody>
                    <tr ng-repeat="facet in vocabularies.facets.access">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_access',facet.name)"
                                 ng-click="toggleFilter('v_access',
                                       facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_access',facet.name)"
                                 ng-click="toggleFilter('v_access',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('v_access', facet.name, true)"
                           title="[[ facet.name ]]">
                          [[ facet.name ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('v_access', facet.name, true)"
                           title="[[ facet.name ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Licences -->
              <div ng-if="vocabularies.facets.licence.length > 0">
                <h3>Licence</h3>
                <table class="table-facet-filter">
                  <tbody>
                    <tr ng-repeat="facet in vocabularies.facets.licence">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_licence',facet.name)"
                                 ng-click="toggleFilter('v_licence',
                                       facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('v_licence',facet.name)"
                                 ng-click="toggleFilter('v_licence',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('v_licence',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          [[ facet.name ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('v_licence',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div> <!-- End of facet/filter contents for vocabularies tab -->

        <!-- Facet/filter contents for resources tab -->
        <div ng-if="filters.activeTab == 'resources'">

          <!-- Don't need a more complicated test than
               "resources.result.response.numFound gt 0" here, because
               _every_ result at least has a subject.
          -->
          <div ng-if="resources.result.response.numFound > 0"
               class="panel panel-primary">
            <div class="panel-heading">Refine resource search results</div>
            <div class="panel-body swatch-white">

              <!-- Subjects -->
              <div ng-if="resources.facets.subject_labels.length > 0">
                <h3>Subject</h3>
                <!-- On focus, text input's box-shadow is 3px high, so
                     set padding-bottom to 5px to avoid it. -->
                <div class="input-group"
                     style="padding-bottom:5px">
                  <!-- Use model ".name" so as to filter only on name
                       property -->
                  <input id="subject-quick-filter"
                         type="text"
                         autocomplete="off" class="form-control"
                         placeholder="Filter subjects..."
                         ng-model="form.r_subjectQuickFilter.name">
                  <span class="input-group-btn">
                    <button id="button-reset-subject-quick-filter"
                            class="btn btn-primary btn-primary-warning"
                            ng-disabled="!form.r_subjectQuickFilter.name"
                            ng-click="form.r_subjectQuickFilter.name = ''">
                      <i class="fa fa-remove"></i>
                    </button>
                  </span>
                </div>
                <table class="table-facet-filter">
                  <tbody class="facet-scrollbar">
                    <tr ng-repeat="facet in resources.facets.subject_labels |
                                   filter:form.r_subjectQuickFilter">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input
                              type="checkbox"
                              ng-checked="isFacet('r_subject_labels',
                                    facet.name)"
                              ng-click="toggleFilter('r_subject_labels',
                                    facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('r_subject_labels',
                                       facet.name)"
                                 ng-click="toggleFilter('r_subject_labels',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('r_subject_labels',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          [[ facet.name ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('r_subject_labels',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Publishers -->
              <div ng-if="resources.facets.publisher.length > 0">
                <h3>Publisher</h3>
                <!-- On focus, text input's box-shadow is 3px high, so
                     set padding-bottom to 5px to avoid it. -->
                <div class="input-group"
                     style="padding-bottom:5px">
                  <!-- Use model ".name" so as to filter only on name
                       property -->
                  <input id="publisher-quick-filter"
                         type="text"
                         autocomplete="off" class="form-control"
                         placeholder="Filter publishers..."
                         ng-model="form.r_publisherQuickFilter.name">
                  <span class="input-group-btn">
                    <button id="button-reset-publisher-quick-filter"
                            class="btn btn-primary btn-primary-warning"
                            ng-disabled="!form.r_publisherQuickFilter.name"
                            ng-click="form.r_publisherQuickFilter.name = ''">
                      <i class="fa fa-remove"></i>
                    </button>
                  </span>
                </div>
                <table class="table-facet-filter">
                  <tbody class="facet-scrollbar">
                    <tr ng-repeat="facet in resources.facets.publisher |
                                   filter:form.r_publisherQuickFilter">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input
                              type="checkbox"
                              ng-checked="isFacet('r_publisher',facet.name)"
                              ng-click="toggleFilter('r_publisher',
                                    facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('r_publisher',facet.name)"
                                 ng-click="toggleFilter('r_publisher',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('r_publisher',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          [[ facet.name ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('r_publisher',
                                 facet.name, true)"
                           title="[[ facet.name ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- RDF Type -->
              <div ng-if="resources.facets.rdf_type.length > 0">
                <h3>RDF Type</h3>
                <table class="table-facet-filter">
                  <tbody>
                    <tr ng-repeat="facet in resources.facets.rdf_type">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input type="checkbox"
                                 ng-checked="isFacet('r_rdf_type',facet.name)"
                                 ng-click="toggleFilter('r_rdf_type',
                                       facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('r_rdf_type',facet.name)"
                                 ng-click="toggleFilter('r_rdf_type',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('r_rdf_type',
                                 facet.name, true)"
                           title="[[ rdfTypePretty(facet.name) ]]">
                          [[ rdfTypePretty(facet.name) ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('r_rdf_type',
                                 facet.name, true)"
                           title="[[ rdfTypePretty(facet.name) ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Version status -->
              <div ng-if="resources.facets.status.length > 0">
                <h3>Version status</h3>
                <table class="table-facet-filter">
                  <tbody>
                    <tr ng-repeat="facet in resources.facets.status">
                      <td>
                        <!-- padding-left on unselected values so as to
                             align with selected filters, which have a
                             border -->
                        <span ng-if="!facet.extra_count"
                              class="text-nowrap"
                              style="padding-left: 3px">
                          <input type="checkbox"
                                 ng-checked="isFacet('r_status',facet.name)"
                                 ng-click="toggleFilter('r_status',
                                       facet.name, true)">
                        </span>
                        <span ng-if="facet.extra_count"
                              class="label label-extra-count">
                          <input type="checkbox"
                                 ng-checked="isFacet('r_status',facet.name)"
                                 ng-click="toggleFilter('r_status',
                                       facet.name, true)">
                          <span>+[[facet.extra_count]]</span>
                        </span>
                      </td>
                      <td class="filter-value">
                        <a href=""
                           ng-click="toggleFilter('r_status',
                                 facet.name, true)"
                           title="[[ versionStatusPretty(facet.name) ]]">
                          [[ versionStatusPretty(facet.name) ]]</a>
                      </td>
                      <td>
                        <a href=""
                           ng-click="toggleFilter('r_status',
                                 facet.name, true)"
                           title="[[ versionStatusPretty(facet.name) ]]">
                          <span>([[facet.result_count]])</span></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- TODO: language  -->

            </div>
          </div>
        </div>  <!-- End of facet/filter contents for resources tab -->

      </div> <!-- End of sidebar -->

      <div class="col-md-8 col-lg-9">

        <div class="vocab-search-result ng-cloak">

          <div class="pull-right" style="width: auto">
            <table>
              <tbody>
                <tr>
                  <td ng-if="activeContainer().result.response.numFound > 0"
                      style="padding-right: 4px; vertical-align: bottom">
                    <select id="sort-select" name="sort-select"
                            class="form-control caret-for-select"
                            style="width:auto; display: inline"
                            ng-options="option.id as
                                ('Sort by: ' + option.name)
                                for option in sortOptions"
                            ng-model="form.sort"
                            ng-change="search()">
                    </select>
                  </td>
                  <td ng-if="activeContainer().result.response.numFound > 0"
                      style="padding-right: 4px; vertical-align: bottom">
                    <select id="show-select" name="show-select"
                            class="form-control caret-for-select"
                            style="width:auto; display: inline"
                            ng-model="filters.pp"
                            ng-change="search()">
                      <option value="15">Show: 15</option>
                      <option value="30">Show: 30</option>
                      <option value="60">Show: 60</option>
                      <option value="100">Show: 100</option>
                    </select>
                  </td>

                  <td ng-if="activeContainer().result.response.numFound > 0"
                      class="text-nowrap"
                      style="padding: 8px"><small>Page
                    [[ activeContainer().page.cur ]] /
                    [[ activeContainer().page.end ]]</small></td>
                  <td ng-if="activeContainer().result.response.numFound > 0 &&
                             activeContainer().page.cur!=1"
                      style="padding: 4px"><a href="" ng-click="goto(1)"><span aria-hidden="true">&laquo;</span><span class="sr-only">First</span></a></td>
                  <td ng-if="activeContainer().result.response.numFound > 0"
                      ng-repeat="x in activeContainer().page.pages"
                      class="pagi"><a ng-class="{'active':activeContainer().page.cur==x}" href="" ng-click="goto(x)">[[x]]</a></td>
                  <td ng-if="activeContainer().result.response.numFound > 0 &&
                             activeContainer().page.cur!=activeContainer().page.end"
                      style="padding: 4px"><a href="" ng-click="goto(activeContainer().page.end)"><span aria-hidden="true">&raquo;</span><span class="sr-only">Last</span></a></td>
                </tr>
              </tbody>
            </table>

          </div>

          <uib-tabset active="filters.activeTab">
            <uib-tab index="'vocabularies'" select="tabChanged('vocabularies')">
              <uib-tab-heading>
                Vocabularies
                ([[ vocabularies.result.response.numFound ]])
              </uib-tab-heading>

              <!-- Search results for vocabularies tab -->

              <div ng-repeat="doc in vocabularies.result.response.docs"
                   class="animated fadeInLeft vocab-search-result
                              search-results-vocabularies">

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
                  <ng-pluralize count="doc.publisher.length"
                                when="{'1': 'Publisher',
                                       'other': 'Publishers'}">
                  </ng-pluralize>:
                  [[ doc.publisher.join(', ') ]]
                </p>
                <p style="margin-bottom:0px"
                   ng-if="hasHighlight(vocabularies, doc.id)===false">[[ doc.description | limitTo:500 ]]<span ng-if="doc.description.length > 500">...</span></p>
                <div ng-repeat="(index, content) in
                                getHighlight(vocabularies, doc.id)">
                  <div ng-repeat="c in content track by $index">
                    <span ng-bind-html="c | processSolrHighlight"></span>
                    <span class="muted">(in [[ index ]])</span>
                  </div>
                </div>
                <div ng-if="doc.last_updated" class="pull-right"
                     style="line-height: 1">
                  <small>Last updated: [[ doc.last_updated ]]</small>
                </div>
                <div class="clearfix">
                </div>

              </div> <!-- End search results for vocabularies tab -->

            </uib-tab>
            <uib-tab index="'resources'" select="tabChanged('resources')">
              <uib-tab-heading>
                Concepts, etc.
                ([[ resources.result.response.numFound ]])
              </uib-tab-heading>

              <!-- Search results for resources tab -->
              <div ng-repeat="doc in resources.result.response.docs"
                   class="animated fadeInLeft vocab-search-result
                              search-results-resources">
                <span ng-repeat="type in doc.rdf_type"
                      class="label label-default pull-right">[[ rdfTypePrettyForLozenge(type) ]]</span>

                <h3 class="break"><a ng-click="unsetScrollRestoration()"
                                     href="[[ base_url ]]viewById/[[ doc.vocabulary_id ]]">[[ doc.title ]]</a></h3>

                <p ng-if="doc.top_concept" class="small">
                  This is a manually-entered concept in the
                  vocabulary's metadata.
                </p>

                <p ng-if="doc.iri" class="small">
                  <b>IRI:</b> [[ doc.iri ]]
                </p>

                <!-- Show full fields, if no highlighting. -->
                <div ng-if="hasHighlight(resources, doc.id)===false">

                  <p ng-repeat="rdfsLabel in doc.rdfs_label_all
                                track by $index">
                    <b>RDF Schema label:</b> [[ rdfsLabel ]]
                  </p>

                  <p ng-repeat="prefLabel in doc.skos_prefLabel_all
                                track by $index">
                    <b>SKOS prefLabel:</b> [[ prefLabel ]]
                  </p>

                  <p ng-if="doc.skos_altLabel_all">
                    <b>SKOS
                      <ng-pluralize count="doc.skos_altLabel_all.length"
                                    when="{'1': 'altLabel',
                                           'other': 'altLabels'}">
                      </ng-pluralize>:</b>
                    [[ doc.skos_altLabel_all.join(', ') ]]
                  </p>

                  <p ng-if="doc.skos_hiddenLabel_all">
                    <b>SKOS
                      <ng-pluralize count="doc.skos_hiddenLabel_all.length"
                                    when="{'1': 'hiddenLabel',
                                           'other': 'hiddenLabels'}">
                      </ng-pluralize>:</b>
                    hiddenLabel: [[ doc.skos_hiddenLabel_all.join(', ') ]]
                  </p>

                  <p ng-repeat="dcTitle in doc.dcterms_title_all
                                track by $index">
                    <b>DC Terms title:</b> [[ dcTitle ]]
                  </p>

                  <p ng-repeat="definition in doc.skos_definition_all
                                track by $index">
                    <b>SKOS definition:</b> [[ definition | limitTo:500 ]]<span ng-if="definition.length > 500">...</span>
                  </p>

                  <p ng-repeat="dcDescription in doc.dcterms_description_all
                                track by $index">
                    <b>DC Terms description:</b> [[ dcDescription | limitTo:500 ]]<span ng-if="dcDescription.length > 500">...</span>
                  </p>

                  <p ng-repeat="notation in doc.skos_notation
                                track by $index">
                    <b>SKOS notation:</b> [[ notation ]]
                  </p>
                </div> <!-- End of full fields when no highlighting. -->

                <div ng-repeat="(index, content) in
                                getHighlight(resources, doc.id)">
                  <div ng-repeat="c in content track by $index">
                    <span ng-bind-html="c | processSolrHighlight"></span>
                    <span class="muted">(in [[ index ]])</span>
                  </div>
                </div>

                <div class="element-shorter-top">
                  <b>Vocabulary:</b> <a ng-click="unsetScrollRestoration()"
                                        href="[[ base_url ]]viewById/[[ doc.vocabulary_id ]]">[[ doc.vocabulary_title ]]</a>
                  <span class="small">
                    Last updated: [[ doc.last_updated ]]
                  </span>
                  <br />
                  <b>Vocabulary
                    <ng-pluralize count="doc.publisher.length"
                                  when="{'1': 'publisher',
                                         'other': 'publishers'}">
                    </ng-pluralize>:</b>
                  [[ doc.publisher.join(', ') ]]
                  <br />
                  <b>Version:</b> [[ doc.version_title ]]
                  ([[ versionStatusPretty(doc.status) ]])
                </div>


                <!-- View all details, other versions, linked data, etc. -->
                <!-- Button trigger modal -->
                <div>
                  <button type="button" class="btn btn-xs btn-default"
                          style="margin-right: 4px"
                          data-toggle="modal"
                          data-target="#viewResource_[[ $index ]]">
                    View resource details
                  </button>
                  <span ng-if="repackagedExpanded[doc.collapse_id].same">
                    <button class="btn btn-xs btn-default collapsed"
                            data-toggle="collapse"
                            data-target="#toggle_same_[[ $index ]]"
                            style="margin-right: 4px">
                      <span class="when-closed"><i class="fa fa-xs fa-chevron-right"></i></span>
                      <span class="when-opened"><i class="fa fa-xs fa-chevron-down"></i></span>
                      View other versions
                    </button>
                  </span>
                  <span ng-if="repackagedExpanded[doc.collapse_id].other">
                    <button class="btn btn-xs btn-default collapsed"
                            data-toggle="collapse"
                            data-target="#toggle_other_[[ $index ]]"
                            style="margin-right: 4px">
                      <span class="when-closed"><i class="fa fa-xs fa-chevron-right"></i></span>
                      <span class="when-opened"><i class="fa fa-xs fa-chevron-down"></i></span>
                      View other vocabularies
                    </button>
                  </span>
                  <span ng-if="doc.sissvoc_endpoint" class="small">
                    <a ng-click="unsetScrollRestoration()"
                       target="_blank"
                       href="[[ doc.sissvoc_endpoint ]]/resource?uri=[[ doc.iri ]]"><i class="fa fa-xs fa-share-alt"></i> View resource as linked data</a>
                  </span>
                </div>

                <div ng-if="repackagedExpanded[doc.collapse_id]">
                  <div ng-if="repackagedExpanded[doc.collapse_id].same">
                    <div id="toggle_same_[[ $index ]]" class="collapse">
                      <ul>
                        <li ng-repeat="edoc in
                                       repackagedExpanded[doc.collapse_id].same">
                          Version: [[ edoc.version_title ]]
                          ([[ versionStatusPretty(edoc.status) ]])
                          <button type="button" class="btn btn-xs btn-default"
                                  style="margin-right: 4px"
                                  data-toggle="modal"
                                  data-target="#viewResource_same_[[ $parent.$index ]]_[[ $index ]]">
                            View resource details
                          </button>
                          <span ng-if="edoc.sissvoc_endpoint" class="small">
                            <a ng-click="unsetScrollRestoration()"
                               target="_blank"
                               href="[[ edoc.sissvoc_endpoint ]]/resource?uri=[[ edoc.iri ]]"><i class="fa fa-xs fa-share-alt"></i> View resource as linked data</a>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div ng-if="repackagedExpanded[doc.collapse_id].other">
                    <div id="toggle_other_[[ $index ]]" class="collapse">

                      <div ng-repeat="(edocsId, edocs) in
                                      repackagedExpanded[doc.collapse_id].other">
                        <b>Vocabulary:</b>
                        <a ng-click="unsetScrollRestoration()"
                           href="[[ base_url ]]viewById/[[ edocsId ]]">[[ edocs[0].vocabulary_title ]]</a>
                        <br />
                        <b>Vocabulary
                          <ng-pluralize count="doc.publisher.length"
                                        when="{'1': 'publisher',
                                               'other': 'publishers'}">
                          </ng-pluralize>:</b>
                        [[ doc.publisher.join(', ') ]]
                        <ul>
                          <li ng-repeat="edoc in edocs">
                            <b>Version:</b> [[ edocs[0].version_title ]]
                            ([[ versionStatusPretty(edoc.status) ]])
                            <button type="button" class="btn btn-xs btn-default"
                                    style="margin-right: 4px"
                                    data-toggle="modal"
                                    data-target="#viewResource_other_[[ $parent.$index ]]_[[ $index ]]">
                              View resource details
                            </button>
                            <span ng-if="edoc.sissvoc_endpoint" class="small">
                              <a ng-click="unsetScrollRestoration()"
                                 target="_blank"
                                 href="[[ edoc.sissvoc_endpoint ]]/resource?uri=[[ edoc.iri ]]"><i class="fa fa-xs fa-share-alt"></i> View resource as linked data</a>
                            </span>
                          </li>

                        </ul>


                      </div>
                    </div>

                  </div>
                </div>

              </div> <!-- End search results for resources tab -->

              <!-- Advanced options for resource search -->
              <div ng-if="resources.result.response.docs" class="vocab-search-result">
                <div style="margin-bottom: 4px">
                  <button class="btn btn-xs btn-default collapsed"
                          data-toggle="collapse"
                          data-target="#toggle_resources_advanced_options">
                    <span class="when-closed"><i class="fa fa-xs fa-chevron-right"></i></span>
                    <span class="when-opened"><i class="fa fa-xs fa-chevron-down"></i></span>
                    Advanced options
                  </button>
                </div>
                <div id="toggle_resources_advanced_options" class="collapse">
                  <select id="collapse-select" name="collapse-select"
                          class="form-control caret-for-select"
                          style="width:auto; display: inline"
                          ng-options="option.id as option.name
                              for option in collapseOptions"
                          ng-model="form.collapse"
                          ng-change="search()">
                  </select>
                </div>
              </div>
            </uib-tab>
          </uib-tabset>

        </div>

        <!-- Result count, selectors for sort order, pagination
             (at the bottom): new version, with nav -->

        <!-- NB: only show if there are results, as it looks silly
             to have two sets of selectors for no results. -->
        <!-- The test "activeContainer().result.response.docs.length > 0"
             comes into play when changing active tab. It serves to
             hide this bottom bar while the switch between tabs takes
             place.
        -->
        <div class="vocab-search-result ng-cloak"
             ng-if="activeContainer().result.response.numFound > 0 &&
                    activeContainer().result.response.docs.length > 0">
          <table width="100%">
            <tbody>
              <tr>
                <td class="text-nowrap" style="width:80%">
                  <uib-tabset active="filters.activeTab"
                              template-url="tabset-hidden.html">
                    <uib-tab index="'vocabularies'"
                             select="tabChanged('vocabularies')">
                      <uib-tab-heading>
                        Vocabularies
                        ([[ vocabularies.result.response.numFound ]])
                      </uib-tab-heading>
                    </uib-tab>
                    <uib-tab index="'resources'"
                             select="tabChanged('resources')">
                      <uib-tab-heading>
                        Concepts, etc.
                        ([[ resources.result.response.numFound ]])
                      </uib-tab-heading>
                    </uib-tab>
                  </uib-tabset>
                </td>
                <td style="width:10%"></td>
                <td ng-if="activeContainer().result.response.numFound > 0"
                    style="padding-right: 4px">
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
                <td ng-if="activeContainer().result.response.numFound > 0"
                    style="padding-right: 4px">
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

                <td ng-if="activeContainer().result.response.numFound > 0"
                    class="text-nowrap"
                    style="padding: 8px"><small>Page [[ activeContainer().page.cur ]] /
                  [[ activeContainer().page.end ]]</small></td>
                <td ng-if="activeContainer().result.response.numFound > 0 &&
                           activeContainer().page.cur!=1"
                    style="padding: 4px"><a href="" ng-click="goto(1)"><span aria-hidden="true">&laquo;</span><span class="sr-only">First</span></a></td>
                <td ng-if="activeContainer().result.response.numFound > 0"
                    ng-repeat="x in activeContainer().page.pages"
                    class="pagi"><a ng-class="{'active':activeContainer().page.cur==x}" href="" ng-click="goto(x)">[[x]]</a></td>
                <td ng-if="activeContainer().result.response.numFound > 0 &&
                           activeContainer().page.cur!=activeContainer().page.end"
                    style="padding: 4px"><a href="" ng-click="goto(activeContainer().page.end)"><span aria-hidden="true">&raquo;</span><span class="sr-only">Last</span></a></td>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- Need the first condition of this conjunction to avoid
             "flickering" when going back/forward in browser
             (especially Chrome). -->
        <div ng-if="activeContainer().result.response.docs &&
                    activeContainer().result.response.numFound == 0"
             class="animated fadeInLeft vocab-search-result">
          Your search did not return any results
        </div>

      </div>

      <!-- Modals for resource search.
           These need to be outside the tabs, so as not to get the
           CSS and the JavaScript events of the tabs. -->
      <!-- Modals for main search results -->
      <div ng-repeat="doc in resources.result.response.docs"
           class="modal fade" id="viewResource_[[ $index ]]"
           tabindex="-1" role="dialog"
           aria-labelledby="viewResource_[[ $index ]]">
        @yield('modal-popup')
      </div>
      <!-- End of modals for resource search. -->

      <!-- Modals for expanded search results -->
      <div ng-repeat="docTop in resources.result.response.docs">
        <div ng-if="repackagedExpanded[docTop.collapse_id]">
          <div ng-if="repackagedExpanded[docTop.collapse_id].same">
            <div ng-repeat="doc in
                            repackagedExpanded[docTop.collapse_id].same"
                 class="modal fade"
                 id="viewResource_same_[[ $parent.$index ]]_[[ $index ]]"
                 tabindex="-1" role="dialog"
                 aria-labelledby="viewResource_same_[[ $parent.$index ]]_[[ $index ]]">
              @yield('modal-popup')
            </div>
          </div>
          <div ng-if="repackagedExpanded[docTop.collapse_id].other">
            <div ng-repeat="(edocsId, edocs) in
                            repackagedExpanded[docTop.collapse_id].other">
              <div ng-repeat="doc in edocs"
                   class="modal fade"
                   id="viewResource_other_[[ $parent.$index ]]_[[ $index ]]"
                   tabindex="-1" role="dialog"
                   aria-labelledby="viewResource_other_[[ $parent.$index ]]_[[ $index ]]">
                @yield('modal-popup')
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- End of modals for expanded search results -->

    </div>

  </div>
</section>
