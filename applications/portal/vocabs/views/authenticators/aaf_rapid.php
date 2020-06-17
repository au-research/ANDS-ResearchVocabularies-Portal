<p style="text-align:center">
  <small>Log into My Vocabs using your AAF credentials: </small>
  <img src="<?php echo asset_url('img/aaf_logo.gif', 'base');?>"
       alt="AAF Logo" style="display:block;margin:10px auto">
  <a role="button"
     href="<?php echo \ANDS\Authenticator\AAFRapidConnectAuthenticator::getAuthURL()?>"
     class="btn btn-primary btn-block">
    Login using Australian Access Federation (AAF) credentials
  </a>
</p>
