<?php

use ANDS\VocabsRegistry\Model\AccessPoint;
use ANDS\VocabsRegistry\Model\OwnedVocabulary;
use ANDS\VocabsRegistry\Model\RelatedEntityRef;
use ANDS\VocabsRegistry\Model\Version;
use ANDS\VocabsRegistry\Model\Vocabulary;
use ANDS\VocabsRegistry\ApiException;

// require_once('vocabs-registry-client/autoload.php');

/**
 * Vocabs controller
 * This is the primary controller for the vocabulary
 * module This module is meant as a standalone with all assets, views
 * and models self contained within the applications/vocabs directory
 * @version 1.0
 * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
class Vocabs extends MX_Controller
{

    // Access to the Registry API.
    private $RegistryAPI;

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
        $this->blade
             ->set('customSearchBlock', true)
             ->set('title', 'Research Vocabularies Australia')
             ->render('home');
    }

    /**
     * Viewing a vocabulary by slug.
     * The top-level global_config.php routes requests by default
     * to applications/portal/core/controllers/dispatcher.php,
     * which in turn routes slug-like requests to this method.
     * // TODO: implement view by slug, probably not needed
     * @return view/html
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     */
    public function view($id)
    {
        $this->viewById($id);
    }

    /**
     * Pre viewing a non current version
     * @return view/html
     * @author  Liz Woods <liz.woods@ands.org.au>
     */
    public function version_preview()
    {
        //echo "we are here";
        // echo $this->input->get('version');
        $version = json_decode($this->input->get('version'), true);

        // print_r($version);
        //$v_id = $this->input->get('v_id');

        $this->blade
             ->set('version', $version)
             ->render('version_preview');

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
        $this->blade
             ->set('search_app', true)
             ->set('title', 'Research Vocabularies Australia')
             ->render('index');
    }

    /**
     * Page Controller
     * For displaying static pages that belongs to the vocabs module
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     * @param  $slug supported: [help|about|contribute]
     * @return view
     */
    public function page($slug)
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
                $this->blade->set('scripts',
                    array('widgetDirective',
                        'vocabDisplayDirective', 'conceptDisplayDirective'));
                break;
        }
        $this->blade
             ->set('title', $title . ' - Research Vocabularies Australia')
             ->render($slug);
    }

    /**
     * Primary search functionality
     * data is obtained from angularjs php input POST
     * vocabs_factory's search(filters)
     *                calls post('filter', {filters: filters})
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
     * @return json search result
     */
    public function filter()
    {
        // This should not now be called! It has been replaced with calls
        // to the Registry API.
        // Remove this method during final cleanup.
        throw new Exception('Oops, the controller filter() method was called');
        return;

        //header
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');
        set_exception_handler('json_exception_handler');
        $data = json_decode(file_get_contents("php://input"), true);
        $filters = isset($data['filters']) ? $data['filters'] : false;
        $this->load->library('solr');
        $vocab_config = get_config_item('vocab_config');
        if (!$vocab_config['solr_url']) {
            throw new Exception('Indexer URL for Vocabulary '
                . 'module is not configured correctly');
        }

        $this->solr->setUrl($vocab_config['solr_url']);
//         $this->solr->init()->setCore('vocabs');

        $pp = array_key_exists('pp', $filters) ? $filters['pp'] : 10;
        $start = 0;

        //facets
        $this->solr
             ->setFacetOpt('field', 'subject_labels')
             ->setFacetOpt('field', 'publisher')
             ->setFacetOpt('field', 'language')
             ->setFacetOpt('field', 'access')
             ->setFacetOpt('field', 'format')
             ->setFacetOpt('field', 'licence')
             ->setFacetOpt('field', 'widgetable')
             ->setFacetOpt('sort', 'index asc')
             ->setFacetOpt('mincount', '1');
        if ($filters) {
            //highlighting
            $this->solr
                 ->setOpt('hl', 'true')
                 ->setOpt('hl.fl', '*')
                 ->setOpt('hl.simple.pre', '&lt;b&gt;')
                 ->setOpt('hl.simple.post', '&lt;/b&gt;')
                 ->setOpt('hl.snippets', '2');

            //search definition
            $this->solr
                 ->setOpt('defType', 'edismax')
                 ->setOpt('rows', $pp)
                 ->setOpt('q.alt', '*:*')
                // see (1) views/includes/search-view.blade.php
                // for the fields that must be returned for the
                // "main" search function,
                // (2) assets/templates/widgetDirective.html and
                // assets/js/vocabDisplayDirective.js for the
                // fields needed for the Widget Explorer.
                // The Widget Explorer needs "sissvoc_endpoint" added
                // to the list required by the "main" search.
                // NB: highlighting can/does also return snippets
                // from other fields not listed in fl (which is good!).
                 ->setOpt('fl',
                     'id,slug,status,title,acronym,publisher,'
                          . 'description,widgetable,sissvoc_endpoint')
                 ->setOpt(
                     'qf',
                     'title_search^1 subject_search^0.5 '
                          . 'description^0.01 fulltext^0.001 '
                     . 'concept_search^0.02 publisher_search^0.5'
                 );

            foreach ($filters as $key => $value) {
                switch ($key) {
                    case "q":
                        if ($value != '') {
                            $this->solr->setOpt('q', $value);
                        }

                        break;
                    case "p":
                        $page = (int)$value;
                        if ($page>1) {
                            $start = $pp * ($page-1);
                        }
                        $this->solr->setOpt('start', $start);
                        break;
                    case 'subject_labels':
                    case 'publisher':
                    case 'access':
                    case 'format':
                    case 'language':
                    case 'licence':
                    case 'widgetable':
                        if (is_array($value)) {
                            $fq_str = '';
                            foreach ($value as $v) {
                                $fq_str .= ' ' . $key . ':("' . $v . '")';
                            }

                            $this->solr->setOpt('fq', $fq_str);
                        } else {
                            $this->solr->setOpt('fq', '+' . $key
                                                . ':("' . $value . '")');
                        }
                        break;
                }
            }
        }

        // CC-1298 If there's no search term, order search result by
        // title_sort asc
        if (!$filters || !isset($filters['q']) || trim($filters['q']) == '') {
            $this->solr
                ->setOpt('sort', 'title_sort asc')
                ->setOpt('rows', $pp);
        }

        // $this->solr->setFilters($filters);
        $result = $this->solr->executeSearch(true);

        // CC-1270 Facet names come back from Solr sorted case-sensitively.
        // Resort them case-insensitively.
        foreach ($result['facet_counts']['facet_fields'] as $key => $value) {
            $result['facet_counts']['facet_fields'][$key] =
            $this->sortFacetsInsensitively($value);
        }

        $event = array(
            'event' => 'search',
            'filters' => $filters,
        );
        if ($filters) {
            $event = array_merge($event, $filters);
        }

        vocab_log_terms($event);
        echo json_encode($result);
    }

    /** Partition an array based on the location of the first lower-case
     * element.
     * The array to be partitioned is treated
     * as a set of Solr facets, i.e., the values to be examined are only
     * in the even-numbered indexes of the array; the odd-numbered positions
     * are facet counts, and are ignored.
     * @param array $arrayToPartition The array to be partitioned.
     * @return int If the array is empty, then 0. If non-empty, the index
     * of the first element beginning with a lower-case value, if there is one.
     * Otherwise, the size of the array (i.e., the index of the first position
     * beyond the end of the array. */
    private function findPartitionPoint($arrayToPartition)
    {
        $lower = 0;
        $upper = count($arrayToPartition) - 2;

        // Binary chop based on
        // https://terenceyim.wordpress.com/2011/02/01/
        //         all-purpose-binary-search-in-php/
        while ($lower <= $upper) {
            $mid = (int) (($upper - $lower) / 2) + $lower;
            if ($mid % 2 == 1) {
                // $mid is odd, i.e., a count value. So move down
                // to the preceding index value.
                $mid = $mid - 1;
            }
            // Use "a" as the first possible lower-case value.
            if ($arrayToPartition[$mid] < "a") {
                $lower = $mid + 2;
            } elseif ($arrayToPartition[$mid] > "a") {
                $upper = $mid - 2;
            } else {
                return $mid;
            }
        }
        return $lower;
    }

    /** Sort facet information case-insensitively. The array is assumed
     * to be already sorted case-sensitively. The array to be partitioned is
     * treated
     * as a set of Solr facets, i.e., the values to be examined are only
     * in the even-numbered indexes of the array; the odd-numbered positions
     * are facet counts, and are ignored for sorting purposes, but during
     * merging, each one is kept together with the preceding array element.
     * The array is first partitioned
     * into the upper-case and lower-case sections, then a merge sort is
     * done on the two sections. *
     * @param array $arrayToSort The array of facets to be sorted.
     * @return array The array as sorted.
     */
    private function sortFacetsInsensitively($arrayToSort)
    {
        $arraySize = count($arrayToSort);
        $partitionPoint = $this->findPartitionPoint($arrayToSort);
        if ($partitionPoint == 0 || $partitionPoint == $arraySize) {
            // Either all upper-case, or all lower-case, so no merging
            // to be done.
            return $arrayToSort;
        }
        $mergedArray = array();
        // Index that works through the first part of the array
        // (with upper-case elements).
        $counter1 = 0;
        // Index that works through the second part of the array
        // (with lower-case elements).
        $counter2 = $partitionPoint;

        // Merge based on http://www.codexpedia.com/php/
        //                       merge-sort-example-in-php/
        // Merge lists as much as possible.
        while ($counter1 < $partitionPoint && $counter2 < $arraySize) {
            if (strcasecmp(
                $arrayToSort[$counter1],
                $arrayToSort[$counter2]
            ) > 0) {
                $mergedArray[] = $arrayToSort[$counter2];
                $counter2 ++;
                $mergedArray[] = $arrayToSort[$counter2];
                $counter2 ++;
            } else {
                $mergedArray[] = $arrayToSort[$counter1];
                $counter1 ++;
                $mergedArray[] = $arrayToSort[$counter1];
                $counter1 ++;
            }
        }
        // Copy the left-overs from the first part of the array.
        while ($counter1 < $partitionPoint) {
            $mergedArray[] = $arrayToSort[$counter1];
            $counter1 ++;
            $mergedArray[] = $arrayToSort[$counter1];
            $counter1 ++;
        }
        // Copy the left-overs from the second part of the array.
        while ($counter2 < $arraySize) {
            $mergedArray[] = $arrayToSort[$counter2];
            $counter2 ++;
            $mergedArray[] = $arrayToSort[$counter2];
            $counter2 ++;
        }

        return $mergedArray;
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

        $ownedVocabulariesList = $this->RegistryAPI->getOwnedVocabularies();
        $ownedVocabularies = $ownedVocabulariesList->getOwnedVocabulary();

        $published = collect($ownedVocabularies)
            ->filter(function(OwnedVocabulary $vocab) {
                return $vocab->getStatus() === Vocabulary::STATUS_PUBLISHED;
            })->toArray();

        $draft = collect($ownedVocabularies)
            ->filter(function(OwnedVocabulary $vocab) {
                return $vocab->getStatus() === Vocabulary::STATUS_DRAFT || $vocab->getHasDraft();
            })->toArray();

        $deprecated = collect($ownedVocabularies)
            ->filter(function(OwnedVocabulary $vocab) {
                return $vocab->getStatus() === Vocabulary::STATUS_DEPRECATED;
            })->toArray();

        vocab_log_terms([
            'event' => 'pageview',
            'page' => 'myvocabs'
        ]);

        $this
            ->blade
//            ->set('owned_vocabs', $owned)
            ->set('draft', $draft)
            ->set('published', $published)
            ->set('deprecated', $deprecated)
            ->set('ownedCount', count($ownedVocabularies))
            ->set('title', 'My Vocabs - Research Vocabularies Australia')
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
     * Services Controller
     * For allowing RESTful API against the Vocabs Portal Database / SOLR
     * vocabs_factory provides the following:
     *           getAll()
     *               get('/services/vocabs')
     *
     *            add (data)
     *               post('/services/vocabs', {data: data})
     *
     *            get (slug)
     *               get('/services/vocabs/' + slug)
     *
     *            modify(slug, data)
     *               post('/services/vocabs/' + slug, {data: data})
     *
     *            suggest(type)
     *               get('/services/vocabs/all/related?type=' + type)
     *
     *            user()
     *               get('/services/vocabs/all/user')
     *
     * Other supported services:
     *       index
     *
     *    Used by assets/js/vocabs_visualise_directive.js:
     *       tree
     *
     *    Not currently used:
     *       accessPoints
     *       tree-raw
     *       versions
     *
     * @param  string $class [vocabs] context
     * @param  string $id [id] of the context
     * @param  string $method [method] description of the query
     * @return API response / JSON
     * @example services/vocabs/ , services/vocabs/anzsrc-for ,
     *          services/vocabs/rifcs/versions
     * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
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
        //accesspoint service for all or just one vocab(
        if ($method == 'accessPoints') {
            $result = array();
            if ($id == 'all' || $id == '') {
                $vocabs = $this->vocab->getAll();
            } else {
                $vocabs[] = $this->vocab->getByID($id);
            }

            if ($vocabs) {
                $status = "OK";
                foreach ($vocabs as $v) {

                    $vId = $v->prop['id'];
                    $title = $v->prop['title'];

                    $versions = false;//$v['versions'];
                    $accessPoints = array();

                    foreach ($v->versions as $version) {
                        $versionIds[] =  $version['id'];
                        $accessPoints =
                            $this->vocab->getAccessPoints(
                                $version['id'],
                                $type
                            );
                    }
                    if (!($id == 'all' && $accessPoints == false)) {
                        $result[] = array('id' => $vId,
                                          'title' => $title,
                                          'accessPoints'=>$accessPoints);
                    }
                }

            } else {
                // FIXME if this is ever used: this is
                // properly a message, not a status.
                // Use "error" as the status, and assign
                // the message to $result instead.
                $status = "No vocabulary found";
            }
            echo json_encode(
                array(
                    'status' => $status,
                    'message' => $result,
                )
            );
            // FIXME if this is ever used: should this be exit()?
            // Check if this should be a return statement.
            exit();
        } // method accessPoints

        $result = '';
        if ($id == 'all' || $id == '') {
            //get All vocabs listed
            //use test data for now
            $vocabs = $this->vocab->getAll();
            $result = array();

            if ($vocabs) {
                foreach ($vocabs as $vocab) {
                    $result[] = $vocab->display_array();
                }
            }

            if ($method == 'related') {
                // related for all vocabs
                $result = array();
                $type = $this->input->get('type')
                      ? $this->input->get('type') : false;
                if ($type == 'vocabulary') {
                    $allVocabs = $this->vocab->getAllVocabs();
                    foreach ($allVocabs as $v) {
                        $result[] = array('title' => $v['title'],
                                          'vocab_id' => $v['id'],
                                          'type' => 'vocabulary',
                                          'identifiers' =>
                                              array('slug' => $v['slug']));
                    }
                } else {
                    foreach ($vocabs as $vocab) {
                        $vocab_array = $vocab->display_array();
                        if (isset($vocab_array['related_entity'])) {
                            foreach ($vocab_array['related_entity'] as $re) {
                                if ($type == 'publisher') {
                                    if ($re['type'] == 'party') {
                                        if (isset($re['relationship'])
                                            && is_array($re['relationship'])) {
                                            foreach ($re['relationship'] as
                                                     $rel) {
                                                if ($rel == 'publishedBy') {
                                                    $re['vocab_id'] =
                                                        $vocab_array['id'];
                                                    $result[] = $re;
                                                }
                                            }
                                        }
                                    }
                                    if ($re['type'] == 'party'
                                        && isset($re['relationship'])
                                        && $re['relationship'] ==
                                            'publishedBy') {
                                        $re['vocab_id'] = $vocab_array['id'];
                                        $result[] = $re;
                                    }
                                } elseif ($type) {
                                    if ($re['type'] == $type) {
                                        $re['vocab_id'] = $vocab_array['id'];
                                        $result[] = $re;
                                    }
                                } else {
                                    $result[] = $re;
                                }
                            }
                        }
                    }
                }
            } elseif ($method == 'user') {
                // user (for all vocabs)
                $result = array();
                $result['affiliations'] =
                    array_values(array_unique($this->user->affiliations()));
                $result['affiliationsNames'] = $this->user->affiliationsNames();
                $result['role_id'] = $this->user->localIdentifier();

            } elseif ($method == 'index') {
                // (re-)index for all vocabs
                // Require superuser authentication.
                if (!$this->user->isSuperAdmin()) {
                    throw new Exception('Must be logged in with a '
                                        . 'superuser role to do a full '
                                        . 'reindex.');
                }

                $result = array();

                //clear all vocabs before adding
                $this->load->library('solr');
                $vocab_config = get_config_item('vocab_config');
                if (!$vocab_config['solr_url']) {
                    throw new Exception('Indexer URL for Vocabulary '
                                        . 'module is not configured correctly');
                }

                $this->solr->setUrl($vocab_config['solr_url']);
                $this->solr->deleteByQueryCondition('*:*');

                //index each vocab one by one
                foreach ($vocabs as $vocab) {
                    $result[] = $vocab->indexable_json();
                    // This call to indexVocab() is protected by the
                    // check of isSuperAdmin() just above.
                    $this->indexVocab($vocab);
                }
            }

            // Fall through from all GET requests to this!
            // FIXME: Don't fall through to this!
            // FIXME: use a method name, e.g., "add", for this!
            // POST request, for adding a new vocabulary
            $angulardata = json_decode(file_get_contents("php://input"), true);
            $data = isset($angulardata['data']) ? $angulardata['data'] : false;
            if ($data) {
                //deal with POST request, adding new vocabulary
                // First, require that the user is logged in.
                if (!$this->user->isLoggedIn()) {
                    throw new Exception(
                        'Error adding new vocabulary: not logged in.');
                }

                // So the user is logged in.
                // Next, check that an owner has been specified.
                if (!isset($data['owner'])) {
                    throw new Exception(
                      'Error adding new vocabulary: no owner specified.');
                }

                // Next, get their organisational affiliations.
                // If they don't have any, then the user's authentication
                // token ("localIdentifier") must be specified as the owner.
                // Otherwise if the user has at least one organisational
                // one of these roles must be specified as the owner
                // of this new vocabulary.
                $affiliations = $this->user->affiliations();
                if ((empty($affiliations)
                     && ($data['owner'] != $this->user->localIdentifier()))
                    || (!empty($affiliations)
                        && !in_array($data['owner'],$affiliations))) {
                    throw new Exception(
                      'Error adding new vocabulary: no valid owner provided.');
                }

                $vocab = $this->vocab->addNew($data);
                if (!$vocab) {
                    throw new Exception('Error adding new vocabulary.');
                }

                if ($vocab) {
                    $result = $vocab;
                    //index just added one
                    // This call to indexVocab() is protected by the
                    // ownership checks just above.
                    $this->indexVocab($vocab);

                    //log
                    $event = array(
                        'event' => 'add',
                        'vocab' => $vocab->title,
                    );
                    vocab_log_terms($event);
                }

            }

        } elseif ($id != '') {
            // an individual vocab id was specified

            $vocab = $this->vocab->getBySlug($id);
            if (!$vocab) {
                $vocab = $this->vocab->getByID($id);
            }

            if (!$vocab) {
                throw new Exception('Vocab ID ' . $id . ' not found');
            }

            $result = $vocab->display_array();

            //POST Request, for saving this vocab
            // Fall through from all GET requests to this!
            // FIXME: Don't fall through to this!
            // FIXME: use a method name, e.g., "add", for this!
            $angulardata = json_decode(file_get_contents("php://input"), true);
            $data = isset($angulardata['data']) ? $angulardata['data'] : false;

            if ($data) {
                // First, require that the user is logged in.
                if (!$this->user->isLoggedIn()) {
                    throw new Exception(
                        'Error adding new vocabulary: not logged in.');
                }

                // So the user is logged in.
                // Does the user own the vocabulary being updated?
                if (!$this->vocab->isOwner($vocab->prop['id'])) {
                    throw new Exception('Attempt to update Vocab ID '
                                        . $id . ' not owned by this user');
                }

                // Does the $data specify the same ID as what was
                // given in the POST URL?
                if (!isset($data['id'])
                    || ($data['id'] != $vocab->prop['id'])) {
                    throw new Exception(
                        'POST data does not have the same Vocab ID '
                        . $id . ' specified in URL');
                }

                // Next, check that an owner has been specified.
                if (!isset($data['owner'])) {
                    throw new Exception(
                      'Error adding new vocabulary: no owner specified.');
                }

                // Next, get their organisational affiliations.
                // If they don't have any, then the user's authentication
                // token ("localIdentifier") must be specified as the owner.
                // Otherwise if the user has at least one organisational
                // one of these roles must be specified as the owner
                // of this new vocabulary.
                $affiliations = $this->user->affiliations();
                if ((empty($affiliations)
                     && ($data['owner'] != $this->user->localIdentifier()))
                    || (!empty($affiliations)
                        && !in_array($data['owner'],$affiliations))) {
                    throw new Exception(
                      'Error adding new vocabulary: no valid owner provided.');
                }

                // if id refers to a draft look up to see if
                // there is a published for this draft
                if ($vocab->prop['status'] == 'draft'
                    && $data['status'] == 'published') {
                    $vocab = $this->vocab->getBySlug($vocab->prop['slug']);
                }

                $result = $vocab->save($data);

                if (null == $this->user->affiliations()
                    && $data['status'] == 'published') {
                    $data['status'] = 'draft';
                    $vocab->prop['status'] = 'draft';
                    $vocab->save($data);
                    $to_email = $this->config->item('site_admin_email');
                    $content = 'Vocabulary' . $data['title']
                             . ' is published by a user with no affiliations'
                             . NL;
                    $email = $this->load->library('email');
                    $email->to($to_email);
                    $email->from($to_email);
                    $email->subject('Vocabulary' . $data['title']
                              . ' published without an organisational role');
                    $email->message($content);
                    $email->send();
                    $vocab->log('An email of this action has been sent to'
                                . $this->config->item('site_admin_email'));
                }

                //throw new Exception($data['status']);

                //result should be an object
                //result.status = 'OK'
                //result.message = array()

                if (!$result) {
                    throw new Exception('Error while saving vocabulary');
                }

                if ($result && $vocab->prop['status'] == 'published') {
                    // This call to indexVocab() is protected by the
                    // ownership checks just above.
                    if ($this->indexVocab($vocab)) {
                        $vocab->log('Indexing Success');
                    }
                }

                if ($result && $vocab->prop['status'] == 'deprecated') {
                    if ($this->indexVocab($vocab)) {
                        $vocab->log('Indexing Success');
                    }
                }

                if ($result) {
                    $result = $vocab;
                }

                $event = array(
                    'event' => 'edit',
                    'vocab' => $vocab->title,
                );
                vocab_log_terms($event);

            }
            if ($method == 'index') {
                if (!$this->user->isSuperAdmin()) {
                    throw new Exception('Must be logged in with a '
                                        . 'superuser role to do a '
                                        . 'reindex.');
                }
                $result = $vocab->indexable_json();
                // This call to indexVocab() is protected by the
                // check of isSuperAdmin() just above.
                $this->indexVocab($vocab);
            } elseif ($method == 'versions') {
                $result = $result['versions'];
            } elseif ($method == 'tree') {
                $result = $vocab->display_tree();
            } elseif ($method == 'tree-raw') {
                $result = $vocab->display_tree(true);
            }
        }

        echo json_encode(
            array(
                'status' => 'OK',
                'message' => $result,
            )
        );
    }

    /**
     * Indexing a single vocab helper method
     * It is the responsibility of the caller to have done authentication.
     * @access private
     * @param  _vocabulary $vocab
     * @return boolean
     */
    private function indexVocab($vocab)
    {

        //load necessary stuff
        $this->load->library('solr');
        $vocab_config = get_config_item('vocab_config');
        if (!$vocab_config['solr_url']) {
            throw new Exception('Indexer URL for Vocabulary module '
                                . 'is not configured correctly');
        }

        $this->solr->setUrl($vocab_config['solr_url']);

        //only index published records
        // CC-1255 and CC-1328, index deprecated vocabulary as well
        if ($vocab->status == 'published' || $vocab->status == 'deprecated') {
            //remove index
            $this->solr->deleteByID($vocab->id);

            //index
            $index = $vocab->indexable_json();
            $solr_doc = array();
            $solr_doc[] = $index;
            $solr_doc = json_encode($solr_doc);
            $add_result = json_decode(
                $this->solr->add_json_commit($solr_doc),
                true
            );

            if ($add_result['responseHeader']['status'] === 0) {
                return true;
            } else {
                return false;
            }
        }

    }

    /**
     * Delete a vocabulary.
     * There user must be logged in, and have ownership rights
     * on the vocabulary.
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

        // TODO: check permissions

        $vocab = $this->RegistryAPI->getVocabularyByIdEdit($id);
        if (!$vocab) {
            return json_encode([
                'status' => 'error',
                'message' => 'No such vocabulary.'
            ]);
        }

        $deleteCurrent = $vocab->getStatus() === Vocabulary::STATUS_PUBLISHED ? 'true' : 'false';
        $deleteDraft = $vocab->getStatus() === Vocabulary::STATUS_DRAFT ? 'true' : 'false';

        $this->RegistryAPI->deleteVocabulary($vocab->getId(), $deleteCurrent, $deleteDraft);

        return json_encode([
            'status' => 'success',
            'message' => 'OK.'
        ]);
    }



    /**
     * ToolKit Service provider
     * To interact with 3rd party application in order to get
     * vocabularies metadata
     * Requires a ?GET request
     * vocabs_factory provides:
     *           toolkit(req)
     *               get('toolkit?request=' + req)
     *
     *           getMetadata(id)
     *               get('toolkit?request=getMetadata&ppid=' + id)
     * @example vocabs/toolkit/?request=listPooLPartyProjects returns
     *          all the PoolParty project available
     * @return view
     */
    public function toolkit()
    {
        //header
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');
        set_exception_handler('json_exception_handler');

        //if (!get_config_item('vocab_toolkit_url'))
        // throw new Exception('Vocab ToolKit URL not configured correctly');
        $request = $this->input->get('request');
        if (!$request) {
            throw new Exception('Request Not Found');
        }

        $url = get_vocab_config('toolkit_url');
        if (!$url) {
            throw new Exception('Vocab Toolkit URL not configured correctly');
        }

        switch ($request) {
            case 'listPoolPartyProjects':
                $sample = @file_get_contents($url .
                                             'getInfo/PoolPartyProjects');
                echo $sample;
                break;
            case 'getMetadata':
                $ppid = $this->input->get('ppid')
                      ? $this->input->get('ppid') : false;
                if (!$ppid) {
                    throw new Exception(
                        'Pool Party ID required to get metadata'
                    );
                }

                $metadata = @file_get_contents($url
                                               . 'getMetadata/poolParty/'
                                               . $ppid);
                echo $metadata;
                break;
            default:
                throw new Exception('Request Not Recognised');
        }
    }

    /**
     * Does haystack start with needle?
     * Taken from http://stackoverflow.com/questions/834303/
     *                   startswith-and-endswith-functions-in-php
     */
    public function startsWith($haystack, $needle)
    {
        // Search backwards starting from haystack length
        // characters from the end.
        return $needle === "" ||
        strrpos($haystack, $needle, -strlen($haystack)) !== false;
    }


    /*
     * possible future use of migration scripts for release specific data change
     *
     */
    public function migrate($releaseID)
    {
        if (!$this->user->isSuperAdmin()) {
            throw new Exception('Must be logged in with a '
                                . 'superuser role to do a '
                                . 'migration.');
        }
        $response = array();
        $response['releaseID'] = $releaseID;
        $response["tasks"] = array();
        // first release after Beta migration scripts
        if ($releaseID > 0) {
            $response[] = $this->taskMigration();
        }
        echo json_encode($response);

    }

/*
 * migrate concepts_list and concept_tree from task's response into
 * version's data where it belongs
 */
    private function taskMigration()
    {
        if (!$this->user->isSuperAdmin()) {
            throw new Exception('Must be logged in with a '
                                . 'superuser role to do a '
                                . 'task migration.');
        }
        $ci =& get_instance();
        $message = array();
        $db = $ci->load->database('vocabs', true);
        $query = $db->order_by("id", "asc")
               ->get_where('task', array('status' => 'success'));
        if ($query->num_rows() > 0) {
            $taskArray = $query->result_array();
            foreach ($taskArray as $task) {
                $version_id = $task['version_id'];
                $response = json_decode($task['response'], true);
                if (isset($response['concepts_tree'])
                    || isset($response['concepts_list'])) {
                    $v_query = $db->get_where(
                        'versions',
                        array('id' => $version_id)
                    );
                    if ($v_query->num_rows() > 0) {
                        $vv = $v_query->first_row();
                        $vvdata = json_decode($vv->data, true);
                        $response = json_decode($task['response'], true);
                        if (isset($response['concepts_tree'])) {
                            $vvdata['concepts_tree'] =
                                urldecode($response['concepts_tree']);
                        }
                        if (isset($response['concepts_list'])) {
                            $vvdata['concepts_list'] =
                                urldecode($response['concepts_list']);
                        }
                        $saved_data = array('data' => json_encode($vvdata));
                        $db->where('id', $version_id);
                        $result = $db->update('versions', $saved_data);

                        if (!$result) {
                            $message[] = array(
                                'version_id' => $version_id ,
                                'error' => $db->_error_message());
                        } else {
                            $message[] = array(
                                'version_id' => $version_id ,
                                'data' => $vvdata);
                        }
                    } else {
                        //cant find version with the id, handle here
                        $message[] = 'Version with ID: '
                                   . $version_id . ' not found';
                    }
                }
            }
        }
        return array("task" => "taskMigration", "message"=>$message);
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
            $vocab = $this->RegistryAPI->getVocabularyById($id,
                'true', 'true', 'true');

            $event = array(
                'event' => 'vocabview-new',
                'vocab' => $vocab->getTitle(),
                'slug' => $vocab->getSlug(),
                'id' => $vocab->getId(),
            );
            vocab_log_terms($event);

            $this->blade
            ->set('vocab', $vocab)
            ->set('title', $vocab->getTitle()
                . ' - Research Vocabularies Australia')
                ->render('vocab');
        } catch (Exception $e) {
            // No longer throw an exception, like this:
            // throw new Exception('No Record found with slug: ' . $slug);
            // But instead, show the soft 404 page.
            $message = '';
            $this->blade
            ->set('message', $message)
            ->render('soft_404');
        }
    }

    /**
     * Previewing a related entity or related vocabulary
     * @return view/html
     */
    public function related_preview()
    {

        $relatedParam = json_decode($this->input->get('related'));
        $v_id = $this->input->get('v_id');
        $sub_type = $this->input->get('sub_type');

        $related = [];

        if (isset($relatedParam->{"related-entity"})) {
            $isVocab = false;
            $reRef = $this->RegistryAPIClient->getSerializer()->
            deserialize($relatedParam,
                    '\ANDS\VocabsRegistry\Model\RelatedEntityRef');
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
            $related_vocabs = $this->RegistryAPI->getVocabulariesRelatedToRelatedEntityById($reRef->getRelatedEntity()->getId());
        } else {
            $isVocab = true;
            $rvRef = $this->RegistryAPIClient->getSerializer()->
            deserialize($relatedParam,
                    '\ANDS\VocabsRegistry\Model\RelatedVocabularyRef');
            $rv = $rvRef->getRelatedVocabulary();
            $related['title'] = $rv->getTitle();
            $related['type'] = 'internal_vocabulary';
            $related['relationship'] = $rvRef->getRelation();
            $related['description'] = $rv->getDescription();
            $related['vocab_id'] = $rv->getId();
            $related_vocabs = $this->RegistryAPI->getVocabulariesRelatedToVocabularyById($rvRef->getRelatedVocabulary()->getId());
            // Filter out _this_ vocabulary
        }
//         echo(json_encode($related));
// return;
//         echo(json_encode($related_vocabs));
//         return;

        $others = array();

        foreach ($related_vocabs->getReverseRelatedVocabulary()
            as $reverse_related_vocab) {
            $related_vocab = $reverse_related_vocab->getRelatedVocabulary();
            // If we got a vocabulary to start with, exclude ourself from
            // the related vocabularies.
            if ($reverse_related_vocab->getRelatedVocabulary()->getId() ==
                $v_id) {
//                 echo('excluded ourself');
                continue;
            }
            $others[] = $related_vocab;
            if (!$isVocab) {
                foreach ($reverse_related_vocab->getRelatedEntityRelation() as $rel) {
                    if ($rel === RelatedEntityRef::RELATION_PUBLISHED_BY) {
//                         echo('found publisher');
                        $related['sub_type'] = 'publisher';
                    }
                }
            }
        }


//         $others = array_unique($others, true);

        $related['other_vocabs'] = $others;
        $this->blade
        ->set('related', $related)
        ->set('sub_type', $sub_type)
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
        $this->blade
        ->set('scripts', array('vocabs_cms', 'versionCtrl', 'relatedCtrl',
            'relatedVocabularyCtrl',
            'subjectDirective', 'relatedEntityIdentifierDirective'))
            ->set('vocab', false)
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

            $this->blade
                ->set(
                'scripts',
                array('vocabs_cms', 'versionCtrl', 'relatedCtrl',
                    'relatedVocabularyCtrl',
                    'subjectDirective', 'relatedEntityIdentifierDirective')
                )
                ->set('vocab', $vocab)
                ->set('title', 'Edit - '
                    . $vocab->getTitle() . ' - Research Vocabularies Australia')
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
            $this->blade
            ->set('message', $message)
            ->render('soft_404');
        }
    }

    /**
     * New Services Controller
     * For allowing RESTful API against the Vocabs Registry
     *
     *    Used by assets/js/vocabs_visualise_directive.js:
     *       tree
     *
     *
     * @param  string $class [vocabs] context
     * @param  string $id [id] of the context
     * @param  string $method [method] description of the query
     * @return API response / JSON
     * @example services/vocabs/ , services/vocabs/anzsrc-for ,
     *          services/vocabs/rifcs/versions
     */
    public function servicesnew($class = '', $id = '', $method = '', $type = '')
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
                $result = $this->display_tree($id);
            } elseif ($method == 'tree-raw') {
                $result = $this->display_tree($id, true);
            }
        }
        echo json_encode(
            array(
                'status' => 'OK',
                'message' => $result,
            ));
    }


    /** Get the current version for a vocabulary, if it has one.
     * @param int $id The vocabulary ID of the vocabulary to be looked up
     * @return NULL|Version
     */
    private function getCurrentVersionForVocabularyId($id) {
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
     * @param  boolean $raw whether to send back the tree as returned from the Registry
     * @return array $tree
     */
    private function display_tree($id, $raw = false)
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
        if ($raw) return $tree_data;

        //build a tree a little bit nicer
        $this->buildTree($tree_data, $sissvoc_endpoint);

        return $tree_data;
    }

    /**
     * Helper function for @display_tree.
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

                if(isset($concept['definition']))
                    $tipText .= '<br/><b>Definition: </b>'
                        . $concept['definition'];
                        if(isset($concept['notation']))
                            $tipText .= '<br/><b>Notation: </b>' .$concept['notation'];
                            if($sissvoc_endpoint != '')
                                $tipText .= '<br/><a class="pull-right" target="_blank" href="' .$sissvoc_endpoint . '/resource?uri=' . $uri . '">View as linked data</a>';
                                $concept['value'] = $title;
                                $concept['tip'] = $tipText. '</p>';
                                if (isset($concept['narrower'])) {
                                    $this->buildTree($concept['narrower'],
                                        $sissvoc_endpoint);
                                    $concept['num_child'] = sizeof($concept['narrower']);
                                } else {
                                    $concept['num_child'] = 0;
                                }
            }
        }
    }

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



    /**
     * Constructor Method
     * Autload blade by default
     */
    public function __construct()
    {
        parent::__construct();
        $this->load->model('vocabularies', 'vocab');
        $this->load->library('blade');
        ANDS\VocabsRegistry\Configuration::getDefaultConfiguration()->setHost(
            get_vocab_config('registry_api_url'));
        // If debugging required, uncomment and adjust filename.
//          ANDS\VocabsRegistry\Configuration::getDefaultConfiguration()
//              ->setDebug(true)
//          ->setDebugFile('/var/www/html/workareas/richard/vocabs-new/engine/logs/error/richardvocabsnewphpdebug.txt');

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

    }
}
