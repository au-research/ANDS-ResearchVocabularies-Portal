<?php

use ANDS\VocabsRegistry\Model\AccessPoint;
use ANDS\VocabsRegistry\Model\OwnedVocabulary;
use ANDS\VocabsRegistry\Model\RelatedEntityRef;
use ANDS\VocabsRegistry\Model\Version;
use ANDS\VocabsRegistry\Model\Vocabulary;
use ANDS\VocabsRegistry\ApiException;

// require_once('vocabs-registry-client/autoload.php');

/**
 * Vocabs controller.  This is the primary controller for the
 * vocabulary module. This module is meant as a standalone, with all
 * assets and views self-contained within the
 * applications/portal/vocabs directory.
 * @version 2.0
 */
class Vocabs extends MX_Controller
{

    // NB: each call to render() must be preceded by
    //      ->set('page', '...')
    // where the value of the second parameter is what is expected for
    // the "page" field of portal_social_share analytics log entries.
    // The value of $page is included in the social sharing links in
    // the footer.

    // Access to the Registry API. Values are assigned
    // in the constructor.
    private $RegistryAPIClient;
    private $RegistryAPI;
    private $ServiceAPI;

    /**
     * Index / Home page
     * Displaying the Home Page
     * @return view/html
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     */
    public function index()
    {
        // Redirect /vocabs/ to the root. Without this,
        // a page is generated that has vocabulary links
        // that are broken.
        if (uri_string() == 'vocabs') {
            redirect('/');
        }
        // header('Content-Type: text/html; charset=utf-8');
        $event = array(
            'event' => 'pageview',
            'page' => 'home',
            'ip' => $this->input->ip_address(),
            'user_agent' => $this->input->user_agent(),
        );
        vocab_log_terms($event);
        $event = [
            'event' => 'portal_page',
            'page' => 'home'
        ];
        vocabs_portal_log($event);
        $this->blade
             ->set('customSearchBlock', true)
             ->set('title', 'Research Vocabularies Australia')
             ->set('page', 'home')
             ->render('home');
    }

    /**
     * Legacy: "default" for viewing a vocabulary by slug.
     * The top-level global_config.php routes requests by default
     * to applications/portal/core/controllers/dispatcher.php,
     * which in turn routes slug-like requests to this method.
     * @return view/html
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     */
    public function view($slug)
    {
        try {
            $vocab = $this->RegistryAPI->getVocabularyBySlug(
                $slug,
                'true',
                'true',
                'true'
            );

            redirect(portal_url('viewById/' . $vocab->getId()));

            /* If we want to have a redirection page instead,
               comment out the above redirect, and uncomment
               the following: */
            /*
            $this->blade
                ->set('slug', $slug)
                ->set('id', $vocab->getId())
                ->set('title', 'Research Vocabularies Australia')
                ->set('page', 'slug_redirect')
                ->render('slug_redirect');
            */
        } catch (Exception $e) {
            // No longer throw an exception, like this:
            // throw new Exception('No Record found with slug: ' . $slug);
            // But instead, show the soft 404 page.
            $message = '';
            $this->output->set_status_header('404');
            $this->blade
                ->set('message', $message)
                ->set('page', 'soft_404')
                ->render('soft_404');
            $event = [
                'event' => 'portal_not_found'
            ];
            vocabs_portal_log($event);
        }
    }

    /**
     * Search
     * Displaying the search page
     *
     * @return view/html
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     */
    public function search()
    {
        $event = array(
            'event' => 'pageview',
            'page' => 'search',
            'ip' => $this->input->ip_address(),
            'user_agent' => $this->input->user_agent(),
        );
        vocab_log_terms($event);
        $event = [
            'event' => 'portal_page',
            'page' => 'search'
        ];
        vocabs_portal_log($event);
        $this->blade
             ->set('search_app', true)
             ->set('title', 'Research Vocabularies Australia')
             ->set('page', 'search')
             ->render('index');
    }

    /**
     * Page Controller
     * For displaying static pages that belongs to the vocabs module
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     * @param  $slug supported: [help|about|contribute]
     * @return view
     */
    public function page($slug = '')
    {
        $event = array(
            'event' => 'pageview',
            'page' => $slug,
        );
        vocab_log_terms($event);
        $title = '';
        switch ($slug) {
            case 'about':
                $title = 'About';
                break;
            case 'feedback':
                $title = 'Feedback';
                break;
            case 'contribute':
                $title = 'Publish a Vocabulary';
                break;
            case 'use':
                $title = 'Use a Vocabulary';
                break;
            case 'disclaimer':
                $title = 'Disclaimer';
                break;
            case 'privacy':
                $title = 'Privacy';
                break;
            case 'widget_explorer':
                $title = 'Vocab Widget Explorer';
                $this->blade->set(
                    'scripts',
                    array('widgetDirective',
                          'vocabDisplayDirective', 'conceptDisplayDirective')
                );
                break;
            default:
                $message = '';
                $this->output->set_status_header('404');
                $this->blade
                    ->set('message', $message)
                    ->set('page', 'soft_404')
                    ->render('soft_404');
                $event = [
                    'event' => 'portal_not_found'
                ];
                vocabs_portal_log($event);
                return;
        }
        $event = [
            'event' => 'portal_page',
            'page' => $slug
        ];
        vocabs_portal_log($event);
        $this->blade
             ->set('title', $title . ' - Research Vocabularies Australia')
             ->set('page', $slug)
             ->render($slug);
    }

    /**
     * MyVocabs functionality
     * If the user is not logged in, redirects them to the login screen
     * with redirection back to this page
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     * @return view
     */
    public function myvocabs()
    {
        if (!$this->user->isLoggedIn()) {
            // throw new Exception('User not logged in');
            redirect(get_vocab_config('auth_url')
                     . 'login#?redirect=' . portal_url('vocabs/myvocabs'));
        }

        $userData = $this->ServiceAPI->getUserData();

        $affiliates = array_filter(
            $userData->getParentRole(),
            function (\ANDS\VocabsRegistry\Model\Role $role) {
                return $role->getTypeId() ===
                    \ANDS\VocabsRegistry\Model\Role::TYPE_ID_ORGANISATIONAL;
            }
        );


        $ownedVocabulariesList = $this->RegistryAPI->getOwnedVocabularies();
        $ownedVocabularies = $ownedVocabulariesList->getOwnedVocabulary();

        $published = array_filter(
            $ownedVocabularies,
            function (OwnedVocabulary $vocab) {
                return $vocab->getStatus() === Vocabulary::STATUS_PUBLISHED;
            }
        );

        $draft = array_filter(
            $ownedVocabularies,
            function (OwnedVocabulary $vocab) {
                return $vocab->getStatus() ===
                    Vocabulary::STATUS_DRAFT || $vocab->getHasDraft();
            }
        );

        $deprecated = array_filter(
            $ownedVocabularies,
            function (OwnedVocabulary $vocab) {
                return $vocab->getStatus() === Vocabulary::STATUS_DEPRECATED;
            }
        );

        vocab_log_terms([
            'event' => 'pageview',
            'page' => 'myvocabs'
        ]);
        $event = [
            'event' => 'portal_page',
            'page' => 'myvocabs'
        ];
        vocabs_portal_log($event);

        $this
            ->blade
//            ->set('owned_vocabs', $owned)
            ->set('draft', $draft)
            ->set('published', $published)
            ->set('deprecated', $deprecated)
            ->set('ownedCount', count($ownedVocabularies))
            ->set('affiliates', $affiliates)
            ->set('title', 'My Vocabs - Research Vocabularies Australia')
            ->set('page', 'myvocabs')
            ->render('myvocabs');
    }

    /**
     * Logging the user out via a the auth_url
     * Redirects the user back to the home page after logging out
     * @return redirection to home page
     */
    public function logout()
    {
        redirect(get_vocab_config('auth_url')
                 . 'logout?redirect=' . portal_url());
    }

    /**
     * Delete a vocabulary.
     * There user must be logged in, and have ownership rights
     * on the vocabulary.
     * Specify in the post: id: the vocabulary id, and
     * mode: either 'current' (for the published or deprecated
     * instance) or 'draft' (for the draft, natch).
     * The response is echoed as a JSON object.
     * There are two key/value pairs:
     * 'status': either 'success' or 'error'
     * 'message': either 'OK' for status 'success', otherwise
     *   an error message that can be displayed to the user.
     * @param  id $id POST
     * @return boolean
     */
    public function delete()
    {
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');
        set_exception_handler('json_exception_handler');

        $id = $this->input->post('id');
        if (!$id) {
            return json_encode([
                'status' => 'error',
                'message' => 'No ID specified.'
            ]);
        }

        $mode = $this->input->post('mode');
        if (!$mode) {
            return json_encode([
                'status' => 'error',
                'message' => 'No deletion mode specified.'
            ]);
        }

        if ($mode === 'current') {
            $deleteCurrent = 'true';
            $deleteDraft = 'false';
        } elseif ($mode === 'draft') {
            $deleteCurrent = 'false';
            $deleteDraft = 'true';
        } else {
            return json_encode([
                'status' => 'error',
                'message' => 'Invalid deletion mode.'
            ]);
        }

        $vocab_status = $this->input->post('vocab_status') ?: 'unknown';
        $vocab_title = $this->input->post('vocab_title') ?: 'unknown';
        $vocab_owner = $this->input->post('vocab_owner') ?: 'unknown';
        $vocab_slug = $this->input->post('vocab_slug') ?: 'unknown';

        $this->RegistryAPI->deleteVocabulary(
            $id,
            $deleteCurrent,
            $deleteDraft
        );

        // Log the event.
        $event = [
            'event' => 'portal_cms',
            'cms' => [
                'action' => 'delete'
            ],
            'vocabulary' => [
                'id' => $id,
                'status' => $vocab_status,
                'title' => $vocab_title,
                'owner' => $vocab_owner,
                'slug' => $vocab_slug
            ]
        ];
        vocabs_portal_log($event);

        return json_encode([
            'status' => 'success',
            'message' => 'OK.'
        ]);
    }

    /* New methods for registry version of the portal follow here. */


    /**
     * Viewing a vocabulary by ID.
     * The top-level global_config.php routes requests by default
     * to applications/portal/core/controllers/dispatcher.php,
     * which in turn routes slug-like requests to this method.
     *
     * @return view/html
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     */
    public function viewById($id)
    {
        try {
            $vocab = $this->RegistryAPI->getVocabularyById(
                $id,
                'true',
                'true',
                'true'
            );

            $event = array(
                'event' => 'vocabview-new',
                'vocab' => $vocab->getTitle(),
                'slug' => $vocab->getSlug(),
                'id' => $vocab->getId(),
            );
            vocab_log_terms($event);
            $event = [
                'event' => 'portal_view',
                'vocabulary' => [
                    'id' => $vocab->getId(),
                    'status' => $vocab->getStatus(),
                    'title' => $vocab->getTitle(),
                    'owner' => $vocab->getOwner(),
                    'slug' => $vocab->getSlug(),
                    'lookup' => 'id'
                ]
            ];
            vocabs_portal_log($event);

            $this->blade
                ->set('vocab', $vocab)
                ->set('title', $vocab->getTitle()
                      . ' - Research Vocabularies Australia')
                ->set('scripts', array('subscribeDialogCtrl'))
                ->set('page', 'view')
                ->render('vocab');
        } catch (Exception $e) {
            // No longer throw an exception, like this:
            // throw new Exception('No Record found with slug: ' . $slug);
            // But instead, show the soft 404 page.
            $message = '';
            $this->output->set_status_header('404');
            $this->blade
                ->set('message', $message)
                ->set('page', 'soft_404')
                ->render('soft_404');
            $event = [
                'event' => 'portal_not_found'
            ];
            vocabs_portal_log($event);
        }
    }

    /**
     * Viewing a vocabulary by slug.
     * @return view/html
     */
    public function viewBySlug($slug)
    {
        try {
            $vocab = $this->RegistryAPI->getVocabularyBySlug(
                $slug,
                'true',
                'true',
                'true'
            );

            $event = array(
                'event' => 'vocabview-new',
                'vocab' => $vocab->getTitle(),
                'slug' => $vocab->getSlug(),
                'id' => $vocab->getId(),
            );
            vocab_log_terms($event);
            $event = [
                'event' => 'portal_view',
                'vocabulary' => [
                    'id' => $vocab->getId(),
                    'status' => $vocab->getStatus(),
                    'title' => $vocab->getTitle(),
                    'owner' => $vocab->getOwner(),
                    'slug' => $vocab->getSlug(),
                    'lookup' => 'slug'
                ]
            ];
            vocabs_portal_log($event);

            $this->blade
                ->set('vocab', $vocab)
                ->set('title', $vocab->getTitle()
                      . ' - Research Vocabularies Australia')
                ->set('page', 'view')
                ->render('vocab');
        } catch (Exception $e) {
            // No longer throw an exception, like this:
            // throw new Exception('No Record found with slug: ' . $slug);
            // But instead, show the soft 404 page.
            $message = '';
            $this->output->set_status_header('404');
            $this->blade
                ->set('message', $message)
                ->set('page', 'soft_404')
                ->render('soft_404');
            $event = [
                'event' => 'portal_not_found'
            ];
            vocabs_portal_log($event);
        }
    }

    /**
     * Previewing a related entity or related vocabulary
     * @return view/html
     */
    public function relatedPreview()
    {

        $relatedParam = json_decode($this->input->get('related'));

        $vocab_id = (int) ($this->input->get('vocab_id') ?: 0);
        $vocab_status = $this->input->get('vocab_status') ?: 'unknown';
        $vocab_title = $this->input->get('vocab_title') ?: 'unknown';
        $vocab_owner = $this->input->get('vocab_owner') ?: 'unknown';
        $vocab_slug = $this->input->get('vocab_slug') ?: 'unknown';

        $sub_type = $this->input->get('sub_type');

        $related = [];

        if (isset($relatedParam->{"related-entity"})) {
            $isVocab = false;
            $reRef = $this->RegistryAPIClient->getSerializer()->
            deserialize(
                $relatedParam,
                '\ANDS\VocabsRegistry\Model\RelatedEntityRef'
            );
            $re = $reRef->getRelatedEntity();
            $related['type'] = $re->getType();
            $related['title'] = $re->getTitle();
            $related['relationship'] = $reRef->getRelation();
            $temp = $re->getRelatedEntityIdentifier();
            if ($temp) {
                $related['identifiers'] = $temp;
            }
            $related['email'] = $re->getEmail();
//             $related['address'] = $reRef->getRelatedEntity()->getA();
            $related['phone'] = $re->getPhone();
            $temp = $re->getUrl();
            if ($temp) {
                $related['urls'] = $temp;
            }
//             $related[''] = $reRef->getRelatedEntity()->get();
            $related_vocabs = $this->RegistryAPI->
                getVocabulariesRelatedToRelatedEntityById(
                    $reRef->getRelatedEntity()->getId()
                );

            $event = [
                'event' => 'portal_preview_re',
                'vocabulary' => [
                    'id' => $vocab_id,
                    'status' => $vocab_status,
                    'title' => $vocab_title,
                    'owner' => $vocab_owner,
                    'slug' => $vocab_slug
                ],
                'related_entity' => [
                    'id' => $re->getId(),
                    'title' => $re->getTitle()
                ]
            ];
            vocabs_portal_log($event);
        } else {
            $isVocab = true;
            $rvRef = $this->RegistryAPIClient->getSerializer()->
            deserialize(
                $relatedParam,
                '\ANDS\VocabsRegistry\Model\RelatedVocabularyRef'
            );
            $rv = $rvRef->getRelatedVocabulary();
            $related['title'] = $rv->getTitle();
            $related['type'] = 'internal_vocabulary';
            $related['relationship'] = $rvRef->getRelation();
            $related['description'] = $rv->getDescription();
            $related['vocab_id'] = $rv->getId();
            $related_vocabs = $this->RegistryAPI->
                getVocabulariesRelatedToVocabularyById(
                    $rvRef->getRelatedVocabulary()->getId()
                );
            // Filter out _this_ vocabulary

            $event = [
                'event' => 'portal_preview_rv',
                'vocabulary' => [
                    'id' => $vocab_id,
                    'status' => $vocab_status,
                    'title' => $vocab_title,
                    'owner' => $vocab_owner,
                    'slug' => $vocab_slug
                ],
                'related_vocabulary' => [
                    'id' => $rv->getId(),
                    'title' => $rv->getTitle()
                ]
            ];
            vocabs_portal_log($event);
        }
//         echo(json_encode($related));
// return;
//         echo(json_encode($related_vocabs));
//         return;

        $others = array();

        foreach ($related_vocabs->getReverseRelatedVocabulary() as
                 $reverse_related_vocab) {
            $related_vocab = $reverse_related_vocab->getRelatedVocabulary();
            // If we got a vocabulary to start with, exclude ourself from
            // the related vocabularies.
            // This is (currently) the one place we use $vocab_id
            // _apart from_ for logging purposes.
            if ($reverse_related_vocab->getRelatedVocabulary()->getId() ==
                $vocab_id) {
                // echo('excluded ourself');
                continue;
            }
            $others[] = $related_vocab;
            if (!$isVocab) {
                foreach ($reverse_related_vocab->
                         getRelatedEntityRelation() as $rel) {
                    if ($rel === RelatedEntityRef::RELATION_PUBLISHED_BY) {
                        // echo('found publisher');
                        $related['sub_type'] = 'publisher';
                    }
                }
            }
        }

        $related['other_vocabs'] = $others;
        $this->blade
        ->set('related', $related)
        ->set('sub_type', $sub_type)
        ->set('page', 'related_preview')
        ->render('related_preview');
    }


    /**
     * Adding a vocabulary
     * Displaying a view for adding a vocabulary
     * Using the same CMS as edit
     * If not logged in, redirect to login page, then My Vocabs.
     * We could have done a redirect from login page back to this method,
     * except that the CMS page relies on the use of a URL fragment
     * (#!/?skip=true) to distinguish between "normal" and add from PoolParty,
     * and because fragments are only visible client-side, we can't
     * pass that on.
     * @return view
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     */
    public function add()
    {
        if (!$this->user->isLoggedIn()) {
            // throw new Exception('User not logged in');
            redirect(get_vocab_config('auth_url')
                . 'login#?redirect=' . portal_url('vocabs/myvocabs'));
        }
        $event = array(
            'event' => 'pageview',
            'page' => 'add',
        );
        vocab_log_terms($event);
        // If we want to log _initiation_ of an add,
        // do it here. But completion is done by the JS controller
        // calling back to logCMS().
        /*
        $event = [
            'event' => 'portal_cms',
            'cms' => [ 'action' => 'add' ]
        ];
        vocabs_portal_log($event);
        */
        $this->blade
        ->set('scripts', array('vocabs_cms', 'versionCtrl', 'relatedCtrl',
            'relatedVocabularyCtrl',
            'subjectDirective', 'relatedEntityIdentifierDirective'))
            ->set('vocab', false)
            ->set('page', 'cms')
            ->render('cms');
    }

    /**
     * Edit a vocabulary in the Registry.
     * Displaying a view for editing a vocabulary
     * Using the same CMS as add but directed towards a vocabulary
     * Authorization is checked.
     * @param  string $id ID of the vocabulary, unique for a vocabulary
     * @return view
     * @throws Exception
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     */
    public function edit($id = false)
    {
        if (!$this->user->isLoggedIn()) {
            // throw new Exception('User not logged in');
            redirect(get_vocab_config('auth_url')
                . 'login#?redirect='
                . portal_url('vocabs/edit/' . $id));
        }
        if (!$id) {
            throw new Exception('Require a Vocabulary ID to edit');
        }

        try {
            // If the vocab is not found, or the user is not
            // authorized, there will be an exception.
            $vocab = $this->RegistryAPI->getVocabularyByIdEdit($id);

            $event = array(
                'event' => 'pageview',
                'page' => 'edit',
                'vocab' => $vocab->getTitle(),
                'slug' => $vocab->getSlug(),
                'id' => $vocab->getId(),
            );
            vocab_log_terms($event);
            // If we want to log _initiation_ of an edit,
            // do it here. But completion is done by the JS controller
            // calling back to logCMS().
            /*
            $event = [
                'event' => 'portal_cms',
                'cms' => [ 'action' => 'edit' ],
                'vocabulary' => [
                    'id' => $vocab->getId(),
                    'title' => $vocab->getTitle(),
                    'owner' => $vocab->getOwner(),
                    'slug' => $vocab->getSlug()
                ]
            ];
            vocabs_portal_log($event);
            */

            $this->blade
                ->set(
                    'scripts',
                    array(
                        'vocabs_cms',
                        'versionCtrl',
                        'relatedCtrl',
                        'relatedVocabularyCtrl',
                        'subjectDirective',
                        'relatedEntityIdentifierDirective'
                    )
                )
                ->set('vocab', $vocab)
                ->set(
                    'title',
                    'Edit - ' .
                    $vocab->getTitle() . ' - Research Vocabularies Australia'
                )
                ->set('page', 'cms')
                ->render('cms');
        } catch (Exception $e) {
            switch ($e->getCode()) {
                case 400:
                    $message = "No such vocabulary.";
                    break;
                case 403:
                    $message = "Not authorised to edit this vocabulary.";
                    break;
                default:
                    $message = $e->getMessage();
                    break;
            }
            $this->output->set_status_header('404');
            $this->blade
                ->set('message', $message)
                ->set('page', 'soft_404')
                ->render('soft_404');
            $event = [
                'event' => 'portal_not_found'
            ];
            vocabs_portal_log($event);
        }
    }

    /**
     * New Services Controller
     * For allowing RESTful API against the Vocabs Registry
     *
     *    Used by assets/js/vocabs_visualise_directive.js:
     *       tree
     *
     *    There is also "tree-raw" for use by RDA to get subjects
     *    for our curated vocabularies.
     *
     *
     * @param  string $class [vocabs] context
     * @param  string $id [id] of the context
     * @param  string $method [method] description of the query
     * @return API response / JSON
     * @example services/vocabs/ , services/vocabs/anzsrc-for ,
     *          services/vocabs/rifcs/versions
     */
    public function services($class = '', $id = '', $method = '', $type = '')
    {

        //header
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');
        set_exception_handler('json_exception_handler');

        if ($class != 'vocabs') {
            throw new Exception('/vocabs required');
        }
        $result = '';
        if ($id == 'all' || $id == '') {
            // More to come.
        } elseif ($id != '') {
            // an individual vocab id was specified
            if ($method == 'tree') {
                $result = $this->displayTree($id);
            } elseif ($method == 'tree-raw') {
                $result = $this->displayTree($id, true);
            }
        }
        echo json_encode(
            array(
                'status' => 'OK',
                'message' => $result,
            )
        );
    }


    /** Get the current version for a vocabulary, if it has one.
     * @param int $id The vocabulary ID of the vocabulary to be looked up
     * @return NULL|Version
     */
    private function getCurrentVersionForVocabularyId($id)
    {
        $versions = $this->RegistryAPI->getVersionsForVocabularyById($id);
        $current_version = null;
        foreach ($versions as $version) {
            if ($version->getStatus() === Version::STATUS_CURRENT) {
                $current_version = $version;
                break;
            }
        }
        return $current_version;
    }


    /**
     * Return the tree representation of the current version
     * requires the concepts_tree already harvested and transformed
     * Recursive to with the BuilTree function
     * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
     * @param int $id If !$raw, then a version ID; if $raw, then a vocabulary ID
     * @param boolean $raw whether to send back the tree as returned
     *     from the Registry
     * @return array $tree
     */
    private function displayTree($id, $raw = false)
    {
        // FIXME: this version of raw handling assumes a numeric vocabulary ID.
        // The old version supports lookup by slug, and we may need to
        // support that (which might be by a different service name).
        if ($raw) {
            $current_version = $this->getCurrentVersionForVocabularyId($id);
            $id = $current_version->getId();
        }

        $aps = $this->RegistryAPI->getAccessPointsForVersionById($id);

        $sissvoc_endpoint = "";

        foreach ($aps->getAccessPoint() as $ap) {
            if ($ap->getDiscriminator() ===
                AccessPoint::DISCRIMINATOR_SISSVOC) {
                    $sissvoc_endpoint = $ap->getApSissvoc()->getUrlPrefix();
                    // Stop at the _first_ match.  Note: this choice
                    // of access point must match the behaviour in
                    // wrap-getvocabaccess.blade.php that assigns the
                    // attribute 'id="current_version_sissvoc"' to an
                    // <a> element.
                    break;
            }
        }

        list($content, $statusCode, $httpHeader) =
        $this->RegistryAPI->getVersionArtefactConceptTreeWithHttpInfo($id);

        if ($statusCode != 200) {
            //file doesn't exist
            return false;
        }

        //         echo('statusCode='.$statusCode);
        //         echo('content='.gettype($content));

        $tree_data = json_decode($content, true);
        if ($raw) {
            return $tree_data;
        }

        //build a tree a little bit nicer
        $this->buildTree($tree_data, $sissvoc_endpoint);

        return $tree_data;
    }

    /**
     * Helper function for @displayTree.
     * Recursively called to build the tree when there are child concepts.
     * See Toolkit class ...provider.transform.JsonTreeTransformProvider
     * for a description of the structure of the input tree data.
     * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
     * @param  array $treeData
     */
    private function buildTree(&$treeData, $sissvoc_endpoint = '')
    {
        if (is_array($treeData)) {
            foreach ($treeData as &$concept) {
                $uri = $concept['iri'];
                $title = isset($concept['prefLabel']) ?
                $concept['prefLabel'] : 'No Title';
                $tipText = '<p><b>'. $title . '<br/>IRI: </b>'. $uri;

                if (isset($concept['definition'])) {
                    $tipText .= '<br/><b>Definition: </b>'
                        . $concept['definition'];
                }
                if (isset($concept['notation'])) {
                    $tipText .= '<br/><b>Notation: </b>' .$concept['notation'];
                }
                if ($sissvoc_endpoint != '') {
                    // clickLinkedData() is defined in vocabs_app.js.
                    $tipText .=
                        '<br/><a class="pull-right" target="_blank" '.
                             'onclick="clickLinkedData(\'' .
                                 $uri . '\')" ' .
                             'href="' .
                        $sissvoc_endpoint .
                        '/resource?uri=' .
                        $uri . '">View as linked data</a>';
                }
                $concept['value'] = $title;
                $concept['tip'] = $tipText. '</p>';
                if (isset($concept['narrower'])) {
                    $this->buildTree(
                        $concept['narrower'],
                        $sissvoc_endpoint
                    );
                    $concept['num_child'] = sizeof($concept['narrower']);
                } else {
                    $concept['num_child'] = 0;
                }
            }
        }
    }

    /* Subscriptions */

    /** Process a request to add vocabulary subscriptions.
     * It must contain a response from the reCAPTCHA service.
     * Send a POST request, with body:
     *   {"recaptcha": "response from reCAPTCHA server",
     *    "email": "email-address-of-subscriber",
     *    "subscriptions": { ... }
     *   }.
     * Response is either:
     *   {"status": "OK"}
     * or if reCAPTCHA validation fails:
     *   {"status": "failReCAPTCHA"}
     * or if an API call fails:
     *   {"status": "fail", "message": "[401] Error connecting ..."}.
     */
    public function addSubscriptions()
    {
        // Get the POST data
        $postdata = file_get_contents("php://input");
        $request = json_decode($postdata);
        $gRecaptchaResponse = $request->recaptcha;
        // Require configuration item from global_config.php.
        $secret = get_config_item('reCAPTCHA')['secret_key'];
        // Server-side validation of the response.
        $reCAPTCHA = new \ReCaptcha\ReCaptcha($secret);
        $resp = $reCAPTCHA->verify(
            $gRecaptchaResponse,
            $_SERVER['REMOTE_ADDR']
        );
        if ($resp->isSuccess()) {
            // verified!
            // if Domain Name Validation turned off don't forget to check
            // hostname field
            // if($resp->getHostName() === $_SERVER['SERVER_NAME']) {  }

            if (!$this->user->isLoggedIn()) {
                // Remove the user's non-logged-in cookie (which will
                // be rejected by the Registry)
                // and supply our own authentication.
                $vocab_config = get_config_item('vocab_config');
                $username = $vocab_config['registry_user'];
                $password = $vocab_config['registry_password'];
                $registryConfig = ANDS\VocabsRegistry\Configuration::
                                getDefaultConfiguration();
                $registryConfig->setApiKey(
                    $this->session->sess_cookie_name,
                    null
                );
                $registryConfig->setUsername($username);
                $registryConfig->setPassword($password);
            }

            $vocab_id = (int) (isset($request->vocab_id) ?
                               $request->vocab_id : 0);
            $vocab_status = isset($request->vocab_status) ?
                          $request->vocab_status : 'unknown';
            $vocab_title = isset($request->vocab_title) ?
                         $request->vocab_title : 'unknown';
            $vocab_owner = isset($request->vocab_owner) ?
                         $request->vocab_owner : 'unknown';
            $vocab_slug = isset($request->vocab_slug) ?
                        $request->vocab_slug : 'unknown';
            $subscribe_all_vocabularies_from_owner = false;
            $subscribe_all_vocabularies = false;
            $subscribe_service_updates = false;

            $subscriptions = $request->subscriptions;
            $email = $request->email;
            try {
                foreach ($subscriptions as $key => $value) {
                    switch ($key) {
                        case 'vocabularyId':
                            $this->ServiceAPI->
                                createEmailSubscriptionVocabulary(
                                    $value,
                                    $email
                                );
                            break;
                        case 'ownerId':
                            $this->ServiceAPI->createEmailSubscriptionOwner(
                                $value,
                                $email
                            );
                            if ($value == '*') {
                                $subscribe_all_vocabularies = true;
                            } else {
                                $subscribe_all_vocabularies_from_owner = true;
                            }
                            break;
                        case 'system':
                            if ($value == true) {
                                $this->ServiceAPI->
                                    createEmailSubscriptionSystem(
                                        $email
                                    );
                                $subscribe_service_updates = true;
                            }
                            break;
                    }
                }
            } catch (Exception $e) {
                // Failure of an API call.
                echo '{"status": "fail", "message": "'
                    . addslashes($e->getMessage()) . '"}';
                return;
            }
            // Log the event.
            $event = [
                'event' => 'portal_subscribe',
                'vocabulary' => [
                    'id' => $vocab_id,
                    'status' => $vocab_status,
                    'title' => $vocab_title,
                    'owner' => $vocab_owner,
                    'slug' => $vocab_slug
                ],
                'subscription' => [
                    'subscribe_all_vocabularies_from_owner' =>
                      $subscribe_all_vocabularies_from_owner,
                    'subscribe_all_vocabularies' =>
                      $subscribe_all_vocabularies,
                    'subscribe_service_updates' => $subscribe_service_updates
                ]
            ];
            vocabs_portal_log($event);
            echo '{"status": "OK"}';
        } else {
            echo '{"status": "failReCAPTCHA"}';
        }
    }

    /**
     * Manage a subscriber's subscriptions.
     * @param  string $token The subscriber's token.
     * @return view
     * @throws Exception
     */
    public function manageSubscriptions($token)
    {
        $event = array(
            'event' => 'pageview',
            'page' => 'manageSubscriptions',
        );
        vocab_log_terms($event);
        $event = [
            'event' => 'portal_page',
            'page' => 'manageSubscriptions'
        ];
        vocabs_portal_log($event);
        // Set strip_last_url_component so as not to leak
        // the subscriber's token into the URLs generated for
        // the various "Share" options. See footer.blade.php
        // for the code that does the stripping, based on this setting.
        $this->blade
            ->set('scripts', array('manageSubscriptionsCtrl'))
            ->set('strip_last_url_component', true)
            ->set('token', $token)
            ->set('page', 'manageSubscriptions')
            ->render('manageSubscriptions');
    }

    /* Social sharing */

    /**
     * Share to a selected social network.  The links generated by the
     * blade used to be direct links to the corresponding social
     * network server. Now, we send the portal client here first, so
     * that we can do our own logging of sharing.
     * @param  string $social facebook|twitter
     * @return redirect
     * @throws Exception
     */
    public function share($social = "facebook")
    {
        // Collect the Data
        $url = $this->input->get('url');
        if (!$url) {
            throw new Exception("No URL provided");
        }

        $page = $this->input->get('page');

        $vocab_id = (int) ($this->input->get('id') ?: 0);
        $vocab_title = $this->input->get('title') ?: 'unknown';
        $vocab_owner = $this->input->get('owner') ?: 'unknown';
        $vocab_slug = $this->input->get('slug') ?: 'unknown';

        // Log the event.
        if ($vocab_id == 0) {
            $event = [
                'event' => 'portal_social_share',
                'share' => [
                    'type' => $social,
                    'url' => $url
                ],
                'page' => $page
            ];
        } else {
            $event = [
                'event' => 'portal_social_share',
                'share' => [
                    'type' => $social,
                    'url' => $url
                ],
                'page' => $page,
                'vocabulary' => [
                    'id' => $vocab_id,
                    'title' => $vocab_title,
                    'owner' => $vocab_owner,
                    'slug' => $vocab_slug
                ]
            ];
        }
        vocabs_portal_log($event);

        // Decide the sharing URL. In case the value of $social is not
        // one we know about, redirect to the home page.
        $shareUrl = base_url();
        switch ($social) {
            case "facebook":
                $share_params = [
                    'u' => $url
                ];
                $share_query_params = http_build_query($share_params);
                $shareUrl = "http://www.facebook.com/sharer.php?" .
                          $share_query_params;
                break;
            case "twitter":
                $share_params = [
                    'url' => $url,
                    'text' => $vocab_title,
                    'hashtags' => 'andsdata'
                ];
                $share_query_params = http_build_query($share_params);
                $shareUrl = "https://twitter.com/share?" . $share_query_params;
                break;
            default:
                break;
        }

        // Do the redirect.
        redirect($shareUrl);
    }

    /* Analytics logging of events that otherwise are only logged
       by the Registry. */

    /**
     * Log a CMS event.
     * @return string JSON object indicating OK status.
     * @throws Exception
     */
    public function logCMS()
    {
        // Collect the data to be logged, from the
        // query parameters.

        $action = $this->input->get('action') ?: 'unknown';

        $vocab_id = (int) ($this->input->get('vocab_id') ?: 0);
        $vocab_status = $this->input->get('vocab_status') ?: 'unknown';
        $vocab_title = $this->input->get('vocab_title') ?: 'unknown';
        $vocab_owner = $this->input->get('vocab_owner') ?: 'unknown';
        $vocab_slug = $this->input->get('vocab_slug') ?: 'unknown';

        // Log the event.
        $event = [
            'event' => 'portal_cms',
            'cms' => [
                'action' => $action
            ],
            'vocabulary' => [
                'id' => $vocab_id,
                'status' => $vocab_status,
                'title' => $vocab_title,
                'owner' => $vocab_owner,
                'slug' => $vocab_slug
            ]
        ];
        vocabs_portal_log($event);
        echo '{"status": "OK"}';
    }

    /**
     * Log an access to an access point.
     * @return string JSON object indicating OK status.
     * @throws Exception
     */
    public function logAccessPoint()
    {
        // Collect the data to be logged, from the
        // query parameters.

        $vocab_id = (int) ($this->input->get('vocab_id') ?: 0);
        $vocab_status = $this->input->get('vocab_status') ?: 'unknown';
        $vocab_title = $this->input->get('vocab_title') ?: 'unknown';
        $vocab_owner = $this->input->get('vocab_owner') ?: 'unknown';
        $vocab_slug = $this->input->get('vocab_slug') ?: 'unknown';

        $version_id = (int) ($this->input->get('version_id') ?: 0);
        $version_status = $this->input->get('version_status') ?: 'unknown';
        $version_title = $this->input->get('version_title') ?: 'unknown';
        $version_slug = $this->input->get('version_slug') ?: 'unknown';

        $ap_id = (int) ($this->input->get('ap_id') ?: 0);
        $ap_url = $this->input->get('ap_url') ?: 'unknown';
        $ap_type = $this->input->get('ap_type') ?: 'unknown';

        // Log the event.
        $event = [
            'event' => 'portal_accessed',
            'vocabulary' => [
                'id' => $vocab_id,
                'status' => $vocab_status,
                'title' => $vocab_title,
                'owner' => $vocab_owner,
                'slug' => $vocab_slug
            ],
            'version' => [
                'id' => $version_id,
                'status' => $version_status,
                'title' => $version_title,
                'slug' => $version_slug
            ],
            'access_point' => [
                'id' => $ap_id,
                'type' => $ap_type,
                'url' => $ap_url
            ]
        ];
        vocabs_portal_log($event);
        echo '{"status": "OK"}';
    }

    /**
     * Log unsubscription.
     * @return string JSON object indicating OK status.
     * @throws Exception
     */
    public function logUnsubscribe()
    {
        // Get the POST data
        $postdata = file_get_contents("php://input");
        $request = json_decode($postdata);

        $vocab_ids = isset($request->vocab_ids) ? $request->vocab_ids: [];
        $vocab_owners = isset($request->vocab_owners) ?
                      $request->vocab_owners: [];
        $unsubscribe_all_vocabularies =
            isset($request->unsubscribe_all_vocabularies) ?
                $request->unsubscribe_all_vocabularies: false;
        $unsubscribe_service_updates =
            isset($request->unsubscribe_service_updates) ?
                $request->unsubscribe_service_updates: false;

        // Log the event.
        $event = [
            'event' => 'portal_unsubscribe',
            'subscription' => [
                'vocabulary_ids' => $vocab_ids,
                'vocabulary_owners' => $vocab_owners,
                'unsubscribe_all_vocabularies' => $unsubscribe_all_vocabularies,
                'unsubscribe_service_updates' => $unsubscribe_service_updates
            ],
        ];
        vocabs_portal_log($event);
        echo '{"status": "OK"}';
    }

    /* Utility methods */

    /**
     * Returns true if the user is logged in
     * and has ownership of the given vocab.
     * @param  Vocabulary $vocab The Vocabulary to check ownership.
     * @param  bool $allowSuperuser Take superuser privileges
     *         into account. If true (the default), if the user
     *         is logged in as a registry superuser, this method
     *         will always return true. (This test is performed
     *         _before_ checking the existence of the vocabulary.
     *         Therefore, note the method's precondition that the
     *         vocabulary must exist, for this method to give
     *         a correct result.) If false, superuser privileges
     *         are ignored; the user must have an appropriate
     *         affiliation. In general, there is no need to
     *         pass in a value for this parameter. The presence
     *         of this parameter is (for now) specifically to support
     *         unit testing of this method.
     * @return bool true if and only the user is logged in
     *         and has ownership of the vocabulary (having taken
     *         superuser privileges into account, if requested).
     */
    public function isOwner($id, $allowSuperuser = true)
    {
        if (!$this->user->isLoggedIn()) {
            // Not even logged in.
            return false;
        }
        // Only take superuser privileges into account if we
        // are asked to (which is also the default).
        if ($allowSuperuser) {
            if ($this->user->isSuperAdmin()) {
                // Superuser, so definitely authorised.
                return true;
            }
        }

        try {
            $authorized = $this->RegistryAPI->ownsVocabularyById($id);
            if ($authorized->getBooleanValue()) {
                return true;
            }
        } catch (ApiException $e) {
            return false;
        }
        // Not an owner.
        return false;
    }

    /** Add an HTTP header to all Registry API invocations, with
     * content taken from one of the values of $_SERVER.
     * @param string $remotekey The HTTP header to bet set.
     * @param string $localkey The key to use to look up in $_SERVER
     *        to fetch the value to be put into the HTTP header.
     *        If the key is not present in $_SERVER, this method
     *        does not add the HTTP header.
     */
    private function setHeaderForRegistry($remotekey, $localkey)
    {
        if (!empty($_SERVER[$localkey])) {
            ANDS\VocabsRegistry\Configuration::getDefaultConfiguration()->
                addDefaultHeader($remotekey, $_SERVER[$localkey]);
        }
    }

    /** Add referrer data to all Registry API invocations, with
     * content taken from $_SERVER. The value of HTTP_REFERER is
     * considered first. If that is missing, fall back to REQUEST_URI.
     */
    private function setReferrerForRegistry()
    {
        // To test the paths through this code, uncomment some or all
        // of the following as necessary. Do not leave _any_ of the
        // following lines uncommented when committing the code,
        // nor in production!
        // $_SERVER['HTTP_REFERER'] = null;
        // unset($_SERVER['REQUEST_SCHEME']);
        // unset($_SERVER['HTTP_HOST']);
        // unset($_SERVER['SERVER_NAME']);

        if (!empty($_SERVER['HTTP_REFERER'])) {
            $referrer = $_SERVER['HTTP_REFERER'];
        } elseif (!empty($_SERVER['REQUEST_URI'])) {
            // Build up the referrer from the combination of
            // REQUEST_SCHEME, HTTP_HOST, and REQUEST_URI.  We know we
            // have REQUEST_URI (that's this branch of the conditional
            // statement!), but the first two server variables may be
            // missing. So we have fallbacks for each of them.

            // Try REQUEST_SCHEME. If not set (e.g.,
            // Apache HTTP Server 2.2),
            // see if HTTPS is set. Fall back to 'http'
            // if neither is present.
            if (empty($_SERVER['REQUEST_SCHEME'])) {
                if (empty($_SERVER['HTTPS'])) {
                    $request_scheme = 'http';
                } else {
                    $request_scheme = 'https';
                }
            } else {
                $request_scheme = $_SERVER['REQUEST_SCHEME'];
            }

            // For host, try HTTP_HOST. If not set, try
            // SERVER_NAME. Fall back to 'localhost' if neither is
            // present. But very bad if that ever happens: NB: it's
            // good to have a ServerName setting in the HTTP Server
            // config!
            if (empty($_SERVER['HTTP_HOST'])) {
                if (empty($_SERVER['SERVER_NAME'])) {
                    $host = 'localhost';
                } else {
                    $host = $_SERVER['SERVER_NAME'];
                }
            } else {
                $host = $_SERVER['HTTP_HOST'];
            }

            $referrer = $request_scheme .
                      '://' . $host .
                      $_SERVER['REQUEST_URI'];
        }
        if (!empty($referrer)) {
            ANDS\VocabsRegistry\Configuration::getDefaultConfiguration()->
                addDefaultHeader('portal-referrer', $referrer);
        }
    }

    /**
     * Constructor Method
     * Autoload blade by default
     */
    public function __construct()
    {
        parent::__construct();
        $this->load->library('blade');
        ANDS\VocabsRegistry\Configuration::getDefaultConfiguration()->setHost(
            get_vocab_config('registry_api_url')
        );
        // If debugging required, uncomment and adjust filename.
//          ANDS\VocabsRegistry\Configuration::getDefaultConfiguration()
//              ->setDebug(true)
//          ->setDebugFile(
//              '/var/www/html/workareas/richard/vocabs-new/' .
//              'engine/logs/error/richardvocabsnewphpdebug.txt');

        // Send who we are to the Registry. NB: the header names
        // must match the values used in the
        // Registry code, in class au.org.ands.vocabs.registry.utils.Analytics,
        // method createBasicMarker().
        ANDS\VocabsRegistry\Configuration::getDefaultConfiguration()->
            addDefaultHeader('portal-id', 'Portal-PHP');
        $this->setHeaderForRegistry('portal-remote-address', 'REMOTE_ADDR');
        $this->setHeaderForRegistry('portal-user-agent', 'HTTP_USER_AGENT');
        $this->setReferrerForRegistry();

        // The user's authentication cookie is used as
        // an API key to authenticate with the Registry.
        $cookie_name = $this->session->sess_cookie_name;
        $cookie = $this->input->cookie($cookie_name);
        if ($cookie) {
            ANDS\VocabsRegistry\Configuration::getDefaultConfiguration()
                ->setApiKey($cookie_name, $cookie);
        }
        $this->RegistryAPIClient = new ANDS\VocabsRegistry\ApiClient();
        $this->RegistryAPI = new ANDS\VocabsRegistry\Api\ResourcesApi();
        $this->ServiceAPI = new ANDS\VocabsRegistry\Api\ServicesApi();
    }
}
