<?php
class Auth extends CI_Controller {

      /* SD-2351912 RVADEV-16 The legacy (RDA-like) login() method was
         here. It was copied to the vocabs controller by commit
         dc484cb5 (CC-2627 RVA-40) and modified. The version here was
         subject to an XSS injection. Since we don't need this
         method, it has now been deleted. See the vocabs controller's
         login() function instead.  */

    /**
     * /registry/authenticate/:method
     *
     * TODO Deprecate in favor of explicit controllers
     * TODO BuiltInAuthenticator
     *
     * @param string $method
     * @throws \Abraham\TwitterOAuth\TwitterOAuthException
     * @throws Exception
     */
	public function authenticate($method = 'built_in') {
		/* For social logins, redirect to the appropriate provider. */
		if ($method === "twitter") {
			$url = \ANDS\Authenticator\TwitterAuthenticator::getOauthLink();
			redirect($url);
		}

		if ($method === "facebook") {
			$url =\ANDS\Authenticator\FacebookAuthenticator::getOauthLink();
			redirect($url);
		}

		if ($method === "google") {
			$url = \ANDS\Authenticator\GoogleAuthenticator::getOauthLink();
			redirect($url);
		}

		/* Other authentication methods may return JSON. */
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: application/json');
		set_exception_handler('json_exception_handler');

		// built_in, aaf-rapid, linkedin, shibboleth_sp

		$authenticator_class = $method.'_authenticator';

		if (!file_exists('engine/models/authenticators/'.$authenticator_class.'.php')) {
			throw new Exception('Authenticator '.$authenticator_class.' not found!');
		}

		//get parameters from angularjs POST
		$params = json_decode(file_get_contents('php://input'), true);

		if(!$params) $params = array();
		$post = ($this->input->post() ? $this->input->post() : array());

		//get parameters from POST
		$params = array_merge($params, $post);

		try {
			$this->load->model('authenticators/'.$authenticator_class, 'auth');
			$this->auth->load_params($params);
			$this->auth->authenticate();

			// we don't need to refresh affiliation anymore since the authenticator authComplete already
			// set the required authentication cookie
			//$this->user->refreshAffiliations($this->user->localIdentifier());

			if ($this->input->get('redirect')) redirect($this->input->get('redirect'));

		} catch (Exception $e) {
			// $this->auth->post_authentication_hook();
			throw new Exception($e->getMessage());
		}

	}

	/**
	 * Callback to /registry/auth/twitter
	 * oauth1
	 *
	 * @throws Exception
	 */
	public function twitter()
	{
		$oauthToken = $_GET['oauth_token'];
		$oauthVerifier = $_GET['oauth_verifier'];
		$profile = \ANDS\Authenticator\TwitterAuthenticator::getProfile($oauthToken, $oauthVerifier);

		$this->load->model('authenticator', 'auth');
		$this->auth->getUserByProfile($profile);
		$this->user->refreshAffiliations($this->user->localIdentifier());
	}

	/**
	 * Callback to /registry/auth/rapidconnect
	 * AAF RapidConnect
	 *
	 * @throws Exception
	 */
	public function rapidconnect()
	{
		$jwt = $_POST['assertion'];
		$profile = \ANDS\Authenticator\AAFRapidConnectAuthenticator::getProfile($jwt);
		// We use some fuzzy matching to find an existing user.
		// See the legacy aaf_rapid_authenticator.php for the ideas.
		// NB: for now, add matching by email and display name.
		$found_user = FALSE;

		// We need the database.
		$this->cosi_db = $this->load->database('roles', TRUE);

		$serviceID = $profile['authentication_service_id'];
		/* In fact, we know $serviceID == gCOSI_AUTH_METHOD_SHIBBOLETH. */

		try {
			// Do a straight match against role_id.
			// (Tip: For Rapid Connect users, this is the SHA1 of
			// the edupersontargetedid.)
			$user = $this->cosi_db->get_where('roles',[
				'enabled' => DB_TRUE,
				'role_id' => $profile['identifier'],
				'authentication_service_id' => $serviceID
			]);
			if ($user->num_rows() > 0) {
				$found_user = TRUE;
				// The $profile is OK as it is.
				// error_log('rapidconnect: found user in the db as is');
			}
			if (!$found_user) {
				// Try to match by email.
				$result = $this->cosi_db->get_where('roles',
					array('enabled' => DB_TRUE,
						  'authentication_service_id'=>
						  gCOSI_AUTH_METHOD_SHIBBOLETH,
						  'email' => $profile['email']));
				if ($result->num_rows() > 0) {
					$found_user = TRUE;
					$matchedProfile = $result->first_row();
					// Rewrite our $profile.
					$profile['identifier'] = $matchedProfile->role_id;
					// error_log('rapidconnect: found user in the db by email');
				}
			}
			if (!$found_user) {
				// Try to match by displayName.
				$result = $this->cosi_db->get_where('roles',
					array('enabled' => DB_TRUE,
						  'authentication_service_id'=>
						  gCOSI_AUTH_METHOD_SHIBBOLETH,
						  'name' => $profile['displayName']));
				if ($result->num_rows() > 0) {
					$found_user = TRUE;
					$matchedProfile = $result->first_row();
					// Rewrite our $profile.
					$profile['identifier'] = $matchedProfile->role_id;
					// error_log('rapidconnect: found user in the db by display_name');
				}
			}
		} catch (Exception $e) {
			error_log('auth.php/rapidconnect exception: ' .
					  var_export($e, TRUE));
		}

		/* At this point, either $found_user == TRUE, and
		   $profile['identifier'] is an existing role_id,
		   or $found_user == FALSE, and the following call
		   to $this->auth->getUserByProfile($profile)
		   will create a new user.
		*/

		$this->load->model('authenticator', 'auth');
		$this->auth->getUserByProfile($profile);
		$this->user->refreshAffiliations($this->user->localIdentifier());
	}

	/**
	 * Callback to /registry/auth/facebook
	 * oauth2
	 *
	 * @throws \Facebook\Exceptions\FacebookSDKException
	 */
	public function facebook()
	{
		/**
		 * starting the session to prevent csrf failing
		 * @url https://stackoverflow.com/questions/32029116/facebook-sdk-returned-an-error-cross-site-request-forgery-validation-failed-th
		 */
		if (!session_id()) {
			session_start();
		}

		$profile = \ANDS\Authenticator\FacebookAuthenticator::getProfile();

		$this->load->model('authenticator', 'auth');
		$this->auth->getUserByProfile($profile);
		$this->user->refreshAffiliations($this->user->localIdentifier());
	}

	/**
	 * Callback to /registry/auth/facebook
	 * oauth2
	 *
	 * @throws Exception
	 */
	public function google()
	{
		$profile = \ANDS\Authenticator\GoogleAuthenticator::getProfile($_GET['code']);

		$this->load->model('authenticator', 'auth');
		$this->auth->getUserByProfile($profile);
		$this->user->refreshAffiliations($this->user->localIdentifier());
	}

	/**
	 * registry/oauth/auth
	 * Legacy OAUTH endpoint, uses hybridauth library
	 * DEPRECATED
	 * TODO Remove
	 */
        /* CC-2968 As noted in the previous comment, we don't use it.
           Comment it out for now.
	public function oauth(){
		if ($_SERVER['REQUEST_METHOD'] === 'GET'){
			$_GET = $_REQUEST;
		}
		require_once FCPATH.'/assets/lib/hybridauth/index.php';
	}
        */

      /* SD-2351912 RVADEV-16 The legacy (RDA-like) logout() method was
         here. It was copied to the vocabs controller by commit
         dc484cb5 (CC-2627 RVA-40) and modified. The version here was
         subject to an XSS injection. Since we don't need this
         method, it has now been deleted. See the vocabs controller's
         logout() function instead.  */

	public function registerAffiliation($new = false){
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: application/json');

		$orgRole = $this->input->post('orgRole');
		$thisRole = $this->input->post('thisRole');
		$jsonData = array();
		$this->load->model($this->config->item('authentication_class'), 'auth');

		if($new){
			$this->auth->createOrganisationalRole($orgRole, $thisRole);
		}

		if(in_array($orgRole, $this->user->affiliations())){
			$jsonData['status']='WARNING';
			$jsonData['message']='You are already affiliate with this organisation: '.$orgRole;
		}else{
			if($this->auth->registerAffiliation($thisRole, $orgRole)){
				$this->user->refreshAffiliations($thisRole);
				$jsonData['status']='OK';
				$jsonData['message']='registering success';
			}else{
				$jsonData['status']='ERROR';
				$jsonData['message']='problem encountered while registering affiliation';
			}
		}

		//$jsonData['message'].=$thisRole. ' affiliates with '.$orgRole;
		echo json_encode($jsonData);

		//sending email
		$this->load->library('email');
		$this->email->from($this->config->item('vocab_admin_email'), 'ANDS Vocabulary Notification');
		$this->email->to($this->config->item('vocab_admin_email'));
		$this->email->subject('New user affiliation registered');
		$message = 'Registering user '.$thisRole. ' to affiliate with '.$orgRole;
		if($new) $message.='. User created '.$orgRole;
		$this->email->message($message);
		$this->email->send();
	}

	public function dashboard()
	{
		$data['title'] = 'ANDS Online Services Home';
		$data['js_lib'] = array('core');
		$data['scripts'] = array();
		$data['available_organisations'] = array();
		$data['group_vocabs'] = array();
		if($this->user->loggedIn())
		{
			if(sizeof($this->user->affiliations())>0){
				$data['hasAffiliation']=true;
			}else $data['hasAffiliation']=false;

			if (mod_enabled('vocab_service'))
			{
				$this->load->model('apps/vocab_service/vocab_services','vocab');
				$data['group_vocabs']=$this->vocab->getGroupVocabs();
				//$data['owned_vocabs']=$this->vocab->getOwnedVocabs(false);
				$this->load->model($this->config->item('authentication_class'), 'auth');
				$data['available_organisations'] = $this->auth->getAllOrganisationalRoles();
				asort($data['available_organisations']);
			}

			if (mod_enabled('registry'))
			{
				$db = $this->load->database( 'registry', TRUE );
				$this->db = $db;

				$this->load->model('data_source/data_sources','ds');
				$data['data_sources']=$this->ds->getOwnedDataSources(false, true);
			}

			$this->load->view('dashboard', $data);
		}
		else
		{
			redirect('auth/login');
		}
	}

	public function getRecentlyUpdatedRecords()
	{
		$db = $this->load->database( 'registry', TRUE );
		$this->db = $db;

		$this->load->model('data_source/data_sources','ds');
		$data['data_sources']=$this->ds->getOwnedDataSources();

		$ds_ids = array(); foreach($data['data_sources'] AS $ds) { $ds_ids[] = $ds->id; }

		$data['recent_records'] = array();
		if ($ds_ids)
			{
			// Get recently updated records
			$query = $db->select('ro.registry_object_id, ro.status, ro.title, ra.value AS updated')
				->from('registry_object_attributes ra')
				->join('registry_objects ro',
					'ro.registry_object_id = ra.registry_object_id')
				->where('ra.attribute','updated')
				->where('ra.value >=', time() - (ONE_WEEK))
				->where_in('ro.data_source_id', $ds_ids)
				->limit(6)->order_by('value','desc');
			$query = $query->get();

			if($query->num_rows() > 0)
			{
				foreach($query->result() AS $row)
				{
					$data['recent_records'][] = $row;
				}
			}
		}
		$this->load->view('dashboard_records', $data);
	}

	public function printData($title, $internal_array)
	{
		if( $internal_array )
		{
			print '<b>'.$title."</b><br />\n";
			foreach($internal_array as $key => $value)
			{
				print("$key=");
				if( is_array($value) )
				{
					foreach( $value as $subvalue )
					{
						print("$subvalue, ");
					}
				}
				else
				{
					print($value);
				}
				print "<br />\n";
			}
		}
	}

	/* Interface for COSI built-in users to change their password from the default */
	public function change_password()
	{
		$data['title'] = 'Change Built-in Password';
		$data['js_lib'] = array('core');
		$data['scripts'] = array();

		if (!$this->user->loggedIn() || !$this->user->authMethod() == gCOSI_AUTH_METHOD_BUILT_IN)
		{
			throw new Exception("Unable to change password unless you are logged in as a built-in COSI user!");
		}

		// if ($this->config->item('authentication_class') != 'cosi_authentication')
		// {
		// 	throw new Exception("Unable to change password unless the authentication framework is COSI!");
		// }

		if ($this->input->post('password'))
		{
			if ($this->input->post('password') != $this->input->post('password_confirm'))
			{
				$data['error'] = "Both passwords must match! Please try again...";
			}
			elseif (strlen($this->input->post('password')) < 6)
			{
				$data['error'] = "Password must be 6 characters or longer! Please try again...";
			}
			else
			{
				$this->load->model($this->config->item('authentication_class'), 'role');
				$this->role->updatePassword($this->user->localIdentifier(), $this->input->post('password'));
				$this->session->set_flashdata('message', 'Your password has been updated. This will be effective from your next login.');
				redirect('/');
			}
		}

		$this->load->view('change_password_form', $data);

	}

}
