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
                "      <input type='checkbox' id='{{name}}' class='ands-switch-checkbox' id='{{name}}' ng-click='model = !model' ng-checked='model'>\n" +
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
                         version, action, vocab, confluenceTip) {

        // Make the modal dialog (at least, temporarily) movable,
        // as per request in SD-11572, CC-2050.
        $timeout(function(){
            $('.modal-content').draggable({ revert: true });
        });

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

        $scope.vocab = vocab;
        $scope.confluenceTip = confluenceTip;
        // Preserve the original data for later. We need this
        // specifically for the release_date value.
        $scope.original_version = angular.copy(version);
        $scope.version = version ? version : {provider_type: false};
        $scope.action = version ? 'save' : 'add';
        $scope.formats = ['RDF/XML', 'TTL', 'N-Triples', 'JSON', 'TriG',
                          'TriX', 'N3', 'CSV', 'TSV', 'XLS', 'XLSX',
                          'BinaryRDF', 'ODS', 'ZIP', 'XML', 'TXT', 'ODT',
                          'PDF'];
        $scope.types = [{"value": "webPage", "text": "Web page"},
            {"value": "apiSparql", "text": "API/SPARQL endpoint"},
            {"value": "file", "text": "File"}
        ];

        $scope.typeFormatOptions = [
            { name:'Web page', value: 'webPage'},
            { name:'API/SPARQL endpoint', value: 'apiSparql'},
            { name: 'RDF/XML', value:'RDF/XML', group: 'File Upload'},
            { name: 'TTL', value:'TTL', group: 'File Upload'},
            { name: 'N-Triples', value:'N-Triples', group: 'File Upload'},
            { name: 'JSON', value:'JSON', group: 'File Upload'},
            { name: 'TriG', value:'TriG', group: 'File Upload'},
            { name: 'TriX', value:'TriX', group: 'File Upload'},
            { name: 'N3', value:'N3', group: 'File Upload'},
            { name: 'CSV', value:'CSV', group: 'File Upload'},
            { name: 'TSV', value:'TSV', group: 'File Upload'},
            { name: 'XLS', value:'XLS', group: 'File Upload'},
            { name: 'XLSX', value:'XLSX', group: 'File Upload'},
            { name: 'BinaryRDF', value:'BinaryRDF', group: 'File Upload'},
            { name: 'ODS', value:'ODS', group: 'File Upload'},
            { name: 'ZIP', value:'ZIP', group: 'File Upload'},
            { name: 'XML', value:'XML', group: 'File Upload'},
            { name: 'TXT', value:'TXT', group: 'File Upload'},
            { name: 'ODT', value:'ODT', group: 'File Upload'},
            { name: 'PDF', value:'PDF', group: 'File Upload'}
        ];

        $scope.updateNewAPTypeFormat = function(option) {

            if (option === 'webPage' || option === 'apiSparql') {
                $scope.newValue.ap.type = option;
                delete $scope.newValue.ap.format;
                return;
            }

            // it's a file
            $scope.newValue.ap.type = 'file';
            $scope.newValue.ap.format = option;
        };

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

            // legacy workflow
            // TODO: check if we still need to do this
            $log.debug(obj.import, obj.publish);
            if (obj.import) {
                //add empty apiSparql endpoint
                $scope.addformat({
                    format: 'RDF/XML',
                    type: 'apiSparql',
                    uri: 'TBD'
                });
            }
            if (obj.publish) {
                //add empty sissvoc endpoint
                $scope.addformat({
                    format: 'RDF/XML',
                    type: 'webPage',
                    uri: 'TBD'
                });
            }

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

        $scope.validFormat = function () {
            var validFormats = ['TTL', 'TriG', 'Trix', 'N3', 'RDF/XML'];
            if ($scope.newValue.ap.format && $scope.newValue.ap.type == 'file') {
                if (validFormats.indexOf($scope.newValue.ap.format) > -1) {
                    return true;
                }
            }
            $scope.newValue.ap.publish = false;
            $scope.newValue.ap.import = false;
            return false;
        };

        $scope.validateVersion = function () {
            delete $scope.error_message;
            if ($scope.form.versionForm.$valid) {

                //if there's already a current version, this one shouldn't be
                if ($scope.version.status == 'current') {
                    if (vocab.versions) {
                        var vocabhascurrent = false;
                        angular.forEach(vocab.versions, function (ver) {
                            if (ver.status == 'current' &&
                                    ver.id != $scope.version.id) {
                                vocabhascurrent = true;
                            }
                        });
                        if (vocabhascurrent) {
                            $scope.error_message = 'Vocabulary already has a current version';
                            return false;
                        }
                    }
                }

                //at least 1 access point require
                if ($scope.version && $scope.version.access_points &&
                        $scope.version.access_points.length > 0) {
                    return true;
                } else {
                    $scope.error_message = 'At least 1 access point is required';
                    return false;
                }

            } else {
                $scope.error_message = 'Form Validation Failed';
                return false;
            }
        };

        $scope.save = function () {
            // CC-1267 "Work in progress".
            // If the access point details are filled out
            // correctly, and the Access Point Button is
            // active, then click it on behalf of the user.
            if (!!$scope.form.apForm.$valid) {
                $scope.addformatform($scope.newValue.ap);
            }

            if ($scope.validateVersion()) {
                // Save the date as it actually is in the input's textarea, not
                // as it is in the model.
                // FIXME: don't do this now ...
//                $scope.version.release_date = $('#release_date').val();
                // ... but, instead, extract $('#creation_date').val() when
                // constructing the Version object to send back to the
                // top level.
                var ret = {
                    'intent': $scope.action,
                    'data': $scope.version
                };
                $uibModalInstance.close(ret);
            } else return false;
        };

        //Import version from PoolParty
        $scope.importPP = function () {
            $scope.version.provider_type = 'poolparty';

            //add empty apiSparql endpoint
            $scope.addformat({
                format: 'RDF/XML',
                type: 'apiSparql',
                uri: 'TBD'
            });

            //add empty sissvoc endpoint
            $scope.addformat({
                format: 'RDF/XML',
                type: 'webPage',
                uri: 'TBD'
            });
        };




        $scope.upload = function (files, ap) {
            if (!ap) ap = {};

            var uploadEndpoint = registry_api_url + "/api/resource/uploads/?owner=" + vocab.owner + "&format=" + ap.format;

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
                                file.size + ") byte exceeds the limit (50MB) allowed and cannot be saved");
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
                        headers: {
                            'ands_authentication': readCookie('ands_authentication')
                        }

                    }).then(function (resp, status, xhr) {
                        // success
                        // data, status, headers, config
                        // $log.debug(resp.config);

                        $scope.uploading = false;
                        ap.id = resp.data.integerValue;
                        ap.name = resp.data.stringValue;
                        ap.uri = resp.headers('Location');
                    },
                    function (resp) {
                        // error
                        $scope.error_upload_msg = resp.data.message;
                    },
                    function (evt) {
                        // progress
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $log.debug('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
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
        }

        // $scope.$watch('newValue.ap.type', function(newVal, oldVal){
        //
        //     if(newVal == 'file'){
        //         $('#ap_upload').show();
        //         $('#ap_uri').hide();
        //         $('#ap_uri_label').hide();
        //     }
        //     else if(newVal == 'apiSparql'){
        //         $('#ap_upload').hide();
        //         $('#ap_uri').show();
        //         $('#ap_uri_label').show();
        //         $('#ap_uri_label').html("SPARQL endpoint URI");
        //     }
        //     else if(newVal == 'webPage'){
        //         $('#ap_upload').hide();
        //         $('#ap_uri').show();
        //         $('#ap_uri_label').show()
        //         $('#ap_uri_label').html("Webpage URL");
        //     }
        //     else{
        //         $('#ap_upload').hide();
        //         $('#ap_uri').hide();
        //         $('#ap_uri_label').hide();
        //     }
        // });

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
