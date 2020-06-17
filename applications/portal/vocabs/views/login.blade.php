@extends('layout/vocab_layout')
@section('styles')
  <style type="text/css">
   [ng:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak {
       display: none !important;
   }
  </style>
@stop
@section('content')
  <article>
    <section class="section swatch-gray element-short-bottom">

      <div class="container element-short-top element-short-bottom"
           ng-controller="loginCtrl" id="main">
        <div ng-view></div>

        <input type="hidden" value="{{ $default_authenticator }}" id="default_authenticator">
        <div class="row">
          <div class="login col-xs-6 col-sm-6 col-md-6 col-lg-6
                      col-md-offset-3 col-lg-offset-3">
	    <h4 class="element-short-bottom">Login</h4>
	    <div class="alert" ng-show="error=='login_required'">You have to be
              logged in to use this functionality</div>

            <uib-tabset active="tab">
	      @foreach($authenticators as $auth)
                <uib-tab index="'{{ $auth['slug'] }}'">
                  <uib-tab-heading>
                    {{ $auth['display'] }}
                  </uib-tab-heading>
	          <div class="tab-pane widget-content swatch-white"
                       ng-show="tab=='{{ $auth['slug'] }}'"
                       ng-cloak>
	            {{ $auth['view'] }}
	          </div>
                </uib-tab>
              @endforeach
            </uib-tabset>

	    <div class="alert alert-error" ng-show="message">[[ message ]]</div>
          </div>

        </div>
      </div>

    </section>
  </article>


@stop
