<?php

/**
 * Controller for community lenses finding aid.
 */
class Lenses extends MX_Controller
{
    /* Community lenses finding aid. */

    // Path to this controller.
    const LENSES = 'lenses';

    // NB: each call to render() must be preceded by
    //      ->set('page', '...')
    // where the value of the second parameter is what is expected for
    // the "page" field of portal_social_share analytics log entries.
    // The value of $page is included in the social sharing links in
    // the footer.

    public function error($message) {
        // $message = '';
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

    /**
     * Show a top-level, "static" page.
     * @param  string $page The page to show.
     * @return view
     * @throws Exception
     */
    public function pages($page)
    {
        $lensesFindingAid = env('FINDING_AID_LENSES');
        if (empty($lensesFindingAid)) {
            $this->error('No finding aid here.');
            return;
        }
        if (!is_dir($lensesFindingAid)) {
            $this->error('Finding aid directory specified, but missing.');
            return;
        }
        // Only allow slug-like page names.
        if (preg_match('/[^a-z_\-0-9]/', $page))
        {
            $this->error('Invalid page name');
            return;
        }
        $page_file = $lensesFindingAid . '/pages/' . $page . '/content.html';
        if (!is_file($page_file) || !is_readable($page_file)) {
            $this->error('No page file, or file is unreadable.');
            return;
        }

        // Sigh, can't use $doc->loadHTMLFile() directly, as it
        // doesn't cope with non-ASCII characters.
        $page_content = file_get_contents($page_file);
        $doc = new DOMDocument();
        // Force the parser to understand UTF-8.
        try {
            $doc->loadHTML('<?xml encoding="utf-8" ?>' .
                           '<div id="page_loaded">' .
                           $page_content . '</div>');
        } catch (Exception $e) {
            $this->error('Invalid page file.');
            return;
        }
        $this->rewriteLinks($doc);

        // Use getElementById() to avoid getting the XML header,
        // DOCTYPE, etc.
        $page_content = $doc->saveHTML(
            $doc->getElementById('page_loaded'));

        // Get content for top-level menu.
        $lensMenu = $this->getLensesFindingAidMenu($lensesFindingAid);

        // Legacy log.
        $event = array(
            'event' => 'pageview',
            'page' => 'lensesFindingAidPage',
            'page_page' => $page
        );
        vocab_log_terms($event);
        // Analytics log in logstash format.
        $event = [
            'event' => 'portal_page',
            'page' => 'lensesFindingAidPage',
            'page_page' => $page
        ];
        vocabs_portal_log($event);
        $this->blade
            ->set('page_page', $page)
            ->set('page_content', $page_content)
            // No script needed yet.
            // ->set('scripts', array('lensesPage'))
            ->set('page', 'lensesPage')
            ->set('lensMenu', $lensMenu)
            ->render('lensesPage');
    }

    /**
     * Show a domain page.
     * @param  string $domain The domain to show.
     * @return view
     * @throws Exception
     */
    public function domains($domain)
    {
        $lensesFindingAid = env('FINDING_AID_LENSES');
        if (empty($lensesFindingAid)) {
            $this->error('No finding aid here.');
            return;
        }
        if (!is_dir($lensesFindingAid)) {
            $this->error('Finding aid directory specified, but missing.');
            return;
        }
        // Only allow slug-like domain names.
        if (preg_match('/[^a-z_\-0-9]/', $domain))
        {
            $this->error('Invalid domain name');
            return;
        }
        $domain_file = $lensesFindingAid . '/domains/' . $domain . '/content.html';
        if (!is_file($domain_file) || !is_readable($domain_file)) {
            $this->error('No domain file, or file is unreadable.');
            return;
        }

        // Sigh, can't use $doc->loadHTMLFile() directly, as it
        // doesn't cope with non-ASCII characters.
        $domain_content = file_get_contents($domain_file);
        $doc = new DOMDocument();
        // Force the parser to understand UTF-8.
        try {
            $doc->loadHTML('<?xml encoding="utf-8" ?>' .
                           '<div id="domain_loaded">' .
                           $domain_content . '</div>');
        } catch (Exception $e) {
            $this->error('Invalid domain file.');
            return;
        }
        $this->rewriteLinks($doc);
        // Set styling of dropdown, and insert placeholder option.
        $dropdown = $doc->getElementById('organisations');
        if ($dropdown != null) {
            $organisation_option = $doc->createElement('option',
                                                       'organisations');
            $organisation_option->setAttribute('value', 'null');
            if ($dropdown->firstChild == null) {
                $dropdown->appendChild($organisation_option);
            } else {
                $dropdown->insertBefore($organisation_option,
                                        $dropdown->firstChild);
            }
            $dropdown->setAttribute('class', 'form-control caret-for-select');
            $dropdown->setAttribute('style', 'width:auto; display:inline');
        }

        // Use getElementById() to avoid getting the XML header,
        // DOCTYPE, etc.
        $domain_content = $doc->saveHTML(
            $doc->getElementById('domain_loaded'));

        // Get content for top-level menu.
        $lensMenu = $this->getLensesFindingAidMenu($lensesFindingAid);

        // Legacy log.
        $event = array(
            'event' => 'pageview',
            'page' => 'findingAidDomain',
            'domain' => $domain
        );
        vocab_log_terms($event);
        // Analytics log in logstash format.
        $event = [
            'event' => 'portal_page',
            'page' => 'findingAidDomain',
            'domain' => $domain
        ];
        vocabs_portal_log($event);
        $this->blade
            ->set('domain', $domain)
            ->set('domain_content', $domain_content)
            ->set('scripts', array('lensesDomain'))
            ->set('page', 'findingAidDomain')
            ->set('lensMenu', $lensMenu)
            ->render('lensesDomain');
    }

    /**
     * Show an organisation page.
     * @param  string $organisation The organisation to show.
     * @return view
     * @throws Exception
     */
    public function organisations($organisation)
    {
        //        echo 'hello';
        //        return 'hello';
        $lensesFindingAid = env('FINDING_AID_LENSES');
        if (empty($lensesFindingAid)) {
            $this->error('No finding aid here.');
            return;
        }
        if (!is_dir($lensesFindingAid)) {
            $this->error('Finding aid directory specified, but missing.');
            return;
        }
        // Only allow slug-like organisation names.
        if (preg_match('/[^a-z_\-0-9]/', $organisation))
        {
            $this->error('Invalid organisation name');
            return;
        }

        // To get the directory, replace underscores with slashes.
        $organisation_dir = str_replace('_', '/', $organisation);
        $organisation_file = $lensesFindingAid . '/organisations/' .
            $organisation_dir . '/content.html';
        if (!is_file($organisation_file) || !is_readable($organisation_file)) {
            $this->error('No organisation file, or file is unreadable.');
            return;
        }

        // Sigh, can't use $doc->loadHTMLFile() directly, as it
        // doesn't cope with non-ASCII characters.
        $organisation_content = file_get_contents($organisation_file);
        $doc = new DOMDocument();
        // Force the parser to understand UTF-8.
        try {
            $doc->loadHTML('<?xml encoding="utf-8" ?>' .
                           '<div id="organisation_loaded">' .
                           $organisation_content . '</div>');
        } catch (Exception $e) {
            $this->error('Invalid organisation file.');
            return;
        }
        $this->rewriteLinks($doc);

        // Use getElementById() to avoid getting the XML header,
        // DOCTYPE, etc.
        $organisation_content = $doc->saveHTML(
            $doc->getElementById('organisation_loaded'));

        // Get content for top-level menu.
        $lensMenu = $this->getLensesFindingAidMenu($lensesFindingAid);

        // Legacy log.
        $event = array(
            'event' => 'pageview',
            'page' => 'findingAidOrganisation',
            'organisation' => $organisation
        );
        vocab_log_terms($event);
        // Analytics log in logstash format.
        $event = [
            'event' => 'portal_page',
            'page' => 'findingAidOrganisation',
            'organisation' => $organisation
        ];
        vocabs_portal_log($event);
        $this->blade
            ->set('organisation', $organisation)
            ->set('organisation_content', $organisation_content)
            // No script needed yet.
            ->set('scripts', array('lensesOrganisation'))
            ->set('page', 'lensesOrganisation')
            ->set('lensMenu', $lensMenu)
            ->render('lensesOrganisation');
    }


    /**
     * Rewrite the links within a document. Add target="_blank" to all links.
     * Rewrite links with an href that use the "domain", "id", or "org" schemes.
     * @param  DOMDocument $doc The document to have its links rewritten.
     * @return view
     * @throws Exception
     */
    public function rewriteLinks($doc) {
        // Add target="_blank" to all links.
        // Rewrite links with href="id:123".
        $links = $doc->getElementsByTagName('a');
        foreach ($links as $link) {
            $link->setAttribute('target', '_blank');
            $href = $link->getAttribute('href');
            if (preg_match("/^domain:(.+)$/", $href, $matches)) {
                $link->setAttribute('href', base_url() .
                                    self::LENSES . '/domains/' . $matches[1]);
            }
            if (preg_match("/^id:(\d+)$/", $href, $matches)) {
                $link->setAttribute('href', base_url() .
                                    'viewById/' . $matches[1]);
            }
            if (preg_match("/^org:(.+)$/", $href, $matches)) {
                $link->setAttribute('href', base_url() .
                                    self::LENSES . '/organisations/' . $matches[1]);
            }
        }
    }

    /**
     * Get community lens finding aid menu content, if any.
     * @param string $lensesFindingAid The directory containing the
     *    community lens finding aid.
     * @return array Array that is the sequence of menu items
     *    to go below a "community lens" top-level menu.
     *    An empty array if there is no lens finding aid content.
     * @throws Exception
     */
    public function getLensesFindingAidMenu($lensesFindingAid) {
        // Default result is an empty object.
        $result = array();
        $menu_file = $lensesFindingAid . '/menu.json';
        if (!is_file($menu_file) || !is_readable($menu_file)) {
            // No menu file, or file is unreadable.
            return $result;
        }
        $menu_content = file_get_contents($menu_file);
        $menu_content_decoded = json_decode($menu_content, true);
        //        var_dump( $menu_content_decoded);
        if (is_array($menu_content_decoded) &&
            count($menu_content_decoded) > 0) {
            $result = $menu_content_decoded;
        }
        return $result;
    }

    /**
     * Constructor Method
     * Autoload blade by default
     */
    public function __construct()
    {
        parent::__construct();
        $this->load->library('blade');
    }
}
