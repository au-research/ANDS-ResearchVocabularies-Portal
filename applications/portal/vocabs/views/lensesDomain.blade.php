@extends('layout/vocab_layout')

@section('comment')
@stop

@section('script')

@stop

@section('content')
  <article>
    <!-- <section class="section element-short-bottom element-short-top"> -->
    <section class="section element-short-top element-short-bottom swatch-white">
      <div class="container">
        <div class="row">
          <!-- <div id="domain_content" class="col-md-12"> -->
          <div id="domain_content"
               class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-md-offset-1 col-lg-offset-1 animated fadeInUp">
            {{ $domain_content }}
          </div>
        </div>

      </div>
    </section>
  </article>
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
