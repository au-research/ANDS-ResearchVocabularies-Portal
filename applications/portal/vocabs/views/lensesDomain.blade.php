@extends('layout/vocab_layout')

@section('comment')
@stop

@section('script')

@stop

@section('content')
  <!-- <section class="section element-short-bottom element-short-top"> -->
  <section class="section element-short-top element-short-bottom swatch-white">
    <div class="container">
<!--       <header class="text-center">
        <h3>Domain: {{ $domain }}</h3>
      </header>
-->
      <div class="row">
        <div id="domain_content" class="col-md-12">
          {{ $domain_content }}


        </div>
      </div>

    </div>
  </section>
@endsection
@stop
@section('emacs_local_variables')
<!--
Local Variables:
mode: web
web-mode-code-indent-offset: 2
web-mode-markup-indent-offset: 2
End:
-->
@stop
