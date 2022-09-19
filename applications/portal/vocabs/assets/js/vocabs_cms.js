/**
 * Primary Controller for the Vocabulary CMS
 * For adding / editing vocabulary metadata
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
/* Changes to make this work with the new Registry include:
 * * Connecting up to the Registry API via the generated JS client API
 * * A method to copy vocabulary data that comes _from_ the client API
 *   into the fields of the forms
 * * A method to copy data from the fields of the forms into client API
 *   model objects, for sending to the Registry API.
 */
(function () {
    'use strict';

    angular
        .module('app')
        .controller('addVocabsCtrl', addVocabsCtrl);

    Date.prototype.isValid = function () {
        // An invalid date object returns NaN for getTime() and NaN is the only
        // object not strictly equal to itself.
        return this.getTime() === this.getTime();
    };

    function addVocabsCtrl($log, $scope, $sce, $timeout,
                           $location, $uibModal,
                           $templateCache, vocabs_factory) {

        /* Define our template for the PoolParty project typeahead.
           The difference from the default template is our use of
           [[ ... ]] instead of {{ ... }} for embedded AngularJS.
        */
        $templateCache.put("uib/template/typeahead/typeahead-match.html",
           "<a href\n" +
           "   tabindex=\"-1\"\n" +
           "   ng-bind-html=\"match.label | uibTypeaheadHighlight:query\"\n" +
           "   ng-attr-title=\"[[match.label]]\"></a>\n" +
           "");

        // Initialise Registry API access.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var defaultClient = VocabularyRegistryApi.ApiClient.instance;
        defaultClient.basePath = registry_api_url;
        // Let the registry know that we are the CMS, and what URL this page is.
        defaultClient.defaultHeaders['portal-id'] = 'Portal-JS-CMS';
        defaultClient.defaultHeaders['portal-referrer'] =
            truncateHeader(window.location.toString());
        // Configure API key authorization: apiKeyAuth
        var apiKeyAuth = defaultClient.authentications['apiKeyAuth'];
        var cookie = readCookie('ands_authentication');
        if (cookie) {
            apiKeyAuth.apiKey = cookie;
        }
        var api = new VocabularyRegistryApi.ResourcesApi();
        var ServicesAPI = new VocabularyRegistryApi.ServicesApi();
        // UtilitiesAPI is used not only by us, but also by
        // languageSelectionDirective.js, so it needs to be in $scope.
        $scope.UtilitiesAPI = new VocabularyRegistryApi.UtilitiesApi();

        // TODO: Move to config
        $scope.PPServerID = 1;

        // Whether the "Exit" button should become
        // an "Exit Without Saving" button, with
        // user confirmation required.
        $scope.confirmationRequiredOnExit = false;

        // $scope.commitVocabOwner is set to true if/when the owner
        // field has been "locked in": either, this is a new vocab,
        // and the user has made a selection from the owner dropdown
        // and clicked the Continue button, _or_, we are editing an
        // existing vocabulary (i.e., for which the owner is set
        // already).
        $scope.commitVocabOwner = false;

        // Used to keep a record of the selection of PoolParty project.
        // The value starts and remains false if we are not adding
        // from PoolParty, or if we are adding from PoolParty, but
        // the project has not yet been selected.
        $scope.poolPartySelection = false;

        // Called by clicking the "Use this PoolParty Project" button.
        // Save the selected project into $scope.poolPartySelection.
        $scope.selectPoolPartyProject = function(project) {
            $scope.poolPartySelection = project;
            // And now enable the Owner selection.
            $scope.decide = true;
        }

        // Called by clicking the Continue button.
        // Handle the case of adding from PoolParty, where we
        // know what the selected project is, but we haven't yet
        // fetched the project's metadata from PoolParty.
        $scope.setCommitVocabOwner = function() {
            $scope.commitVocabOwner = true;
            if ($scope.poolPartySelection !== false) {
                $scope.populate($scope.poolPartySelection);
            }
        }

        $scope.form = {};

        // Initialize sections that can have multiple instances.
        // Note the distinction between sections which are optional,
        // and those for which there must be at least one instance.
        $scope.vocab = {
            top_concept: [],
            subjects: [
                {
                    subject_source: "anzsrc-for",
                    subject_label: "",
                    subject_iri: "",
                    subject_notation: ""
                }
            ],
            language: [null],
            related_entity: [],
            versions: []
        };

        /* TinyMCE options.
          content_css: ensure that we get the same font and size as
          the rest of the form.
          body_class and content_style: using the content_css setting means
          we include lib.css, which sets body margin to 0. So need these
          to settings to get back the nice 8 pixel margin.
          plugins: legacyoutput to get <u> and <strike>.
          force_root_block to avoid <p> tag around the content.
          link_title and target_list: lock down supported link attributes.
            content_css: '../assets/vocabs/css/lib.css',
          relative_urls, document_base_url, remove_script_host: "support"
            relative URLs in href attributes, by rewriting them against
            our base_url.
         */
        $scope.tinymceOptions = {
            content_css: [
                'https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700,900,300italic,400italic,600italic',
                base_url + 'assets/templates/ands-green/css/bootstrap.min.css',
                base_url + 'assets/templates/ands-green/css/fonts.min.css',
                base_url + 'assets/templates/ands-green/css/swatch-gray.css',
                base_url + 'assets/templates/ands-green/css/theme.css',
            ],
            body_class: 'vocabs_tinymce',
            content_style: '.vocabs_tinymce {margin: 8px;}',
            plugins: 'legacyoutput link lists code paste',
            toolbar: 'undo redo | styleselect | bold italic underline strikethrough superscript subscript | bullist numlist outdent indent blockquote codeformat | link | code',
            menubar: false,
            style_formats: [
                {
                    title: 'Blocks',
                    items: [
                        { title: 'Paragraph', format: 'p' },
                        { title: 'Blockquote', format: 'blockquote' },
                        { title: 'Pre', format: 'pre' }
                    ]
                }
            ],
            forced_root_block: false,
            link_title: false,
            target_list: false,
            valid_elements: 'a[href|target:_blank|rel:nofollow],b,blockquote,br,cite,code,dd,dl,dt,em,i,li,ol,p,pre,q,small,span,strike,strong,sub,sup,u,ul',
            relative_urls: false,
            document_base_url: base_url,
            remove_script_host: false
        };

        /**
         * Collect all the user roles, for vocab.owner value
         */
        ServicesAPI.getUserData().then(function(data) {
            $log.debug("User Data fetched", data);
            $scope.user_orgs = [];
            $scope.user_orgs_names = [];
            var parentRoles = data.getParentRole();
            if (parentRoles !== null) {
                // Filter organisational roles and sort by full name.
                var orgRoles = parentRoles.filter(function(role) {
                    return role.getTypeId() ==
                        VocabularyRegistryApi.Role.TypeIdEnum.ORGANISATIONAL;}).
                    sort(function (a, b) {
                        // Case-insensitive sort of full names, based
                        // on https://developer.mozilla.org/en-US/docs/Web/
                        //    JavaScript/Reference/Global_Objects/Array/sort
                        var nameA = a.getFullName().toUpperCase();
                        var nameB = b.getFullName().toUpperCase();
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        return 0;
                    });

                $scope.user_orgs_names = orgRoles.map(function(role) {
                    return {
                        id: role.getId(),
                        name: role.getFullName()
                    }
                });
                $scope.user_orgs = orgRoles.map(function(role) {
                    return role.getId();
                });
            } else {
                $log.debug("user has no role", data['parentRole']);
            }
        });


        $scope.vocab.user_owner = $scope.user_owner;

        $scope.mode = 'add'; // [add|edit]


        // Settings for language selection.
        var mostCommonLanguageGroup = 'Commonly-used languages';
        var customLanguageGroup = 'Custom languages';
        $scope.languagesConfig = {
            'customGroup': customLanguageGroup
        };
        $scope.languagesConfig.languageList = [
            { 'group': mostCommonLanguageGroup, 'tag': 'en', 'description': 'English' },
            { 'group': mostCommonLanguageGroup, 'tag': 'zh', 'description': 'Chinese' },
            { 'group': mostCommonLanguageGroup, 'tag': 'fr', 'description': 'French' },
            { 'group': mostCommonLanguageGroup, 'tag': 'de', 'description': 'German' },
            { 'group': mostCommonLanguageGroup, 'tag': 'it', 'description': 'Italian' },
            { 'group': mostCommonLanguageGroup, 'tag': 'ja', 'description': 'Japanese' },
            { 'group': mostCommonLanguageGroup, 'tag': 'mi', 'description': 'Māori' },
            { 'group': mostCommonLanguageGroup, 'tag': 'ru', 'description': 'Russian' },
            { 'group': mostCommonLanguageGroup, 'tag': 'es', 'description': 'Spanish' }
        ];
        // Extract just the list of known tags, for use in
        // $scope.applyPPData.
        var languageListTags = $scope.languagesConfig.languageList.map(
            function(language) {
                return language.tag;
            });
        // Setter for the error message for language tag validation.
        // NB: this is shared across all language fields.
        $scope.setLanguageErrors = function(error) {
            if (error === undefined) {
                delete $scope.languageErrors;
            } else {
                $scope.languageErrors = error;
            }
        }

        $scope.licence = ["CC-BY", "CC-BY-SA", "CC-BY-ND",
                          "CC-BY-NC", "CC-BY-NC-SA", "CC-BY-NC-ND",
                          "CC0",
                          "ODC-By", "GPL", "AusGoalRestrictive",
                          "NoLicence", "Unknown/Other"];

        // Initialize subject sources
        $scope.subject_sources = [];
        // $scope.subject_sources will be an array of objects; one
        // for each vocabulary in the subject source dropdown.
        // Each object has keys "id", "label", and "mode".
        // For id other than "local", there will also be
        // keys "resolvingService" and "uriprefix".
        // The data comes from the top-level global_config.php's
        // $ENV['vocab_resolving_services'] setting.
        // For legacy reasons, the resolvingService setting
        // typically ends with a slash, but the vocab widget
        // requires a repository setting _without_ a trailing
        // slash. So we remove such during initialization.
        // E.g., {"id":"anzsrc-for",
        //        "label":"ANZSRC Field of Research",
        //        "mode":"tree",
        //        "resolvingService":"http://...",
        //        "uriprefix":"http://purl.org/.../"
        //       }
        // See if there are vocab resolving services.
        if (typeof vocab_resolving_services !== 'object') {
            alert('Unable to populate subject source dropdown');
            return;
        }
        // Vocab resolving services are available.
        for (var v in vocab_resolving_services) {
            var vo = {id: v};
            $.each(vocab_resolving_services[v],
                   function (key, value) {
                       if (key === 'resolvingService') {
                           // Special treatment. Remove any
                           // trailing slash(es).
                           vo[key] = value.replace(/\/$/, "");
                       } else {
                           vo[key] = value;
                       }
                   });
            $scope.subject_sources.push(vo);
        }

        // Is the datepicker popup open?
        $scope.opened = false;
        // The $scope.decide flag determines whether the user
        // sees the PoolParty integration fields (if false)
        // or the main CMS fields (if true).
        $scope.decide = false;

        $scope.creation_date = '';
        $scope.creation_date_changed = false;

        $scope.status = 'idle';

        /**
         * If there is a slug available, this is an edit view for the CMS
         * Proceed to overwrite the vocab object with the one fetched
         * from the Registry API
         * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
         */
        if ($('#vocab_id').val()) {
            $scope.decide = true;
            api.getVocabularyByIdEdit($('#vocab_id').val()).then(
                             function (data) {
               $log.debug('Editing ', data);
               $scope.commitVocabOwner = true;
                // Preserve the original data for later. We need this
                // specifically for the creation_date value.
                $scope.original_data = data;
                // Copy the values into the form.
                $scope.copy_incoming_vocab_to_scope(data);
                $scope.mode = 'edit';
                // Special handling for creation date.
                $scope.set_creation_date_textfield($scope);
//                $log.debug($scope.form.cms);
            });
        } else {
            /**
             * Collect All PoolParty Project
             * For adding
             */
            $scope.projects = [];
            $scope.ppid = {};
            $scope.fetchingPP = true;
            ServicesAPI.getPoolPartyProjects($scope.PPServerID)
                .then(function(data){
                    $log.debug("All PP Project fetched", data);
                    $scope.$apply(function() {
                        $scope.fetchingPP = false;
                        $scope.projects = data;
                    });
                });
        }

        // Copy existing vocabulary data provided by the Registry API
        // into the scope for the form.
        // TODO: move this to another factory/service, this does not really belong in a controller
        $scope.copy_incoming_vocab_to_scope = function (data) {
            $scope.vocab = [];
            // Top-level metadata
            $scope.vocab.status = data.getStatus();
            $scope.vocab['title'] = data.getTitle();
            $scope.vocab['acronym'] = data.getAcronym();
            $scope.vocab['description'] = data.getDescription();
            $scope.vocab['licence'] = data.getLicence();
            $scope.vocab['revision_cycle'] = data.getRevisionCycle();
            $scope.vocab['note'] = data.getNote();
            $scope.vocab['owner'] = data.getOwner();
            $scope.vocab['top_concept'] = angular.copy(data.getTopConcept());
            // Special handling for creation_date done elsewhere.
            $scope.vocab['language'] = [ data.getPrimaryLanguage() ];
            angular.forEach(data.getOtherLanguage(), function(lang) {
                $scope.vocab['language'].push(lang);
            });
            // Now also update $scope.languagesConfig.languageList with any
            // languages we don't already know about.
            var languageDetails = data.getLanguageList().getLanguageDetails();
            angular.forEach($scope.vocab['language'], function(lang) {
                var found = $scope.languagesConfig.languageList.find(function(element) {
                    return element.tag === lang;
                });
                if (found == undefined) {
                    var foundInLD = languageDetails.find(function(element) {
                        return element.tag == lang;
                    });
                    var newLang = { 'group': customLanguageGroup,
                                    'tag': foundInLD.tag,
                                    'description': foundInLD.description};
                    $scope.languagesConfig.languageList.unshift(newLang);
                }
            });

            $scope.vocab['subjects'] = [];

            var PPProject = data.getPoolpartyProject();
            if (PPProject) {
                $scope.vocab['poolparty_id'] = PPProject.getProjectId();
            }

            angular.forEach(data.getSubject(), function(subject) {
                $scope.vocab['subjects'].push({
                    subject_source: subject.getSource(),
                    subject_label: subject.getLabel(),
                    subject_iri: subject.getIri(),
                    subject_notation: subject.getNotation()
                });
            });
            // Related entities
            $scope.vocab['related_entity'] = [];
            angular.forEach(data.getRelatedEntityRef(), function(reRef) {
                var re = reRef.getRelatedEntity();
                var reForForm = {
                        'id': reRef.getId(),
                        'type': re.getType(),
                        'title': re.getTitle(),
                        'owner' : re.getOwner(),
                        'relationship' : angular.copy(reRef.getRelation())
                    };
                if (re.getEmail()) {
                    reForForm['email'] = re.getEmail();
                }
                if (re.getPhone()) {
                    reForForm['phone'] = re.getPhone();
                }
                // Identifiers
                reForForm['identifiers'] = [];
                angular.forEach(re.getRelatedEntityIdentifier(), function(id) {
                    reForForm['identifiers'].push(
                            {'id': id.getId(),
                             'rei_type' : id.getIdentifierType(),
                             'rei_value' : id.getIdentifierValue()});
                });
                // URLs
                reForForm['urls'] = [];
                angular.forEach(re.getUrl(), function(url) {
                    reForForm['urls'].push({'url' : url});
                });
                $scope.vocab['related_entity'].push(reForForm);
            });
            // Related internal vocabularies
            $scope.vocab['related_vocabulary'] = [];
            angular.forEach(data.getRelatedVocabularyRef(), function(rvRef) {
                var rv = rvRef.getRelatedVocabulary();
                var rvForForm = {
                        'id': rvRef.getId(),
                        'type': 'internal',
                        'title': rv.getTitle(),
                        'relationship' : angular.copy(rvRef.getRelation())
                    };
                $scope.vocab['related_vocabulary'].push(rvForForm);
            });

            $scope.vocab['versions'] = [];
            angular.forEach(data.getVersion(), function(ver) {
                var versionForForm = {
                    'id': ver.getId(),
                    'status': ver.getStatus(),
                    'title': ver.getTitle(),
                    'slug': ver.getSlug(),
                    'release_date': ver.getReleaseDate(),
                    'note': ver.getNote(),
                    // 'import': ver.getDoImport(),
                    // 'publish': ver.getDoPublish(),
                    'doImport': ver.getDoImport(),
                    'doPublish': ver.getDoPublish(),
                    'doPoolpartyHarvest': ver.getDoPoolpartyHarvest(),
                    'browseFlags': ver.getBrowseFlag(),
                    'forceWorkflow': ver.getForceWorkflow(),
                    'access_points': ver.getAccessPoint().map(function (ap) {
                        var APForm = {
                            type: ap.getDiscriminator(),
                            id: ap.getId()
                        };
                        switch (ap.getDiscriminator()) {
                            case "webPage":
                                APForm.uri = ap.getApWebPage().getUrl();
                                break;
                            case "apiSparql":
                                APForm.uri = ap.getApApiSparql().getUrl();
                                break;
                            case "sissvoc":
                                APForm.uri = ap.getApSissvoc().getUrlPrefix();
                                break;
                            case "file":
                                APForm.uri = ap.getApFile().getUrl();
                                APForm.format = ap.getApFile().getFormat();
                                APForm.upload_id = ap.getApFile().getUploadId();
                                break;
                        }

                        return APForm;
                    })
//                        '': ver.get(),
                };
                $scope.vocab['versions'].push(versionForForm);
            });
            $log.debug("Local vocab scope", $scope.vocab);
        };

        // Create a Registry API model object based on the form values.
        // TODO: migrate this outside of controller, this is not a controller method
        $scope.create_vocab_from_scope = function () {
            var vocab = new VocabularyRegistryApi.Vocabulary();
            if ($('#vocab_id').val()) {
                vocab.setId($('#vocab_id').val());
            }
            if ($('#vocab_slug').val()) {
                vocab.setSlug($('#vocab_slug').val());
            }

            // set PP
            if ($scope.vocab['poolparty_id']) {
                var PPProject = new VocabularyRegistryApi.PoolpartyProject();
                PPProject.setServerId(1);
                PPProject.setProjectId($scope.vocab['poolparty_id']);
                vocab.setPoolpartyProject(PPProject);
            }

            vocab.setTitle($scope.vocab['title']);
            vocab.setAcronym($scope.vocab['acronym']);
            vocab.setDescription($scope.vocab['description']);
            vocab.setLicence($scope.vocab['licence']);
            vocab.setRevisionCycle($scope.vocab['revision_cycle']);
            vocab.setNote($scope.vocab['note']);
            vocab.setOwner($scope.vocab['owner']);
            vocab.setTopConcept(angular.copy($scope.vocab['top_concept']));
            // Extract creation date directly from the input text field, not
            // from the model value.
            vocab.setCreationDate($('#creation_date').val());
            var languages = angular.copy($scope.vocab['language']);
            vocab.setPrimaryLanguage(languages.shift());
            vocab.setOtherLanguage(languages);

            // subjects
            if ($scope.vocab['subjects'].length) {
                var subjects = $scope.vocab['subjects'].map(function(subject) {
                    var subjectModel = new VocabularyRegistryApi.Subject();
                    subjectModel.setSource(subject['subject_source']);
                    subjectModel.setLabel(subject['subject_label']);
                    subjectModel.setIri(subject['subject_iri']);
                    subjectModel.setNotation(subject['subject_notation']);
                    return subjectModel;
                });
                vocab.setSubject(subjects);
            }

            // related-entities
            if ($scope.vocab['related_entity'].length) {
                var relatedEntitiesRefs = $scope.vocab['related_entity'].map(function (re) {
                    var relatedEntity =  new VocabularyRegistryApi.RelatedEntityRef();
                    relatedEntity.setId(re['id']);
                    relatedEntity.setRelation(re['relationship']);
                    return relatedEntity;
                });
                vocab.setRelatedEntityRef(relatedEntitiesRefs);
            }

            // related-vocabularies
            if ('related_vocabulary' in $scope.vocab && $scope.vocab['related_vocabulary'].length) {
                var relatedVocabulariesRef = $scope.vocab['related_vocabulary'].map(function(re){
                   var relatedEntity = new VocabularyRegistryApi.RelatedVocabularyRef();
                   relatedEntity.setId(re['id']);
                   relatedEntity.setRelation(re['relationship']);
                   return relatedEntity;
                });
                vocab.setRelatedVocabularyRef(relatedVocabulariesRef);
            }

            if ($scope.vocab['versions'].length) {
                var versions = $scope.vocab['versions'].map(function(version) {
                    var versionEntity = new VocabularyRegistryApi.Version();

                    if (version['id']) {
                        versionEntity.setId(version['id']);
                    }

                    versionEntity.setTitle(version['title']);
                    versionEntity.setNote(version['note']);
                    var release_date = 'release_date_val' in version ?
                        version['release_date_val'] : version['release_date'];
                    versionEntity.setReleaseDate(release_date);

                    versionEntity.setStatus(version['status']);

                    if (version['doImport'] && version['doImport'] === true) {
                        versionEntity.setDoImport(true);
                    } else versionEntity.setDoImport(false);

                    if (version['doPublish'] && version['doPublish'] === true) {
                        versionEntity.setDoPublish(true);
                    } else versionEntity.setDoPublish(false);

                    if (version['doPoolpartyHarvest'] &&
                        version['doPoolpartyHarvest'] === true) {
                        versionEntity.setDoPoolpartyHarvest(true);
                    } else versionEntity.setDoPoolpartyHarvest(false);

                    if (version['browseFlags'] &&
                        Array.isArray(version['browseFlags'])) {
                        versionEntity.setBrowseFlag(version['browseFlags']);
                    }

                    if (version['forceWorkflow'] &&
                        version['forceWorkflow'] === true) {
                        versionEntity.setForceWorkflow(true);
                    } else versionEntity.setForceWorkflow(false);

                    // access points
                    var accessPoints = version['access_points'].map(
                        function(ap) {
                            return $scope.packAccessPoint(ap);
                        });
                    versionEntity.setAccessPoint(accessPoints);

                    return versionEntity;
                });
                vocab.setVersion(versions);
            }

            return vocab;
        };

        // packing access points into the right format for delivery
        $scope.packAccessPoint = function (ap) {
            var APEntity = new VocabularyRegistryApi.AccessPoint();
            if ("id" in ap) {
                APEntity.setId(ap['id']);
            }
            APEntity.setDiscriminator(ap['type']);
            APEntity.setSource(VocabularyRegistryApi.AccessPoint.SourceEnum.user);
            switch (ap['type']) {
                case "webPage":
                    APEntity.setDiscriminator(VocabularyRegistryApi.AccessPoint.DiscriminatorEnum.webPage);
                    var APWebPage = new VocabularyRegistryApi.ApWebPage;
                    APWebPage.setUrl(ap['uri']);
                    APEntity.setApWebPage(APWebPage);
                    break;
                case "apiSparql":
                    APEntity.setDiscriminator(VocabularyRegistryApi.AccessPoint.DiscriminatorEnum.apiSparql);
                    var APapiSparql = new VocabularyRegistryApi.ApApiSparql();
                    APapiSparql.setUrl(ap['uri']);
                    APEntity.setApApiSparql(APapiSparql);
                    break;
                case "sissvoc":
                    APEntity.setDiscriminator(VocabularyRegistryApi.AccessPoint.DiscriminatorEnum.sissvoc);
                    var APsissvoc = new VocabularyRegistryApi.ApSissvoc();
                    APsissvoc.setUrlPrefix(ap['uri']);
                    APEntity.setApSissvoc(APsissvoc);
                    break;
                case "file":
                    APEntity.setDiscriminator(VocabularyRegistryApi.AccessPoint.DiscriminatorEnum.file);
                    var APFile = new VocabularyRegistryApi.ApFile();
                    APFile.setFormat(ap['format']);
                    APFile.setUploadId(ap['upload_id']);
                    APFile.setUrl(ap['uri']);
                    APEntity.setApFile(APFile);
                    break;
                default:
                    $log.error("Unknown AP type: ", ap['type']);
                    break;
            }
            // if (ap['type'] === VocabularyRegistryApi.AccessPoint.DiscriminatorEnum.webPage)
            // APEntity.setUrl(ap['url']);
            //APEntity.setUploadID(ap['upload_id']);
            $log.debug("Packed AP ", ap, APEntity);
            return APEntity;
        };


        // Now follows all the code for special treatment of the creation date.
        // See also versionCtrl.js, which has a modified version of all of
        // this for version release dates.

        /* Flag to determine when to reset the content of the creation date
           text field. Set by set_creation_date_textfield() and reset by the
           watcher put on vocab.creation_date. */
        $scope.restore_creation_date_value = false;

        /* Special handling for the creation date field. Needed because of the
           combination of the text field, the off-the-shelf datepicker,
           and the desire to allow partial dates (e.g., year only). */
        $scope.set_creation_date_textfield = function (scope) {
            // In some browser JS engines, the Date constructor interprets
            // "2005" not as though it were "2005-01-01", but as 2005 seconds
            // into the Unix epoch. But Date.parse() seems to cope better,
            // so pass the date field through Date.parse() first. If that
            // succeeds, it can then go through the Date constructor.
            var dateValParsed = Date.parse($scope.original_data.getCreationDate());
            if (!isNaN(dateValParsed)) {
                var dateVal = new Date(dateValParsed);
                $scope.vocab.creation_date = dateVal;
                // Set this flag, so that the watcher on the vocab.creation_date
                // field knows to reset the text field to the value we got
                // from the database.
                $scope.restore_creation_date_value = true;
            }
        };

        /* Callback function used by the watcher on vocab.creation_date.
           It overrides the content of the creation date text field with
           the value we got from the database. */
        $scope.do_restore_creation_date = function() {
            $('#creation_date').val($scope.original_data.getCreationDate());
        };

        /* Watcher for the vocab.creation_data field. If we got notification
           (via the restore_creation_date_value flag) to reset the text
           field value, schedule the reset. Need to use $timeout
           so that the reset happens after the current round of
           AngularJS model value propagation. */
        $scope.$watch('vocab.creation_date', function() {
            if ($scope.restore_creation_date_value) {
                $scope.restore_creation_date_value = false;
                $timeout($scope.do_restore_creation_date, 0);
            }
        });


        // The link from My Vocabs passes adds ?skip=true
        // for the "Add a new Vocabulary" link.
        if ($location.search().skip) {
            $scope.decide = true;
        } else if($location.search().message == 'saved_draft') {
            $scope.success_message = [];
            $scope.success_message.push('Successfully saved to a Draft.');
        }



        $scope.projectSearch = function (q) {
            return function (item) {
                if (item.title.toLowerCase().indexOf(q.toLowerCase()) > -1 || item['id'].toLowerCase().indexOf(q.toLowerCase()) > -1) {
                    return true;
                } else return false;
            }
        };


        /**
         * Helper method for helping choosing between the dcterms
         * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
         * @return chosen      the chosen one/s
         * @param mess
         */
        $scope.choose = function (mess) {

            //the order we should look
            var order_trig = ['concepts', 'adms', 'void'];
            var order_lang = ['value_en', 'value'];

            //find the one with the right trig, default to the first one if none was found
            var which = false;
            angular.forEach(order_trig, function (trig) {
                if (mess[trig] && !which) which = mess[trig];
            });
            if (!which) which = mess[0];
            // $log.debug(which);

            //find the right value for the right trig, default to the first one
            var chosen = false;
            angular.forEach(order_lang, function (lang) {
                if (which[lang] && !chosen) chosen = which[lang];
            });
            if (!chosen) chosen = which[0];
            // $log.debug(trig);

            return chosen;
        };

        // $scope.populatingPP is set to true just before invoking
        // the API method to fetch metadata from PoolParty, and
        // is set back to false in the callback from the API method.
        $scope.populatingPP = false;
        /**
         * Populate the vocab with data
         * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
         * @param project
         * @param project
         */
        $scope.populate = function (project) {
            if (!project) {
                $log.debug("No project to populate")
                return;
            }

            //populate data from the PP API first
            //if selection was made
            //otherwise assume the pooplParty ID is still in the field unprocessed!!!
            if(typeof project.id != 'undefined'){
                $scope.vocab.poolparty_id = project.id;
            } else {
                $scope.vocab.poolparty_id = project;
            }

            $scope.decide = true;

            $scope.populatingPP = true;
            ServicesAPI.getPoolPartyProjectMetadata($scope.PPServerID, $scope.vocab.poolparty_id).then(function(data) {
                if (!data) {
                    return;
                }

                $scope.$apply(function() {
                    $scope.populatingPP = false;
                    $log.debug("Fetched PP Project", data);
                    $scope.applyPPData(data);
                });
            });

        };

        $scope.applyPPData = function(data) {

            // CC-1447. Provide some feedback, if the Toolkit
            // returned with either an error or an exception.
            // This can happen, e.g., if the PP project does
            // not exist, or if the RDF data is invalid (and
            // therefore can not be parsed to extract metadata).
            if (("error" in data) || ("exception" in data)) {
                alert("Unable to get project metadata from PoolParty. Fields will not be pre-filled.");
                return;
            }

            // Get the primary language, so we can use it to fetch
            // other values. Defaults to 'en'.
            // Get the other languages while we're here.

            // Note: we _don't_ just build up $scope.vocab.language
            // directly, but rather, we first populate a local
            // variable languagesInMetadata. Only when we have
            // the details of all the languages ready to go in
            // $scope.languagesConfig.languageList do we then copy
            // a value into $scope.vocab.language.
            // If we don't do it this way, the language selection
            // widget will discard any language tag not already present
            // in languageList.
            var primaryLanguage = 'en';
            var languagesInMetadata = [];
            if (data['dcterms:language']) {
                var primaryLanguage = $scope.choose(
                    data['dcterms:language'])[0];
                languagesInMetadata = [];
                languagesInMetadata.push(primaryLanguage);
                if (data['ppcl:availablelanguages']) {
                    var otherLanguages = $scope.choose(
                        data['ppcl:availablelanguages']); {
                            angular.forEach(otherLanguages, function (lang) {
                                if (lang != primaryLanguage) {
                                    languagesInMetadata.push(lang);
                                }
                            });
                        }
                }
            }
            // Fetch details of any languages not in the
            // "commonly-used" list.
            // We build two lists: one containing the tags we "know" about;
            // one of the tags we don't, and which need to be looked up.
            var languagesNoNeedToLookUp = [];
            var languagesToLookUp = [];
            // Keep track especially of whether the primary language is to be looked
            // up, so we can make sure it goes first in the final result.
            var primaryLanguageNeedToLookUp =
                languageListTags.indexOf(languagesInMetadata[0]) === -1;
            angular.forEach(languagesInMetadata, function(tag) {
                if (languageListTags.indexOf(tag) === -1) {
                    languagesToLookUp.push(tag);
                } else {
                    languagesNoNeedToLookUp.push(tag);
                }
            });
            if (languagesToLookUp.length > 0) {
                $scope.UtilitiesAPI.parseLanguageTags(languagesToLookUp).then(function(data) {
                    var languageList = angular.copy(languagesNoNeedToLookUp);
                    var languageDetailsResponse = data.getLanguageDetails();
                    if (primaryLanguageNeedToLookUp) {
                        // Make sure that the primary language ends up
                        // first in the list, whatever has
                        // happened. If it's unknown, insert a blank
                        // entry, so that none of the other languages
                        // gets "bumped up" to be the primary language.
                        var languageDetail = languageDetailsResponse.shift();
                        // Note the use of unshift() here, but push()
                        // later on: the primary language goes at the
                        // front; other languages go at the end.
                        if ('tag' in languageDetail) {
                            var newLang = { 'group': customLanguageGroup,
                                            'tag': languageDetail.getTag(),
                                            'description': languageDetail.getDescription()};
                            $scope.languagesConfig.languageList.unshift(newLang);
                            // The tag may have been canonicalized to
                            // something different, so use what came back.
                            languageList.unshift(languageDetail.getTag());
                        } else {
                            // Unknown primary language.
                            languageList.unshift('');
                        }
                    }
                    angular.forEach(languageDetailsResponse, function(languageDetail) {
                        var newLang = { 'group': customLanguageGroup,
                                        'tag': languageDetail.getTag(),
                                        'description': languageDetail.getDescription()};
                        $scope.languagesConfig.languageList.unshift(newLang);
                        // The tag may have been canonicalized to
                        // something different, so use what came back.
                        languageList.push(languageDetail.getTag());
                    });
                    // Now we can set the languages.
                    $scope.vocab.language = languageList;
                });
            } else {
                // None to look up; good to go with
                // languagesNoNeedToLookUp.
                $scope.vocab.language = languagesNoNeedToLookUp;
            }

            if (data['dcterms:title']) {
                $scope.vocab.title = $scope.choose(data['dcterms:title']);
                if (angular.isArray($scope.vocab.title)) $scope.vocab.title = $scope.vocab.title[0];
            }

            if (data['dcterms:description']) {
                $scope.vocab.description = $scope.choose(data['dcterms:description']);
                if (angular.isArray($scope.vocab.description)) $scope.vocab.description = $scope.vocab.description[0];
            }

            if (data['dcterms:subject']) {
                //overwrite the previous ones
                var chosen = $scope.choose(data['dcterms:subject']);

                $scope.vocab.subjects = [];
                angular.forEach(chosen, function (theone) {
                    $scope.vocab.subjects.push(
                        {subject_source: 'local',
                            subject_label: theone,
                            subject_iri: '',
                            subject_notation: ''
                        });
                });
            }

            //related entity population
            if (!$scope.vocab.related_entity) $scope.vocab.related_entity = [];

            //Go through the list to determine the related entities to add
            var rel_ent = [
                {field: 'dcterms:publisher', relationship: 'publishedBy'},
                {field: 'dcterms:contributor', relationship: 'hasContributor'},
                {field: 'dcterms:creator', relationship: 'hasAuthor'}
            ];

            var relatedEntities = [];

            angular.forEach(rel_ent, function (rel) {
                if (data[rel.field]) {
                    var chosen = $scope.choose(data[rel.field]);
                    var list = [];
                    if (angular.isString(chosen)) {
                        list.push(chosen);
                    } else {
                        angular.forEach(chosen, function (item) {
                            list.push(item);
                        });
                    }
                    angular.forEach(list, function (item) {

                        //check if same item exist
                        var exist = false;
                        angular.forEach(relatedEntities, function (entity) {
                            if (entity.title == item) exist = entity;
                        });

                        if (exist) {
                            exist.relationship.push(rel.relationship);
                        } else {
                            relatedEntities.push({
                                title: item,
                                type: 'party',
                                relationship: [rel.relationship],
                                urls: [],
                                identifiers: []
                            });
                        }
                    })
                }
            });

            // resolve related entities
            // all related entities upon entering the form must have an id
            api.getRelatedEntities("party").then(function(entities) {
                $log.debug("Fetched all related parties", entities);
                var titles = entities['related-entity'].map(function(re) {
                    return re.title;
                });
                angular.forEach(relatedEntities, function(re){
                    if (titles.indexOf(re.title) >= 0) {
                        // it exists, grab it
                        $log.debug("Related Entity " + re.title + " exists");
                        var entity = entities['related-entity'].find(function(x) {
                             return x.title === re.title;
                        });
                        $log.debug("Found", entity);
                        // Now have to get the full RE, which includes identifiers.

                        api.getRelatedEntityById(entity.getId()).then(function(fullEntity) {
                            // See also copy_incoming_vocab_to_scope, which shows
                            // how to populate from an existing RE.
                            re.id = fullEntity.getId();
                            re.owner = fullEntity.getOwner();
                            if (fullEntity.getEmail()) {
                                re['email'] = fullEntity.getEmail();
                            }
                            if (fullEntity.getPhone()) {
                                re['phone'] = fullEntity.getPhone();
                            }
                            // Identifiers
                            re['identifiers'] = [];
                            angular.forEach(fullEntity.getRelatedEntityIdentifier(), function(id) {
                                re['identifiers'].push(
                                    {'id': id.getId(),
                                     'rei_type' : id.getIdentifierType(),
                                     'rei_value' : id.getIdentifierValue()});
                            });
                            // URLs
                            re['urls'] = [];
                            angular.forEach(fullEntity.getUrl(), function(url) {
                                re['urls'].push({'url' : url});
                            });
                            $scope.$apply(function() {
                                $scope.vocab.related_entity.push(re);
                            });
                        });

                    } else {
                        // it doesn't exist, create it
                        $log.debug("Related Entity " + re.title + " doesn't exist");
                        var relatedEntity = $scope.packRelatedEntityFromData(re);
                        $log.debug("Creating related entity", relatedEntity);
                        api.createRelatedEntity(relatedEntity)
                            .then(function(resp) {
                                $log.debug("Success creating related entity", resp);
                                re.id = resp.id;
                                $scope.$apply(function() {
                                    $scope.vocab.related_entity.push(re);
                                });
                            }, function(resp) {
                                $log.error("Failed to create related entity", resp);
                                var apiError = VocabularyRegistryApi.Error.
                                    constructFromObject(resp.response.body);
                                $scope.show_alert_with_callback(
                                    'There was an error creating a new '
                                        + 'related entity: '
                                        + apiError.getMessage(),
                                    function() {});
                            });
                    }
                });
            });
        };

        /**
         * Get any alert text to be displayed, after save/publish.
         * Alert text is found by going through data's workflow-outcome
         * element, if there is one,
         * looking for subtask results that have a key/value pair in
         * which the key is 'alert-html'.
         * All such values are concatenated, separated by 'br' tags.
         * @param data Data returned from the save/publish service.
         * @return The alert message to be displayed.
         */
        $scope.get_alert_text_after_save = function (data) {
            var workflowOutcome;
            try {
                workflowOutcome = data.getWorkflowOutcome();
            } catch (err) {
                return '';
            }
            var alerts = [];
            if (workflowOutcome != null) {
              // For each task outcome, each
              // subtask outcome, each subtask result:
              // see if it is an alert (has result-key 'alert-html').
              var taskOutcomes = workflowOutcome.getTaskOutcome();
              if (taskOutcomes != null) {
                taskOutcomes.forEach(
                  function (taskOutcome) {
                    if (taskOutcome.getStatus() === 'error') {
                        alerts.push('Alert: There was an error processing a ' +
                                    'version of the vocabulary (version Id = ' +
                                    taskOutcome.getVersionId() +
                                    '). Please contact ' +
                                    'services@ardc.edu.au for more ' +
                                    'information.');
                    }
                    var subtaskOutcomes = taskOutcome.getSubtaskOutcome();
                    if (subtaskOutcomes != null) {
                      subtaskOutcomes.forEach(
                        function (subtaskOutcome) {
                          var subtaskResults = subtaskOutcome.
                            getSubtaskResult();
                          if (subtaskResults != null) {
                            subtaskResults.forEach(
                              function (subtaskResult) {
                                if (subtaskResult.getResultKey() ===
                                    'alert-html') {
                                  alerts.push(subtaskResult.getResultValue());
                                }
                              });
                          }
                        });
                    }
                  });
              }
              return alerts.join('<br />');
            }
            return '';
        };

        /**
         * Show any alert, after save/publish. When the alert
         * is hidden (by the user closing it), invoke the
         * hide_callback function.
         * If no alert is to be shown, invoke the hide_callback
         * function immediately.
         * @param data Data returned from save/publish service.
         * @param hide_callback Callback function to be invoked
         *     when the alert is hidden.
         */
        $scope.show_alert_after_save = function (data, hide_callback) {
            var alert_message = $scope.get_alert_text_after_save(data);
            if (alert_message != '') {
                $('body').qtip({
                    content: {
                        text: alert_message,
                        title: 'Alert',
                        button: 'Close'
                    },
                    style: {
                        classes: 'qtip-bootstrap cms-help-tip'
                    },
                    position: {
                        my: 'center',
                        at: 'center',
                        target: $(window)
                    },
                    show: {
                        modal: true,
                        when : false
                    },
                    hide: {
                        // Overrides the default of 'mouseleave'.
                        // Otherwise, clicking a link in the
                        // alert text that has target="_blank"
                        // opens a new tab/window, but also
                        // closes the modal. With this setting,
                        // the user can go back to the original
                        // tab/window and still see the modal.
                        event: ''
                    },
                    events: {
                        hide: hide_callback
                    }
                });
                $('body').qtip('show');
            } else {
                hide_callback();
            }
        };

        /* TO DO: see if possible to reconcile the preceding method
           with the following one.
           The following method was quick/dirty to use a modified
           events/hide so that the modal really goes away when you
           close it. But that might well work for the above
           case too; it never came up because the alerts generated
           by the preceding method are followed by a redirect. */

        /**
         * Show an alert, with basic qTip behaviour. When the alert
         * is hidden (by the user closing it), delete the qTip and
         * invoke the hide_callback function.
         * If no alert is to be shown, invoke the hide_callback
         * function immediately.
         * @param alert_message The alert message to be displayed.
         * @param hide_callback Callback function to be invoked
         *     when the alert is hidden.
         */
        $scope.show_alert_with_callback = function (alert_message,
                                                    hide_callback) {
            if (alert_message != '') {
                $('body').qtip({
                    content: {
                        text: alert_message,
                        title: 'Alert',
                        button: 'Close'
                    },
                    style: {
                        classes: 'qtip-bootstrap cms-help-tip'
                    },
                    position: {
                        my: 'center',
                        at: 'center',
                        target: $(window)
                    },
                    show: {
                        modal: true,
                        when : false
                    },
                    hide: {
                        // Overrides the default of 'mouseleave'.
                        // Otherwise, clicking a link in the
                        // alert text that has target="_blank"
                        // opens a new tab/window, but also
                        // closes the modal. With this setting,
                        // the user can go back to the original
                        // tab/window and still see the modal.
                        event: ''
                    },
                    events: {
                        hide: function(event, api) {
                            api.destroy(true);
                            hide_callback();
                        }
                    }
                });
                $('body').qtip('show');
            } else {
                hide_callback();
            }
        };


        // Exit button, without confirmation modal
        $scope.exitNoConfirmation = function() {
            window.location.replace(base_url + 'vocabs/myvocabs');
            $scope.loading = false;
        }

        // Exit (without saving) button, with confirmation modal
        $scope.exitWithConfirmation = function() {
            if (confirm('All unsaved changes will be lost. ' +
                        'Would you like to continue?')) {
                window.location.replace(base_url + 'vocabs/myvocabs');
                $scope.loading = false;
            }
        }

        $scope.validStatuses = ['draft', 'published', 'deprecated'];

        // targetStatus: [draft, published, deprecated]
        $scope.loading = false;
        $scope.targetStatus = null;
        $scope.save = function (targetStatus) {

            $scope.loading = true;
            $scope.targetStatus = targetStatus;

            if ($scope.validStatuses.indexOf(targetStatus) < 0) {
                $log.error("Target Status " + targetStatus + " is not valid");
                $scope.loading = false;
                return false;
            }

            $scope.tidy_empty();

            // Validation.
            // First, rely on Angular's error handling.
            if ($scope.form.cms.$invalid) {
                // Put back the multi-value lists ready for more editing.
                $scope.ensure_all_minimal_lists();
                $log.error("Form Validation Failed");
                $scope.loading = false;
                return false;
            }

            // Then, do our own validation.
            if (!$scope.validate()) {
                // Put back the multi-value lists ready for more editing.
                $scope.ensure_all_minimal_lists();
                $log.error("Client Validation Failed");
                $scope.loading = false;
                return false;
            }

            // packing up the vocab for transporting
            $log.debug('packing', $scope.vocab);
            var vocab = $scope.create_vocab_from_scope();
            $log.debug('packed to', vocab);

            vocab.setStatus(targetStatus);

            $scope.errors = [];
            $scope.success_message = [];

            if ($scope.mode === "add") {
                api.createVocabulary(vocab)
                    .then(
                        $scope.handleSuccessResponse,
                        $scope.handleErrorResponse
                    ).finally( function() {
                        $scope.$apply(function () {
                            $scope.status = "idle";
                        });
                    });
            } else if ($scope.mode === "edit") {
                api.updateVocabulary(vocab.getId(), vocab)
                    .then(
                        $scope.handleSuccessResponse,
                        $scope.handleErrorResponse
                    ).finally( function() {
                        $scope.$apply(function () {
                            $scope.status = "idle";
                        });
                    });
            }
        };

        $scope.handleSuccessResponse = function (resp) {
            $scope.loading = false;
            $scope.confirmationRequiredOnExit = false;
            $log.debug("Success", resp);

            // Portal-side analytics logging.
            // Make use of $scope.mode,
            // resp.getId(), resp.getStatus(),
            // resp.getTitle(), resp.getSlug(), resp.getOwner()
            var action = 'unknown';
            switch ($scope.mode) {
            case 'add': action = 'create'; break;
            case 'edit': action = 'update'; break;
            }
            $.ajax(base_url + 'vocabs/logCms',
                   {
                       'data': {
                           'action': action,
                           'vocab_id': resp.getId(),
                           'vocab_status': resp.getStatus(),
                           'vocab_title': resp.getTitle(),
                           'vocab_slug': resp.getSlug(),
                           'vocab_owner': resp.getOwner()
                       }
                   });

            // Mark the form as "pristine" (i.e., not "dirty"),
            // for the case(s) in which the form will still be visible
            // after save.
            // (Currently, that means after saving as a draft.)
            // The effect is that if the "Exit Without Saving"
            // button was visible before, it will now become just "Exit".
            $scope.form.cms.$setPristine();
            // Show message.
            $scope.showServerSuccessMessage(resp);

            $scope.show_alert_after_save(resp, function() {
                if ($scope.targetStatus === "published" ||
                    $scope.targetStatus === "deprecated") {
                    window.location.replace(base_url + "viewById/" +
                                            resp.getId());
                    return;
                }

                if ($scope.mode === "add") {
                    // relocate to the new edit page with an id now
                    window.location.replace(base_url +
                                            'vocabs/edit/' + resp.getId());
                    return;
                }
            });
        };

        $scope.handleErrorResponse = function (resp) {
            $scope.loading = false;
            $log.error("Error", resp.status, resp.response.body);
            $scope.showServerValidationErrors(resp.response.body);
        };

        $scope.showServerValidationErrors = function (payload) {
            if (!payload) {
                $log.error("Server Response unreadable");
                return;
            }
            $log.debug("Showing errors", payload);

            $scope.errors = [];

            // show servers errores
            if ("message" in payload) {
                $scope.errors = [ payload.message ];
            } else {
                $log.debug("No message found in ", payload);
            }

            // show constraints violation
            if ("constraintViolation" in payload) {
                $scope.errors = payload.constraintViolation.map(function (item) {
                    return item.message;
                });
            } else {
                $log.debug("No constraintViolation found in ", payload);
            }

        };

        $scope.showServerSuccessMessage = function (payload) {
            $scope.success_message = [ 'Successfully saved Vocabulary.' ];
        };

        $scope.validate = function () {
            // $log.debug($scope.form.cms);
            $scope.error_message = false;
            if ($scope.form.cms.$valid) {

                //language validation
                if (!$scope.vocab.language || $scope.vocab.language.length == 0) {
                    $scope.error_message = 'There must be at least one language';
                }

                //subject validation
                if (!$scope.vocab.subjects || $scope.vocab.subjects.length == 0 || $scope.subjects_has_no_complete_anzsrc_for_elements()) {
                    $scope.error_message = 'There must be at least one subject drawn from the "ANZSRC Field of Research" vocabulary';
                }
                if ($scope.subjects_has_an_only_partially_valid_element()) {
                    $scope.error_message = 'There is a partially-completed subject. Either complete it or remove it.';
                }

                //publisher validation
                if (!$scope.vocab.related_entity) {
                    $scope.error_message = 'There must be at least one related entity that is a publisher';
                } else {
                    var hasPublisher = false;
                    angular.forEach($scope.vocab.related_entity, function (obj) {
                        if (obj.relationship) {
                            angular.forEach(obj.relationship, function (rel) {
                                if (rel == 'publishedBy') hasPublisher = true;
                            });
                        }
                    });
                    if (!hasPublisher) {
                        $scope.error_message = 'There must be a publisher related to this vocabulary';
                    }
                }
            }

            return $scope.error_message === false;
        };

        /**
         * Filter for finding publishers. Used for instant validation.
         */
        $scope.getPublishers = function (relEntity) {
            var hasPublisher = false;
            if (relEntity.relationship) {
                angular.forEach(relEntity.relationship, function (rel) {
                    if (rel == 'publishedBy') hasPublisher = true;
                });
            }
            return hasPublisher;
        };

        /** Create a tooltip that points to Confluence documentation.
            Because of the use of a confluence_tip attribute, which
            would otherwise be stripped out during processing of
            ng-bind-html, we need to use $sce.trustAsHtml.
            confluenceTip() is used not only on the main CMS page, but it is also
            injected (using resolve) into the relatedmodal and versionmodal
            modal dialogs.
            Unfortunately, the name of the page (which determines the
            beginning of all the anchor names) is hard-coded here. :-(
            Is there a better way?
        */
        $scope.confluenceTip = function (anchor) {
            return $sce.trustAsHtml('<span confluence_tip="' +
              'PopulatingRVAPortalMetadataFields(OptimisedforRVATooltips)-' +
              anchor + '"><span class="fa fa-info-circle" ' +
              'style="color: #7e408a; font-size: 13px"></span></span>');
        };

        // CC-1518 Need the related entity index, because we send a
        // copy of the related entity to the modal, and then need to
        // copy it back into the correct place after a Save.
        $scope.relatedmodal = function (action, type, index) {
            var modalInstance = $uibModal.open({
                templateUrl: base_url + 'assets/vocabs/templates/relatedModal.html',
                controller: 'relatedCtrl',
                windowClass: 'modal-center',
                resolve: {
                    entity: function () {
                        if (action == 'edit') {
                            // CC-1518 Operate on a copy of the related entity.
                            return angular.copy($scope.vocab.related_entity[index]);
                        } else {
                            return false;
                        }
                    },
                    type: function () {
                        return type;
                    },
                    user_orgs: function() {
                        return $scope.user_orgs;
                    },
                    confluenceTip: function () {
                        return $scope.confluenceTip;
                    }
                }
            });
            modalInstance.result.then(function (obj) {
                //close
                // Consider the form to have been modified,
                // and require confirmation if the user
                // wants to exit.
                $scope.confirmationRequiredOnExit = true;
                // TODO: Migrate over to relatedCtrl instead, handle validation there
                var relatedEntity = $scope.packRelatedEntityFromData(obj.data);
                $log.debug("packed related entity to", relatedEntity, obj);
                if ("id" in obj.data) {
                    // has ID, update if the owner is the same
                    relatedEntity.setId(obj.data['id']);

                    // not correct comment: "different owner"
                    // if ($scope.vocab.owner !== obj.data.owner) {
                    // now made consistent with relatedCtrl
                    // correct comment: owner not one of our organisational roles
                    if ($scope.user_orgs.indexOf(obj.data.owner) < 0) {
                        $scope.addRelatedEntity(obj.data, index);
                    } else {
                        $log.debug("Updating related entity", relatedEntity);
                        api.updateRelatedEntity(relatedEntity.getId(), relatedEntity)
                            .then(function(resp) {
                                $log.debug("Success updating related entity", resp);
                                $scope.$apply(function() {
                                    $scope.addRelatedEntity(obj.data, index);
                                });
                            }, function(resp){
                                $log.error("Failed updating related entity", resp)
                                var apiError = VocabularyRegistryApi.Error.
                                    constructFromObject(resp.response.body);
                                $scope.show_alert_with_callback(
                                    'There was an error updating a '
                                        + 'related entity: '
                                        + apiError.getMessage(),
                                    function() {});
                            });
                    }
                } else {
                    // does not have ID, create
                    $log.debug("Creating related entity", relatedEntity);
                    api.createRelatedEntity(relatedEntity)
                        .then(function(resp) {
                            $log.debug("Success creating related entity", resp);
                            $scope.$apply(function() {
                                obj.data['id'] = resp['id'];
                                obj.data['owner'] = resp['owner'];
                                $scope.vocab.related_entity.push(obj.data);
                            });
                        }, function(resp){
                            $log.error("Failed creating related entity", resp);
                            var apiError = VocabularyRegistryApi.Error.
                                constructFromObject(resp.response.body);
                            $scope.show_alert_with_callback(
                                'There was an error creating a new '
                                    + 'related entity: '
                                    + apiError.getMessage(),
                                function() {});
                        });
                }

            }, function () {
                // dismiss, do nothing?
            });
        };

        $scope.addRelatedEntity = function(relatedEntity, index) {
            var exist = $scope.vocab.related_entity.find(function(re) {
                return re.id === relatedEntity.id;
            });
            // Can't say just (exist && index),
            // because index might be 0, which
            // is treated as false.
            if (exist && (index !== undefined)) {
                $log.debug("Found existing related entity", exist);
                $scope.vocab.related_entity[index] = relatedEntity;
            } else {
                $log.debug("Does not found exist, add new");
                $scope.vocab.related_entity.push(relatedEntity);
            }
        };

        $scope.packRelatedEntityFromData = function(data) {
            var relatedEntity =  new VocabularyRegistryApi.RelatedEntity();
            relatedEntity.setTitle(data['title']);
            relatedEntity.setType(data['type']);
            relatedEntity.setEmail(data['email']);
            relatedEntity.setPhone(data['phone']);
            relatedEntity.setId(data['id']);
            relatedEntity.setOwner($scope.vocab.owner);

            // owner is set by the vocab.owner exclusively
            // it must be already set by this point
            relatedEntity.setOwner($scope.vocab.owner);

            // identifiers
            var identifiers = data['identifiers'].map(function(id) {
                var identifier = new VocabularyRegistryApi.RelatedEntityIdentifier();
                identifier.setIdentifierType(id.rei_type);
                identifier.setIdentifierValue(id.rei_value);
                return identifier;
            });
            relatedEntity.setRelatedEntityIdentifier(identifiers);

            // urls
            var urls = data['urls'].map(function(url) {
                 return url.url;
            });
            relatedEntity.setUrl(urls);

            return relatedEntity;
        };

        $scope.relatedvocabularymodal = function (action, index) {
            var modalInstance = $uibModal.open({
                templateUrl: base_url + 'assets/vocabs/templates/relatedVocabularyModal.html',
                controller: 'relatedVocabularyCtrl',
                windowClass: 'modal-center',
                resolve: {
                    entity: function () {
                        if (action == 'edit') {
                            // CC-1518 Operate on a copy of the related vocabulary.
                            return angular.copy($scope.vocab.related_vocabulary[index]);
                        } else {
                            return false;
                        }
                    },
                    confluenceTip: function () {
                        return $scope.confluenceTip;
                    }
                }
            });
            modalInstance.result.then(function (obj) {
                //close
                // Consider the form to have been modified,
                // and require confirmation if the user
                // wants to exit.
                $scope.confirmationRequiredOnExit = true;
                if (obj.intent == 'add') {
                    var newObj = obj.data;
                    if (!$scope.vocab.related_vocabulary) $scope.vocab.related_vocabulary = [];
                    $scope.vocab.related_vocabulary.push(newObj);
                } else if (obj.intent == 'save') {
                    $scope.vocab.related_vocabulary[index] = obj.data;
                }
            }, function () {
                //dismiss
            });
        };

        $scope.testbool = false;
        $scope.testbool2 = true;

        // CC-1518 Need the version index, because we send a copy of the version
        // to the modal, and then need to copy it back into the correct place
        // after a Save.
        $scope.versionmodal = function (action, index) {
            var modalInstance = $uibModal.open({
                templateUrl: base_url + 'assets/vocabs/templates/versionModal.html',
                controller: 'versionCtrl',
                size: 'lg',
                windowClass: 'modal-center',
                resolve: {
                    version: function () {
                        if (action == 'edit') {
                            // CC-1518 Operate on a copy of the version.
                            return angular.copy($scope.vocab.versions[index]);
                        } else {
                            return false;
                        }
                    },
                    vocab: function () {
                        return $scope.vocab;
                    },
                    action: function () {
                        return action;
                    },
                    confluenceTip: function () {
                        return $scope.confluenceTip;
                    },
                    tinymceOptions: function () {
                        return $scope.tinymceOptions;
                    }
                }
            });
            modalInstance.result.then(function (obj) {
                //close
                // Consider the form to have been modified,
                // and require confirmation if the user
                // wants to exit.
                $scope.confirmationRequiredOnExit = true;
                if (obj.intent == 'add') {
                    var newObj = obj.data;
                    if (!$scope.vocab.versions) $scope.vocab.versions = [];
                    $scope.vocab.versions.push(newObj);
                } else {
                    // CC-1518 Copy the modified version back into place.
                    $scope.vocab.versions[index] = obj.data;
                }
            }, function () {
                //dismiss
            });
        };

        /** A list of the multi-valued elements that are the elements
            of $scope.vocab. Useful when iterating over all of these. */
        $scope.multi_valued_lists = [ 'language', 'subjects', 'top_concept' ];

        /**
         * Add an item to an existing vocab
         * Primarily used for adding multivalued contents to the vocabulary
         * @param name of list: one of the values in $scope.multi_valued_lists,
         *   e.g., 'top_concept'.
         */
        $scope.addtolist = function (list) {
            if (!$scope.vocab[list]) $scope.vocab[list] = [];

            var newValue;
            // 'subjects' has two parts; special treatment.
            if (list == 'subjects') {
                newValue = {subject_source: '',
                            subject_label: '',
                            subject_iri: '',
                            subject_notation: ''};
            } else {
                // Otherwise ('language' and 'top_concept') ...
                newValue = null;
            }

            // Add new blank item to list.
            $scope.vocab[list].push(newValue);

        };

        /**
         * Remove an item from a multi-valued list. The list
         * is left in good condition: specifically,
         * $scope.ensure_minimal_list is called after the item
         * is removed.
         * @param name of list: one of the values in $scope.multi_valued_lists,
         *   e.g., 'top_concept'.
         * @param index of the item to be removed.
         */
        $scope.list_remove = function (type, index) {
            // Consider the form to have been modified,
            // and require confirmation if the user
            // wants to exit.
            $scope.confirmationRequiredOnExit = true;
            if (index > 0) {
                $scope.vocab[type].splice(index, 1);
            } else {
                $scope.vocab[type].splice(0, 1);
            }
            $scope.ensure_minimal_list(type);
        };

        /** Ensure that a multi-value field has a minimal content, ready
            for editing. For some types, this could be an empty list;
            for others, a list with one (blank) element. */
        $scope.ensure_minimal_list = function (type) {
            if ($scope.vocab[type].length == 0) {
                // Now an empty list. Do we put back a placeholder?
                switch (type) {
                case 'language':
                    $scope.vocab[type] = [null];
                    break;
                case 'subjects':
                    $scope.vocab[type] = [{
                        subject_source: "anzsrc-for",
                        subject_label: "",
                        subject_iri: "",
                        subject_notation: ""
                    }];
                    break;
                default:
                }
            }
        };

        /** Ensure that all multi-value fields have minimal content, ready
            for editing. For some types, this could be an empty list;
            for others, a list with one (blank) element. */
        $scope.ensure_all_minimal_lists = function () {
            angular.forEach($scope.multi_valued_lists, function (type) {
                $scope.ensure_minimal_list(type);
            });
        };

        /** Tidy up all empty fields. To be used before saving.
            Note that this does not guarantee validity.
            To be specific, this does not remove subjects that are
            only partially valid.
         */
        $scope.tidy_empty = function() {
            $scope.vocab.top_concept = $scope.vocab.top_concept.filter(Boolean);
            $scope.vocab.language = $scope.vocab.language.filter(Boolean);
            $scope.vocab.subjects = $scope.vocab.subjects.filter($scope.partially_valid_subject_filter);
        };

        /** Utility function for validation of fields that can have
            multiple entries. The list is supposed to have at least one
            element that is a non-empty string. This method returns true
            if this is not the case. */
        $scope.array_has_no_nonempty_strings = function (list) {
            return list === undefined || list.filter(Boolean).length == 0;
        }

        /** Utility function for testing if a value is a non-empty
            string. It is careful not to fail on non-string values. */
        $scope.is_non_empty_string = function(str) {
            return (typeof str != "undefined") &&
                (str != null) &&
                (typeof str.valueOf() == "string") &&
                (str.length > 0);
        }

        /** Filter function for one subject object. Returns true
            if the subject is valid, i.e., contains both a non-empty
            source and a non-empty subject label. */
        $scope.valid_subject_filter = function(el) {
            return ('subject_source' in el) &&
                ($scope.is_non_empty_string(el.subject_source)) &&
                ('subject_label' in el) &&
                ($scope.is_non_empty_string(el.subject_label));
        }

        /** Filter function for one subject object. Returns true
            if the subject has both source = 'anzsrc-for' and a
            non-empty subject label. */
        $scope.valid_anzsrc_for_subject_filter = function(el) {
            return ('subject_source' in el) &&
                (el.subject_source == 'anzsrc-for') &&
                ('subject_label' in el) &&
                ($scope.is_non_empty_string(el.subject_label));
        }

        /** Filter function for one subject object. Returns true
            if the subject has at least one part valid,
            i.e., contains either a non-empty
            source or a non-empty subject. */
        $scope.partially_valid_subject_filter = function(el) {
            return (('subject_source' in el) &&
                    ($scope.is_non_empty_string(el.subject_source))) ||
                (('subject_label' in el) &&
                 ($scope.is_non_empty_string(el.subject_label)));
        }

        /** Filter function for one subject object. Returns true
            if the subject has exactly one part valid,
            i.e., contains either a non-empty
            source or a non-empty subject label,
            but not both. */
        $scope.only_partially_valid_subject_filter = function(el) {
            return (('subject_source' in el) &&
                    ($scope.is_non_empty_string(el.subject_source))) !=
                (('subject_label' in el) &&
                 ($scope.is_non_empty_string(el.subject_label)));
        }

        /** Utility function for validation of subjects. In order
            to help the user not lose a partially-complete subject,
            call this function to check if the user has a subject for
            which there is only a source or a subject label, but not both. */
        $scope.subjects_has_an_only_partially_valid_element = function () {
            return $scope.vocab.subjects.filter(
                $scope.only_partially_valid_subject_filter).length > 0;
        }

        /** Utility function for validation of subjects. The list
            of subjects is supposed to have at least one
            element that has both a non-empty source and a non-empty
            subject label. This method returns true
            if this is not the case. */
        $scope.subjects_has_no_complete_anzsrc_for_elements = function () {
            return $scope.vocab.subjects == undefined ||
                $scope.vocab.subjects.filter($scope.valid_subject_filter) == 0;
        }

        /** Utility function for validation of subjects. This function
            implements a new business rule (CC-1623) that requires that each
            vocabulary have at least one subject drawn from
            ANZSRC-FOR.  So, the list of subjects is supposed to have at
            least one element that has both source = 'anzsrc-for' and
            a non-empty subject label. This method returns true if
            this is not the case. */
        $scope.subjects_has_no_complete_anzsrc_for_elements = function () {
            return $scope.vocab.subjects == undefined ||
                $scope.vocab.subjects.filter(
                    $scope.valid_anzsrc_for_subject_filter) == 0;
        }

    }

    /* Load help document containing the tooltips.
       Note the URL: configure the web server to
       proxy the pages.  Here is a suitable rva_doc.conf to go
       into /etc/httpd/conf.d:

SSLProxyEngine on

# Use /ands_doc/tooltips in the code as the location of the RVA portal tooltips.
# Then rewrite it here to point to the appropriate Confluence page.
# Doing it here means you don't have to change the code if the original
# page moves.

RewriteRule ^/ands_doc/tooltips$  /ands_doc/pages/viewpage.action?pageId=22478849  [PT]

# Need to proxy the Confluence pages so as to be able to get images too.
<Location /ands_doc>

  ProxyPass https://documentation.ardc.edu.au/
  ProxyPassReverse https://documentation.ardc.edu.au/

  # Confluence adds this header. Once you view such a page in Firefox,
  # it "infects" access to _this_ server, preventing non-SSL access via
  # browser to all ports (e.g., including 8080).
  Header unset Strict-Transport-Security
</Location>

    */
    $(document).ready(function() {
        $.get("/ands_doc/tooltips", function (data) {
            var data_replaced = data.replace(/src="/gi, 'src="/ands_doc');
            var html = $(data_replaced).find('#content-column-0');
            $('#all_help').html(html);
            // Make all external links in these tooltips open a new
            // tab/window. Courtesy of:
            // https://confluence.atlassian.com/display/CONFKB/How+to+force+links+to+open+in+a+new+window
            $('#all_help').find(".external-link").attr("target", "_blank");
        });
    });

    // Directive based on:
    // http://stackoverflow.com/questions/26278711/using-the-enter-key-as-tab-using-only-angularjs-and-jqlite

    angular.module('app').directive('topConceptsEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    // User pressed Enter. Inhibit default behaviour.
                    event.preventDefault();
                    var elementToFocus = element.next().find('input')[0];
                    if (angular.isDefined(elementToFocus)) {
                        elementToFocus.focus();
                    } else {
                        // Add a new row to the model. We are not in the Angular
                        // execution cycle at this point, so we need $apply
                        // so that the change is propagated to the DOM.
                        scope.$apply(function() { scope.addtolist('top_concept'); });
                        // We should now have a new element. Move the focus to it.
                        var newelementToFocus = element.next('tr').find('input')[0];
                        if (angular.isDefined(newelementToFocus))
                            newelementToFocus.focus();
                    }
                }
            });
        };
    });




})();
