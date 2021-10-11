<script>
    var base_url = "{{base_url()}}";
    var registry_url = "{{registry_url()}}";
    var registry_api_url = {{json_encode(get_config_item('vocab_config')['registry_api_url'])}};
    var recaptcha_site_key = "{{get_config_item('reCAPTCHA')['site_key']}}";
@yield('script')
</script>

@if(get_config_item('tracking'))
    <?php $tracking = get_config_item('tracking'); ?>
    @if($tracking['googleGA']['enabled'])
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $tracking['googleGA']['keys']['id'] }}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '{{ $tracking['googleGA']['keys']['id'] }}', {
            cookie_domain: '{{ $tracking['googleGA']['keys']['cookie_domain'] }}',
            cookie_flags: 'SameSite=None;Secure',
          });
        </script>
    @endif
    @if($tracking['luckyOrange']['enabled'])
        <script type='text/javascript'>
        window.__wtw_lucky_site_id = {{ $tracking['luckyOrange']['keys']['id'] }};

        (function() {
            var wa = document.createElement('script'); wa.type = 'text/javascript'; wa.async = true;
            wa.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://cdn') + '.luckyorange.com/w.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(wa, s);
          })();
        </script>
    @endif
@endif

<!-- fancytree requires JQuery, so include here. -->
<script src='//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.js'></script>

<!-- JQuery UI used for draggable modal dialogs on CMS, and on
     ARDC-branded login page. Must be included before Bootstrap;
see https://stackoverflow.com/questions/30190437/uncaught-error-cannot-call-methods-on-button-prior-to-initialization-attempted
-->
<script src='//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'></script>
<!-- But including JQuery UI at this point doesn't seem to work;
     the methods get "lost" (due to overwriting by AngularJS?).
     Keep a copy of the original $, so we can use it later in
     the modal dialogs.
-->
<script>
     var jQueryWithUI = $;
</script>

@if(is_dev())
    <script src="{{ asset_url('js/ie-polyfill.js') }} "></script>
    <script src="{{ asset_url('js/lib/angular/angular.min.js') }} "></script>
    <script src="{{ asset_url('js/lib/angular-route/angular-route.min.js') }}"></script>
    <script src="{{ asset_url('js/lib/angular-sanitize/angular-sanitize.min.js') }}"></script>
    <script src="{{ asset_url('js/lib/angular-animate/angular-animate.min.js') }}"></script>
    <script src="{{ asset_url('js/lib/angular-ui-utils/ui-utils.min.js' )}}"></script>
    <script src="{{ asset_url('js/lib/angular-bootstrap/ui-bootstrap.min.js') }}"></script>
    <script src="{{ asset_url('js/lib/angular-bootstrap/ui-bootstrap-tpls.min.js' )}}"></script>
    <script src="{{ asset_url('js/lib/angular-loading-bar/build/loading-bar.min.js')}}"></script>
    <script type="text/javascript" src="{{ asset_url('js/lib/ng-file-upload/ng-file-upload-all.min.js') }}"></script>
    <script src="{{ asset_url('ands-green/js/packages.min.js','templates') }}"></script>
    <script src="{{ asset_url('js/lib/angular-recaptcha/release/angular-recaptcha.min.js') }} "></script>
    <!-- fancytree must be loaded after JQuery. -->
    <script type="text/javascript" src="{{ asset_url('js/lib/fancytree/dist/jquery.fancytree-all-deps.js') }} "></script>
    <script type="text/javascript" src="{{ asset_url('js/lib/fancytree/dist/modules/jquery.fancytree.clones.js') }} "></script>
@else
    <script src="{{ asset_url('js/lib.js').'?'.getReleaseVersion() }}"></script>
@endif

<script src="{{asset_url('lib/qtip2/jquery.qtip.js', 'core').'?'.getReleaseVersion() }}"></script>
<script type="text/javascript" src="{{ base_url() }}apps/assets/vocab_widget/js/vocab_widget_v2.js?{{ getReleaseVersion() }}"></script>

<!-- TinyMCE wants to load other things, so let it. -->
<script src="{{ asset_url('js/lib/tinymce/tinymce.min.js').'?'.getReleaseVersion() }}"></script>
<script src="{{ asset_url('js/lib/angular-ui-tinymce/dist/tinymce.min.js').'?'.getReleaseVersion() }}"></script>

@if(is_dev())
    <!-- ui-select must be loaded after JQuery. -->
    <script type="text/javascript" src="{{ asset_url('js/lib/ui-select/dist/select.js') }}"></script>
    <script type="text/javascript" src="{{ asset_url('js/vocabs_app.js') }}"></script>
    <script type="text/javascript" src="{{ asset_url('js/filters.js') }}"></script>
    <script type="text/javascript" src="{{ asset_url('js/directives.js') }}"></script>
    <script type="text/javascript" src="{{ asset_url('js/vocabs_factory.js') }}"></script>
    <script type="text/javascript" src="{{ asset_url('js/vocabs_search_controller.js') }}"></script>
@else
    <script type="text/javascript" src="{{ asset_url('js/scripts.js').'?'.getReleaseVersion() }}"></script>
@endif

<script type="text/javascript" src="{{ asset_url('js/vocabs-registry-client-bundle.js').'?'.getReleaseVersion() }}"></script>


@if(isset($scripts))
    @foreach($scripts as $script)
        <script src="{{asset_url('js/'.$script.'.js').'?'.getReleaseVersion()}}"></script>
    @endforeach
@endif
<!--<script type="text/javascript" src="https://jira.ands.org.au/s/d41d8cd98f00b204e9800998ecf8427e/en_AUc8oc9c-1988229788/6265/77/1.4.7/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?collectorId=d9610dcf"></script>
-->
<script type="text/javascript" src="https://jira.ands.org.au/s/7539600e7269f53cb15d4d97de6e8a32-T/en_US-bq4gqu/64021/60/1.4.25/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=0d307b22"></script>
@if(is_dev())
    <!-- LESS.JS for development only-->
    <script>
      less = {
        env: "development",
        async: false,
        fileAsync: false,
        poll: 1000,
        logLevel:0
      };
    </script>
    <script src="{{ asset_url('js/lib/less.js/dist/less.min.js') }}"></script>
@endif
