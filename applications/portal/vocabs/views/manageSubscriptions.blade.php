@extends('layout/vocab_layout')

@section('comment')
  Don't really need htmlspecialchars($token), because CodeIgniter
  already rejects an incoming URL that contains characters we don't
  like (including apostrophes).
@stop

@section('script')
  var token = '{{htmlspecialchars($token, ENT_QUOTES | ENT_HTML401)}}';
@stop

@section('content')
  <!-- <section class="section element-short-bottom element-short-top"> -->
  <section class="section element-short-top element-short-bottom swatch-white">
    <div class="container">
      <header class="text-center">
        <h1 class="hairline bigger">Manage Subscriptions</h1>
      </header>

      <div class="row">
        <div class="col-md-2"></div>
        <div ng-controller="manageSubscriptions" class="ng-cloak col-md-8">
          <div ng-if="authenticationError">
            <p>Error: [[errorMessage]]</p>
          </div>

          <div ng-if="authenticationOK">

            <form ng-if="hasAnySubscription">

              <table style="width:100%">
                <tr ng-if-start="vocabularySubscriptions.length &gt; 0">
                  <td colspan="2" class="h3 padding-top"
                      >Vocabularies you are subscribed to</td>
                </tr>
                <tr ng-if="vocabularySubscriptions.length > 1">
                  <td class="text-right"
                      style="width:15%; padding-top: 10px">Select All &nbsp;
                    <input type="checkbox" ng-model="form.vocabulariesSelectAll"
                           id="toggleSelectAllVocabularies"
                           ng-click="toggleSelectAllVocabularies()" /></td>
                    <td></td>
                </tr>

                <tr ng-if-end=""
                    ng-repeat="subscription in vocabularySubscriptions">
                  <td class="text-right" style="vertical-align:text-top">
                    <input type="checkbox" id="v_[[subscription.id]]"
                           ng-model="subscription.checked" /></td>
                    <td class="padding-left">
                      <a ng-if="!subscription.deleted"
                         href="{{base_url()}}viewById/[[subscription.id]]"
                         target="_blank">[[subscription.title]]</a>
                      <span ng-if="subscription.deleted">
                        [[subscription.title]] <i>(This vocabulary has been deleted.)</i></span>
                    </td>
                </tr>

                <tr ng-if-start="hasOwnerAllSubscription
                                 || ownerSubscriptions.length &gt; 0">
                  <td colspan="2" class="h3 padding-top"
                      style="padding-bottom: 10px">Publishers
                    you are subscribed to</td>
                </tr>
                <tr ng-if="(hasOwnerAllSubscription &&
                           ownerSubscriptions.length > 0) ||
                           ownerSubscriptions.length > 1">
                  <td class="text-right">Select All
                    &nbsp;
                    <input type="checkbox" ng-model="form.ownersSelectAll"
                           id="toggleSelectAllOwners"
                           ng-click="toggleSelectAllOwners()" /></td>
                    <td></td>
                </tr>

                <tr ng-if="hasOwnerAllSubscription">
                  <td class="text-right">
                    <input type="checkbox" id="oall"
                           ng-model="form.ownerAllSubscriptionUnsubscribe"
                    /></td>
                    <td class="padding-left"><i>All Research Vocabularies
                      Australia Publishers</i></td>
                </tr>
                <tr ng-if-end=""
                    ng-repeat="subscription in ownerSubscriptions">
                  <td class="text-right" style="vertical-align:text-top">
                    <input type="checkbox" id="o_[[subscription.id]]"
                           ng-model="subscription.checked" /></td>
                    <td class="padding-left">[[subscription.title]]</td>
                </tr>

                <tr ng-if-start="hasSystemSubscription">
                  <td colspan="2" class="h3 padding-top">Service notifications</td>
                </tr>
                <tr ng-if-end="">
                  <td class="text-right" style="padding-top: 10px">
                    <input type="checkbox" id="system"
                           ng-model="form.systemSubscriptionUnsubscribe" /></td>
                    <td class="padding-left" style="padding-top: 10px">Research
                      Vocabularies Australia service updates and new
                      features</td>
                </tr>

                <tr>
                  <td></td>
                  <td class="text-right padding-top">
                    <input type="button" value="Unsubscribe"
                           id="unsubscribe"
                           class="btn btn-large btn-primary"
                           ng-disabled="!anyChecked() || loading"
                           ng-click="unsubscribe()"></td>
                </tr>
              </table>
            </form>
            <p ng-if="!hasAnySubscription">
              You have no subscriptions.
            </p>

          </div>
        </div>
        <div class="col-md-2"></div>
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
