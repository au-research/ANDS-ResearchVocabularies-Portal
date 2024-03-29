<head>
	<meta charset="utf-8">

	<title>{{ isset($title) ? $title : 'ARDC Research Vocabularies Australia' }}</title>

	<link rel="icon" href="{{asset_url('images/favicon-32x32.png', 'core')}}" sizes="32x32">

	<meta content="width=device-width, initial-scale=1.0" name="viewport">
	<meta content="yes" name="apple-mobile-web-app-capable">
	@if(get_config_item('environment_name'))
	<meta property="og:site_name" content="{{ get_config_item('environment_name') }}" />
	@else
	<meta property="og:site_name" content="Research Vocabularies Australia" />
	@endif
	<meta property="og:type" content="article" />
	{{-- Specific handling for og:description --}}
	@if(isset($this->_sections['og-description']))
	   @yield('og-description')
	@else
		<meta ng-non-bindable property="og:description" content="Find, access, and re-use vocabularies for research" />
	@endif
	{{-- Add Additional Facebook metadata, if any. --}}
	@yield('og-other-meta')
	{{-- Vocabulary metadata for our own use. Currently used for subscriptions. --}}
	@yield('vocab-meta')
	{{-- If more metadata needed, insert more yields here. --}}
	@include('includes/styles')
	<script type="text/javascript">
		//Fix Facebook return URL
		if (window.location.hash && window.location.hash == '#_=_') {
			if (window.history && history.pushState) {
				window.history.pushState("", document.title, window.location.pathname);
			} else {
				// Prevent scrolling by storing the page's current scroll offset
				var scrollTarget = {
					top: document.body.scrollTop,
					left: document.body.scrollLeft
				};
				window.location.hash = '';
				// Restore the scroll offset, should be flicker free
				document.body.scrollTop = scrollTarget.top;
				document.body.scrollLeft = scrollTarget.left;
			}
		}
	</script>
	@include('includes/scripts')
</head>

@if(ENVIRONMENT!='production')
	<!-- Environment Indicator -->
	<div class="environment" style="background:{{get_config_item('environment_colour')}};color:white;padding:5px 10px;">
		<h5>{{get_config_item('environment_name')}} - {{ENVIRONMENT}}</h5>
	</div>
@endif
@if(env('HEADER_BANNER','')!='')
	<!-- General-purpose header banner, e.g., for maintenance window. -->
	<div class="environment" style="background:{{env('HEADER_BANNER_COLOUR','#ff0000')}};color:white;padding:5px 10px;">
		<h5>{{env('HEADER_BANNER')}}</h5>
	</div>
@endif
