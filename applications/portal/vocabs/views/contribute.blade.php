@extends('layout/vocab_layout')
@section('content')
<article>
    <section class="section swatch-white element-short-bottom">
        <div class="container element-short-bottom">
            <div class="row">
                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <header class="text-center element-short-top element-no-bottom not-condensed os-animation animated fadeInUp" data-os-animation="fadeInUp" data-os-animation-delay="0s" style="-webkit-animation: 0s;">
                       <h2 class="bordered bordered-normal os-animation animated fadeIn" data-os-animation="fadeIn" data-os-animation-delay="0s" style="-webkit-animation: 0s;"> Publish a vocabulary </h2>
                   </header>
                </div>
            </div>
            <div class="row animated fadeInUp">
                <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-md-offset-3 text-center">
                    <img src="{{asset_url('images/RVA_Publish_Vocabulary.png', 'core')}}" class="element element-short-bottom element-short-top"/>
                    <h4>A service built to support vocabulary development</h4>
                    <p>
                        The Australian Research Data Commons (ARDC) offers several options for our partners to publish vocabularies in Research Vocabularies Australia.
                    </p>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row">
                <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    <h5 class="normal bordered">Create or manage a vocabulary</h5>
                    <p>  The Research Vocabularies Australia editor allows for the creation and management of vocabularies and the concepts they contain. The RVA editor allows you and your colleagues to collaboratively manage your vocabulary, with optional workflow management. Vocabularies may be uploaded or created from scratch within the editor. Additional features of the RVA editor include:
                    </p>
                    <ul>
                        <li>Capture information about your vocabulary and the concepts it contains</li>
                        <li>Browse through the concepts in your vocabulary via the built-in visualisation tool </li>
                        <li>Link concepts in your vocabulary to concepts in other vocabularies</li>
                        <li>Query your vocabulary via the built-in SPARQL endpoint</li>
                     </ul>
                   <p>
                    Contact <a href="mailto:services@ardc.edu.au">services@ardc.edu.au</a> to register for the RVA editor.
                   </p>
                    <p>
                    Learn more about the <a href="https://documentation.ardc.edu.au/rva/what-is-rva-editor-poolparty" target="_blank">RVA editor</a>.
                    </p>
                </div>
                <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    <h5 class="normal bordered">Publish and describe a vocabulary</h5>
                    <p>
                        Using the Research Vocabularies Australia portal you can upload and describe your vocabulary. Vocabulary files may be uploaded in a variety of formats. Additional publishing features of the RVA portal include:</p>
                    <ul>
                        <li>Upload vocabulary files in a variety of formats</li>
                        <li>Describe versions of your vocabulary, their statuses, and changes made between versions</li>
                        <li>Provide contact, access and licencing information about your vocabulary</li>
                        <li>Describe your vocabulary by subject and language</li>
                        <li>Describe individuals who have contributed to the vocabulary’s creation or management</li>
                        <li>Use the PoolParty Integration tool to quickly publish vocabularies managed in the RVA editor</li>
                    </ul>
                    <p>
                        Contact <a href="mailto:services@ardc.edu.au">services@ardc.edu.au</a> to register for the RVA portal.
                    </p>
                    <p>
                        Learn more about the <a href="https://documentation.ardc.edu.au/rva/what-is-the-research-vocabularies-australia-portal" target="_blank">RVA portal</a>.
                    </p>
                </div>
                <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    <h5 class="normal bordered">Store a vocabulary</h5>
                    <p>The Research Vocabularies Australia includes a repository in which vocabulary files and the information about those vocabularies may be stored. The RVA repository allows for the flow of information between the editor and the portal.</p>

                    <p>  Contact <a href="mailto:services@ardc.edu.au">services@ardc.edu.au</a>  to register for the RVA repository.</p>
                </div>
            </div>
        </div>
    </section>
</article>
@stop
