@extends('layout/vocab_layout')
@section('content')
<article>

    <section class="section swatch-white element-short-bottom">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <header class="text-center element-normal-top element-no-bottom not-condensed os-animation animated fadeInUp" data-os-animation="fadeInUp" data-os-animation-delay="0s" style="-webkit-animation: 0s;">
                        <h2 class="bordered bordered-normal os-animation animated fadeIn" data-os-animation="fadeIn" data-os-animation-delay="0s" style="-webkit-animation: 0s;"> Redirection notice </h2>
                    </header>
                </div>
            </div>
            <div class="row">
                <div class="col-md-8 col-md-offset-2">
                    <p>The URLs of vocabulary view pages on {{$title}} have changed.</p>
                    <p>You can access the view page for this vocabulary using either of these URLs:</p>
                    <ul>
                        <li>ID-based: <a href="{{base_url().'viewById/'.$id}}">{{base_url().'viewById/'.$id}}</a></li>
                        <li>Slug-based: <a href="{{base_url().'viewBySlug/'.$slug}}">{{base_url().'viewBySlug/'.$slug}}</a></li>
                    </ul>
                    <p>Please update your bookmarks.</p>
                    <p>You will be redirected in ten seconds.</p>
                </div>
            </div>
        </div>
    </section>

</article>
@stop

