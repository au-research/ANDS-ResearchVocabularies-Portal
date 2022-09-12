@extends('layout/vocab_layout')
@section('title')
  About ARDC Vocabulary Services
@stop
@section('content')
  <article>
    <section class="section swatch-white element-short-bottom">
      <div class="container">
	<div class="row">
	  <div class="col-md-12">
	    <header class="text-center element-short-top element-no-bottom not-condensed os-animation animated fadeInUp" data-os-animation="fadeInUp" data-os-animation-delay="0s" style="-webkit-animation: 0s;">
              <h2 class="bordered bordered-normal os-animation animated fadeIn" data-os-animation="fadeIn" data-os-animation-delay="0s" style="-webkit-animation: 0s;"> About </h2>
            </header>
	  </div>
	</div>
	<div class="row">
	  <div class="col-xs-8 col-sm-8 col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2 animated fadeInUp">
	    <h4>A service built on sharing</h4>
	    <p>
	      Research Vocabularies Australia helps you find, access, and reuse vocabularies for research.
              Some vocabularies are hosted by the Australian Research Data Commons (ARDC) and can be accessed directly through Research Vocabularies Australia.
              Otherwise Research Vocabularies Australia provides a link to the vocabulary owner’s web page.
	    </p>
            <p>Research Vocabularies Australia also allows you to <a href="{{ portal_url('vocabs/page/contribute') }}">create and/or publish a vocabulary </a>
              as well as <a href="{{ portal_url('vocabs/page/use') }}">integrate an existing vocabulary into your own system</a>.
          </div>
	  <div class="col-xs-8 col-sm-8 col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2 animated fadeInUp">
	    <h4>Vocabularies for the research community</h4>
	    <p>
	      Research Vocabularies Australia caters for researchers and those who support, describe and discover research, including vocabulary managers, ontologists, data managers and librarians.
	    </p>
	    <p>
	      Through engagement with the research community, Research Vocabularies Australia will grow to cover a broad spectrum of research fields - across sciences, social sciences, arts and humanities. Many of the vocabularies you can discover here are immediately accessible, either directly through Research Vocabularies Australia or via partners and publishers, and are free to use (subject to licence conditions).
	    </p>
	    <p>
              For more background information on this service see <a href="https://ardc.edu.au/services/research-vocabularies-australia/"  target="_blank">https://ardc.edu.au/services/research-vocabularies-australia/</a>.
            </p>
	  </div>
          <div class="col-xs-8 col-sm-8 col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2 animated fadeInUp">
            <h4>Brought to you by ARDC</h4>

            <p> Research Vocabularies Australia is part of the national research infrastructure operated by the Australian Research Data Commons (<a href="https://ardc.edu.au/" target="_blank">ARDC</a>) to enable "more valuable data for Australian research".
              ARDC is supported by the Australian Government through the National Collaborative Research Infrastructure Strategy
              (<a href="https://www.education.gov.au/ncris"  target="_blank">NCRIS</a>).</p>
          </div>
	</div>
    </section>
  </article>
@stop
