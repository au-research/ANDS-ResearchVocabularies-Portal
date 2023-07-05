(function () {
    'use strict';

    angular
        .module('app')
        .directive('andsSwitch', function() {
            return {
                scope: {
                    model : '=',
                    name: '@'
                },
                link: function($scope, elem, attrs) {
                    // console.log("Binding ands-switch", $scope, elem, attrs);
                },
                template: "<div class='ands-switch'>" +
                    "      <input type='checkbox' id='{{name}}' " +
                    "class='ands-switch-checkbox' " +
                    "ng-click='model = !model' ng-checked='model'>\n" +
                    "      <label class='ands-switch-label' for='{{name}}'>" +
                    "        <span class='ands-switch-inner'></span>" +
                    "        <span class='ands-switch-switch'></span>" +
                    "      </label>" +
                    "    </div>"
            }
        });

    angular
        .module('app')
        .controller('versionCtrl', versionCtrl);

    function versionCtrl($scope, $timeout, $uibModalInstance, $log, Upload,
                         version, action, vocab, confluenceTip,
                         tinymceOptions) {

        // Make the modal dialog (at least, temporarily) movable,
        // as per request in SD-11572, CC-2050.
        $timeout(function(){
            jQueryWithUI('.modal-content').draggable({ revert: true });
        });

        $scope.tinymceOptions = tinymceOptions;

        $scope.showNewAPForm = false;

        // Set up access to the Registry API.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var api = new VocabularyRegistryApi.ResourcesApi();

        // Old-style hard coding.
//        $scope.versionStatuses = ['current', 'superseded'];

        /* Define visible labels for all the defined version statuses.
         * At least for now, the labels exactly match the names of
         * the statuses.
         * So this looks stupid (and in the end, it might be), but that's
         * at least partially because JavaScript doesn't have true
         * enums.  */
        var statusTypeEnum = VocabularyRegistryApi.Version.StatusEnum;
        $scope.versionStatuses = [
            {id: statusTypeEnum.current, label: 'current'},
            {id: statusTypeEnum.superseded, label: 'superseded'}
            ];

        // Browse flags.

        // Container for the model for browse flags.
        // The container contains:
        //   $scope.browseFlags.notationFormatSelection
        //   $scope.browseFlags.defaultSortOrderSelection
        //   $scope.browseFlags.defaultDisplayNotation
        //   $scope.browseFlags.includeConceptSchemes
        //   $scope.browseFlags.includeCollections
        //   $scope.browseFlags.mayResolveResources
        $scope.browseFlags = {};

        // Possible notation formats, including a special
        // first option to represent there being no notations.
        $scope.notationFormatOptions = [
            { name: 'None/other', value: 'none'},
            { name: 'Numeric multi-level hierarchical, e.g., 2.4.1, 2.20',
              value: 'notationDotted'},
            { name: 'Floating-point number, e.g., 2.21, 2.4',
              value: 'notationFloat'},
            { name: 'Alphanumeric, e.g., A0932, 12, fish',
              value: 'notationAlpha'}
        ];

        // Possible default sort orders.
        $scope.defaultSortOrderOptions = [
            { name: 'Label', value: 'prefLabel'},
            { name: 'Notation', value: 'notation'}
        ];

        // Reset all browse flags. Used for initialization, and
        // when the user removes all access points that would
        // provide vocabulary data.
        $scope.clearBrowseFlags = function() {
            $scope.browseFlags.notationFormatSelection = 'none';
            $scope.browseFlags.defaultSortOrderSelection = 'prefLabel';
            delete $scope.browseFlags.defaultDisplayNotation;
            delete $scope.browseFlags.includeConceptSchemes;
            delete $scope.browseFlags.includeCollections;
            delete $scope.browseFlags.mayResolveResources;
        }

        // Parse an existing version's browse flags into our
        // own $scope.browseFlags representation.
        $scope.parseExistingBrowseFlags = function(browseFlags) {
            // Always reset ...
            $scope.clearBrowseFlags();
            // ... and if there are no flags, we stop here.
            if (browseFlags === undefined || !Array.isArray(browseFlags)) {
                return;
            }
            angular.forEach(browseFlags, function(flag) {
                switch (flag) {
                case 'maySortByNotation':
                    // Tells us nothing by itself. There must also
                    // be a specific notation... flag.
                    break;
                case 'notationAlpha':
                case 'notationFloat':
                case 'notationDotted':
                    $scope.browseFlags.notationFormatSelection = flag;
                    break;
                case 'defaultSortByNotation':
                    $scope.browseFlags.defaultSortOrderSelection = 'notation';
                    break;
                case 'defaultDisplayNotation':
                    $scope.browseFlags.defaultDisplayNotation = true;
                    break;
                case 'includeConceptSchemes':
                    $scope.browseFlags.includeConceptSchemes = true;
                    break;
                case 'includeCollections':
                    $scope.browseFlags.includeCollections = true;
                    break;
                case 'mayResolveResources':
                    $scope.browseFlags.mayResolveResources = true;
                    break;
                default:
                    // Unknown flag.
                    break;
                }
            });
        }

        // Use the form elements to populate the browse flags
        // of $scope.version.
        $scope.unparseBrowseFlags = function() {
            // Start by resetting.
            $scope.version.browseFlags = [];

            if ($scope.browseFlags.includeConceptSchemes == true) {
                $scope.version.browseFlags.push('includeConceptSchemes');
            }
            if ($scope.browseFlags.includeCollections == true) {
                $scope.version.browseFlags.push('includeCollections');
            }
            if ($scope.browseFlags.mayResolveResources == true) {
                $scope.version.browseFlags.push('mayResolveResources');
            }

            // Now use the form elements to populate the flags.
            if ($scope.browseFlags.notationFormatSelection == 'none') {
                // There will be no more flags.
                return;
            }
            // There's notation format.
            $scope.version.browseFlags.push('maySortByNotation');
            $scope.version.browseFlags.push(
                $scope.browseFlags.notationFormatSelection);
            if ($scope.browseFlags.defaultSortOrderSelection == 'notation') {
                $scope.version.browseFlags.push('defaultSortByNotation');
            }
            if ($scope.browseFlags.defaultDisplayNotation == true) {
                $scope.version.browseFlags.push('defaultDisplayNotation');
            }
        }


        $scope.vocab = vocab;
        $scope.confluenceTip = confluenceTip;

        // CC-2756 Handle the case that the user has already worked
        // with this version, clicked "Save" on this modal, and has
        // now reopened it. The release date field needs to be
        // patched, just as it will be on the main page's save action.
        if (version) {
            if ('release_date_val' in version) {
                version['release_date'] = version['release_date_val'];
                delete version['release_date_val'];
            }
        }

        // Preserve the original data for later. We need this
        // specifically for the release_date value.
        $scope.original_version = angular.copy(version);
        // Now assign $scope.version; this is what we will use.
        if (version) {
            $scope.version = version;
            $scope.parseExistingBrowseFlags(version.browseFlags);
        } else {
            $scope.version = {
                provider_type: false,
                access_points: [],
                browse_flags: []
            };
            // Start with browse flags cleared.
            $scope.clearBrowseFlags();
        }

        $log.debug("Editing Version", $scope.version);

        $scope.action = version ? 'save' : 'add';
        $scope.types = [{"value": "webPage", "text": "Web page"},
            {"value": "apiSparql", "text": "API/SPARQL endpoint"},
            {"value": "file", "text": "File"}
        ];

        // Whenever updating this list, you must also update the
        // contents of FILE_FORMAT_TO_MIMETYPE_MAP (and possibly
        // also SESAME_FORMAT_TO_MIMETYPE_MAP) in Vocabs-Registry
        // (GitHub: ANDS-ResearchVocabularies-Registry) file:
        // src/main/java/au/org/ands/vocabs/toolkit/restlet/Download.java
        $scope.typeFormatOptions = [
            { name: 'Web page', value: 'webPage'},
            { name: 'API/SPARQL endpoint', value: 'apiSparql'},
            { name: 'RDF/XML', value: 'RDF/XML', group: 'File Upload'},
            { name: 'TTL', value: 'TTL', group: 'File Upload'},
            { name: 'N-Triples', value: 'N-Triples', group: 'File Upload'},
            { name: 'JSON', value: 'JSON', group: 'File Upload'},
            { name: 'TriG', value: 'TriG', group: 'File Upload'},
            { name: 'TriX', value: 'TriX', group: 'File Upload'},
            { name: 'N3', value: 'N3', group: 'File Upload'},
            { name: 'CSV', value: 'CSV', group: 'File Upload'},
            { name: 'TSV', value: 'TSV', group: 'File Upload'},
            { name: 'XLS', value: 'XLS', group: 'File Upload'},
            { name: 'XLSX', value: 'XLSX', group: 'File Upload'},
            { name: 'BinaryRDF', value: 'BinaryRDF', group: 'File Upload'},
            { name: 'ODS', value: 'ODS', group: 'File Upload'},
            { name: 'ZIP', value: 'ZIP', group: 'File Upload'},
            { name: 'XML', value: 'XML', group: 'File Upload'},
            { name: 'TXT', value: 'TXT', group: 'File Upload'},
            { name: 'ODT', value: 'ODT', group: 'File Upload'},
            { name: 'PDF', value: 'PDF', group: 'File Upload'}
        ];

        $scope.updateNewAPTypeFormat = function(option) {
            // Remove any properties added by $scope.upload.
            delete $scope.newValue.ap.upload_id;
            delete $scope.newValue.ap.name;
            delete $scope.newValue.ap.uri;
            // A "feature" of AngularJS is that the previous line
            // is not enough to clear the uri field, if it is currently
            // invalid, since there is no real change to the model.
            // For that case, the next line is required to clear
            // the DOM value.
            angular.element(document.querySelector('#newValueApUri')).val('');
            // And reset any upload progress values.
            $scope.error_upload_msg = false;
            $scope.uploadPercentage = 0;

            if (option === 'webPage' || option === 'apiSparql') {
                $scope.newValue.ap.type = option;
                delete $scope.newValue.ap.format;
                return;
            }

            // it's a file
            $scope.newValue.ap.type = 'file';
            $scope.newValue.ap.format = option;
        };

        $scope.currentVersion = $scope.vocab['versions'].find(
            function (version) {
                return version.title !== $scope.version.title &&
                    version.status === statusTypeEnum.current;
            });
        if ($scope.currentVersion) {
            $log.debug("There is an existing current version",
                       $scope.currentVersion);
        }

        // intialize the forms for validation
        $scope.form = {
            apForm:{},
            versionForm:{}
        };

        // Used for new access points
        $scope.newValue = {
            ap: {}
        };
        $scope.uploadPercentage = 0;

        // is the datepicker popup open?
        $scope.opened = false;

        // Now follows all the code for special treatment of the release date.
        // See also vocabs_cms.js, which has a modified version of all of
        // this for vocabulary creation dates.

        /* Flag to determine when to reset the content of the release date
           text field. Set by set_release_date_textfield() and reset by the
           watcher put on version.release_date. */
        $scope.restore_release_date_value = false;

        /* Special handling for the release date field. Needed because of the
           combination of the text field, the off-the-shelf datepicker,
           and the desire to allow partial dates (e.g., year only). */
        $scope.set_release_date_textfield = function (scope) {
            // In some browser JS engines, the Date constructor interprets
            // "2005" not as though it were "2005-01-01", but as 2005 seconds
            // into the Unix epoch. But Date.parse() seems to cope better,
            // so pass the date field through Date.parse() first. If that
            // succeeds, it can then go through the Date constructor.
            var dateValParsed =
                Date.parse($scope.original_version.release_date);

            if (!isNaN(dateValParsed)) {
                var dateVal = new Date(dateValParsed);
                $scope.version.release_date = dateVal;
                // Set this flag, so that the watcher on the
                // version.release_date
                // field knows to reset the text field to the value we got
                // from the database.
                $scope.restore_release_date_value = true;
            }
        };



        /* Callback function used by the watcher on version.release_date.
           It overrides the content of the release date text field with
           the value we got from the database. */
        $scope.do_restore_release_date = function() {
            $('#release_date').val($scope.original_version.release_date);
        }

        /* Watcher for the version.release_data field. If we got notification
           (via the restore_release_date_value flag) to reset the text
           field value, schedule the reset. Need to use $timeout
           so that the reset happens after the current round of
           AngularJS model value propagation. */
        $scope.$watch('version.release_date', function() {
            if ($scope.restore_release_date_value) {
                $scope.restore_release_date_value = false;
                $timeout($scope.do_restore_release_date, 0);
            }
        });

        // Now invoke the special handling for release date.
        $scope.set_release_date_textfield($scope);

        // add format to the version.access_points
        // helper method for addformatform
        $scope.addformat = function (obj) {
            if ($scope.validateAP() ||
                    $scope.version.provider_type == 'poolparty') {
                if (!$scope.version) $scope.version = {};
                if (!$scope.version['access_points'] ||
                        $scope.version['access_points'] == undefined) {
                    $scope.version['access_points'] = [];
                }
                var newobj = {};
                angular.copy(obj, newobj);
                $scope.version.access_points.push(newobj);

                $scope.resetAPForm();

            } else return false;
        };

        // completely reset the new Access Point form
        //
        $scope.resetAPForm = function () {
            $scope.newValue.ap = {};
            $scope.selectedOption = null;
            $scope.form.apForm.$setPristine();
            $scope.showNewAPForm = false;
            $scope.error_upload_msg = false;
            $scope.uploadPercentage = 0;
        };

        // Add new access point format button clicked
        $scope.addformatform = function (obj) {

            // show errors
            $scope.form.apForm.$setSubmitted();
            if (!$scope.validateAP()) {
                return;
            }

            // TODO: consider inline this function
            $scope.addformat(obj);

            $scope.showNewAPForm = false;
        };

        // This can be called when apForm is undefined, so return true
        // in that case.
        $scope.validateAP = function () {
            if (!$scope.form.apForm) {
                return true;
            }
            delete $scope.ap_error_message;
            if (!$scope.form.apForm.$valid) {
                $scope.ap_error_message = 'Form Validation Failed';
            }
            return !!$scope.form.apForm.$valid;
        };

        $scope.validFormats = ['TTL', 'TriG', 'TriX', 'N3', 'RDF/XML',
                               'N-Triples', 'BinaryRDF'];

        // TODO: verify usage of this function
        $scope.validFormat = function () {
            if ($scope.newValue.ap.format &&
                $scope.newValue.ap.type == 'file') {
                if ($scope.validFormats.indexOf(
                    $scope.newValue.ap.format) > -1) {
                    return true;
                }
            }
            $scope.newValue.ap.publish = false;
            $scope.newValue.ap.import = false;
            return false;
        };

        $scope.isPP = function() {
            return 'poolparty_id' in $scope.vocab;
        };

        $scope.hasSupportedFiles = function() {
            var hasSupportedFiles = false;
            // $log.debug("Valid Formats", $scope.validFormats);
            angular.forEach($scope.version.access_points, function(ap) {
                if ($scope.validFormats.indexOf(ap.format) >= 0) {
                    //$log.debug("Has supported file", ap, ap.format, $scope.validFormats);
                    hasSupportedFiles = true;
                }
            });
            return hasSupportedFiles;
        };

        // Where the user is editing a previously published version
        // which has the 'Harvest Version From PoolParty' option enabled,
        // an additional version settings option shall be displayed
        // 'Reapply version settings on publish'
        $scope.canReapplyVersion = false;
        $scope.canImportPublish = false;

        // Whether to offer browse flags.
        $scope.canOfferDefaultSortSelection = false;

        $scope.evaluateVersionSettings = function() {

            // reset
            $scope.canReapplyVersion = false;
            $scope.canImportPublish = false;
            $scope.canOfferDefaultSortSelection = false;

            $log.debug("Evaluating version settings");

            // When the user opts to harvest the version from PP
            // the Import and Publish buttons should be shown/enabled
            if ($scope.version.doPoolpartyHarvest) {
                $scope.canImportPublish = true;
            }

            // $log.debug("is PP", $scope.isPP());
            // $log.debug("hasSupportedFiles, ", $scope.hasSupportedFiles());

            // Where a vocabulary is NOT linked to PP,
            // the import and Publish buttons shall only be shown/enabled
            // when an existing or added supported file exists
            if ((!$scope.isPP() || !$scope.version.doPoolpartyHarvest)
                && $scope.hasSupportedFiles()) {
                $scope.canImportPublish = true;
            }

            // Where the user is editing a previously published version
            // which has the 'Harvest Version From PoolParty' option enabled,
            // an additional version settings option shall be displayed
            // 'Reapply version settings on publish'.
            // So, this is done if: (a) we are not editing a draft,
            // and (b) this is an existing version.
            // This isn't completely right: you might want to be able
            // to edit a vocab that exists in _both_ published and draft
            // form, and to force workflow for an existing version.
            // You can't currently do that: you have to publish the
            // vocabulary, then go in again to see this toggle.
            if (version.id && ($scope.vocab.status === "published" ||
                               $scope.vocab.status === "deprecated")) {
                $scope.canReapplyVersion = true;
            }

            // when we change the hasSupported condition,
            // the underlying data needs changing
            if (!$scope.hasSupportedFiles() && !$scope.isPP()) {
                $scope.version.doImport = false;
                $scope.version.doPublish = false;
                $scope.clearBrowseFlags();
                $scope.canOfferDefaultSortSelection = false;
            }

            // finally, if the settings are hidden, they are false
            if (!$scope.canImportPublish) {
                $scope.version.doImport = false;
                $scope.version.doPublish = false;
                $scope.clearBrowseFlags();
                $scope.canOfferDefaultSortSelection = false;
            }
        };
        $scope.evaluateVersionSettings();


        $scope.$watch('version.access_points', function() {
            $scope.evaluateVersionSettings();
        }, true);

        // If doing PoolpartyHarvest, enable import and publish
        // but set them to false
        $scope.$watch('version.doPoolpartyHarvest', function(newv, oldv) {

            // prevents import and publish switch carry over
            if (oldv === true && newv === false) {
                $scope.version.doImport = false;
                $scope.version.doPublish = false;
            }

            // Users should be forced to import if they choose to harvest
            // from PP
            if (newv === true) {
                $scope.version.doImport = true;
                // TODO: disable doImport switch so it can't be changed
            }

            $scope.evaluateVersionSettings();
        });

        // If import is off publish is off
        $scope.$watch('version.doImport', function(newv, oldv){
            if (oldv === true && newv === false) {
                $scope.version.doPublish = false;
            }
        });

        // If publish is on import is on
        $scope.$watch('version.doPublish', function(newv, oldv) {
            if (oldv === false && newv === true) {
                $scope.version.doImport = true;
            }
        });


        $scope.validateVersion = function () {
            delete $scope.error_message;

            if (!$scope.form.versionForm.$valid) {
                $scope.error_message = 'Form Validation Failed';
                return false;
            }

            if (!$scope.isPP()) {
                // at least 1 AP is required
                if ($scope.version.access_points.length === 0) {
                    $scope.error_message =
                        'At least 1 access point is required';
                    return false;
                }
            }

            if ($scope.isPP()) {
                if ($scope.version.access_points.length === 0 &&
                    !$scope.version.doPoolpartyHarvest) {
                    $scope.error_message = "At least 1 access point or PoolParty harvest is required";
                    return false;
                }

                if (!$scope.version.doImport &&
                    $scope.version.doPoolpartyHarvest) {
                    $scope.error_message = "Import must be enabled for PoolParty harvested versions";
                    return false;
                }

            }

            return true;

        };

        $scope.validated = false;
        $scope.$watch('version', function(){
            $scope.validated = $scope.validateVersion();
        }, true);

        $scope.save = function () {
            // CC-1267 "Work in progress".
            // If the access point details are filled out
            // correctly, and the Access Point Button is
            // active, then click it on behalf of the user.
            if (!!$scope.form.apForm.$valid) {
                $scope.addformatform($scope.newValue.ap);
            }

            if (!$scope.validateVersion()) {
                return false;
            }

            // Save the browse flags.
            $scope.unparseBrowseFlags();

            // Save the date as it actually is in the input's textarea, not
            // as it is in the model.
            // FIXME: don't do this now ...
//                $scope.version.release_date = $('#release_date').val();
            // ... but, instead, extract $('#creation_date').val() when
            // constructing the Version object to send back to the
            // top level.
            $scope.version['release_date_val'] = $('#release_date').val();
            var ret = {
                'intent': $scope.action,
                'data': $scope.version
            };
            $log.debug("Saving version", ret);
            if ($scope.currentVersion && $scope.version.status === "current") {
                $log.debug("Setting existing currentVersion to superseded",
                           $scope.currentVersion);
                $scope.currentVersion.status = statusTypeEnum.superseded;
            }
            $uibModalInstance.close(ret);

        };

        $scope.upload = function (files, ap) {
            if (!ap) ap = {};

            var uploadEndpoint = registry_api_url +
                "/api/resource/uploads/?owner=" + vocab.owner +
                "&format=" + ap.format;

            // debug
            // ap.uri = files[0].name;
            // return;

            var allowContinue = false;
            if (files && files.length) {
                allowContinue = true;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if(file.size > 50000000){
                        alert("The file '" + file.name + "' size:(" +
                              file.size +
                              ") byte exceeds the limit (50MB) allowed and cannot be saved");
                        allowContinue = false;
                    }
                }
            }

            if (allowContinue) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    $scope.uploading = true;
                    delete $scope.error_upload_msg;
                    Upload.upload({
                        // url: base_url + 'vocabs/upload' + '?owner=' + vocab.owner + '&format=' + ap.format,
                        url: uploadEndpoint,
                        data: {file: file},
                        /* Since CC-2901, setting the header is now
                           defunct, because the authentication cookie
                           now has the HttpOnly attribute, so we can't
                           read its value. Turns out that this is not
                           a problem: The browser sends the cookie
                           correctly anyway!  NB: this relies on the
                           cookie host _and_ path (currently, "/")
                           being sufficiently permissive. E.g,. if the
                           path were more specific, this would _not_
                           work.
                        headers: {
                            'ands_authentication':
                              readCookie('ands_authentication')
                        }
                        */

                    }).then(function (resp, status, xhr) {
                        // success
                        // data, status, headers, config
                        // $log.debug(resp.config);

                        $scope.uploading = false;
                        // See also $scope.updateNewAPTypeFormat, which deletes these
                        // properties when the format changes.
                        ap.upload_id = resp.data.integerValue;
                        ap.name = resp.data.stringValue;
                        ap.uri = resp.headers('Location');
                    },
                    function (resp) {
                        // error
                        $scope.error_upload_msg = resp.data.message;
                    },
                    function (evt) {
                        // progress
                        var progressPercentage = parseInt(
                            100.0 * evt.loaded / evt.total);
                        $log.debug('progress: ' + progressPercentage +
                                   '% ' + evt.config.data.file.name);
                        $scope.uploadPercentage = progressPercentage;
                    });
                }
            }
        };

        $scope.list_remove = function (type, index) {
            if (index > 0) {
                $scope.version[type].splice(index, 1);
            } else {
                $scope.version[type].splice(0, 1);
            }
        };

        $scope.dismiss = function () {
            $uibModalInstance.dismiss();
        };

        $scope.setImPubcheckboxes = function (elem) {

            if(elem == 'import'){
                if(angular.isDefined($scope.newValue.ap.import)){
                    $scope.newValue.ap.import = !$scope.newValue.ap.import;
                } else {
                    $scope.newValue.ap.import = true;
                }
                if($scope.newValue.ap.import == false){
                    $scope.newValue.ap.publish = false;
                }
            }

            if(elem == 'publish'){
               if(angular.isDefined($scope.newValue.ap.publish)){
                    $scope.newValue.ap.publish = !$scope.newValue.ap.publish;
                } else{
                $scope.newValue.ap.publish = true;
                }
                if($scope.newValue.ap.publish == true){
                    $scope.newValue.ap.import = true;
                }
            }
        }
    }


})();
