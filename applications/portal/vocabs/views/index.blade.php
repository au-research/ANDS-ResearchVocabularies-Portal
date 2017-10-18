@extends('layout/vocab_layout')
@section('script')
  var vocab_resolving_services =
  {{json_encode(get_config_item('vocab_resolving_services'))}};
  var subject_vocab_proxy =
  {{json_encode(get_config_item('subject_vocab_proxy'))}};
  var registry_api_url =
  {{json_encode(get_config_item('vocab_config')['registry_api_url'])}};
@stop
@section('content')
<article>
	@include('includes/search-view')
</article>
@stop