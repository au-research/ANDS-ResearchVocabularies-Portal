<!DOCTYPE html>
<html lang="en">
@include('includes/header')
<body ng-app="app" ng-controller="searchCtrl">
@include('includes/top-menu')
<?php

use ANDS\VocabsRegistry\Model\Vocabulary;
use ANDS\VocabsRegistry\Model\RelatedEntity;
use ANDS\VocabsRegistry\Model\RelatedEntityRef;

$publisher = array();

foreach($vocab->getRelatedEntityRef() as $relatedRef) {
    $related = $relatedRef->getRelatedEntity();
    if ($related->getType() === RelatedEntity::TYPE_PARTY) {
        foreach ($relatedRef->getRelation() as $relationship) {
            if ($relationship === RelatedEntityRef::RELATION_PUBLISHED_BY) {
                $publisher[]=$relatedRef;
            }
        }
    }
}


// Construct the URLs for social sharing.
// The URL we share is of the slug-variety, irrespective
// of how we got here.
$url = base_url().'viewBySlug/'.$vocab->getSlug();
$share_controller = base_url().'vocabs/share/';
// Values to go into share URLs.
$share_id = $vocab->getId();
$share_title = $vocab->getTitle();
$share_owner = $vocab->getOwner();
$share_slug = $vocab->getSlug();
$share_params = [
    'url' => $url,
    'page' => 'view',
    'id' => $share_id,
    'title' => $share_title,
    'owner' => $share_owner,
    'slug' => $share_slug
];
$share_query_params = http_build_query($share_params);

?>
<div id="content">
    <article>
        <section class="section swatch-gray" style="z-index:1">
            <div class="container">
                <div class="row element-short-top">
                    <div class="col-md-9 view-content" style="padding-right:0">

                        <div class="panel panel-primary swatch-white panel-content">
                            <div class="panel-body">
                                @if($vocab->getStatus() === Vocabulary::STATUS_DEPRECATED)
                                <span class="label label-default pull-right" style="margin-left:5px">{{ htmlspecialchars($vocab->getStatus()) }}</span>
                                @endif
                                <div class="pull-right">
                                    <div id="widget-link">
                                        <a href="" tip="&lt;b>Widgetable&lt;/b>&lt;br/>This vocabulary can be readily used for resource description or discovery in your system using our vocabulary widget.&lt;br/>&lt;a id='widget-link2' target='_blank' href='{{portal_url('vocabs/page/widget_explorer')}}'>Learn more&lt;/a>">
                                            <span class="label label-default pull-right btn-widget-link"><img class="widget-icon" height="16" width="16" src="{{asset_url('images/cogwheels_white.png', 'core')}}"/> widgetable</span>
                                        </a>
                                        <br />
                                    </div>
                                    <div ng-controller="subscribeDialogCtrl">
                                        <a id="subscribe-link" href="" ng-click="openDialog()">
                                            <!-- b tag for icon instead of usual i, to avoid ".swatch-white i" CSS overriding the colour of the icon. -->
                                            <span class="label label-default pull-right btn-subscribe-link"><b class="fa fa-envelope" height="16" width="16"></b> &nbsp; subscribe</span>
                                        </a>
                                    </div>
                                </div>
                                <h4 class="bordered-normal break" style="line-height:1.1em"><span itemprop="name" ng-non-bindable>{{ htmlspecialchars($vocab->getTitle()) }} </span></h4>
                                @if (!empty($vocab->getAcronym()))
                                <small class="break">Acronym: {{ htmlspecialchars($vocab->getAcronym()) }}</small><br>
                                @endif
                                @if(isset($publisher))
                                @foreach($publisher as $apub)
                                <small>Publisher </small> <a class="re_preview" related='{{$apub}}' sub_type="publisher"
                                    >{{htmlspecialchars($apub->getRelatedEntity()->getTitle())}}</a>
                                @endforeach
                                @endif
                                <div class="pull-right">
                                    {{ !empty($vocab->getCreationDate()) ? "Created: ".display_release_date($vocab->getCreationDate()) : ''}}
                                    <a style="margin-left:4px" href="{{$share_controller . 'facebook?' . $share_query_params}}"><i class="fa fa-facebook" style="padding-right:4px"></i></a>
                                    <a style="text-decoration:none; margin-right:4px" href="{{$share_controller . 'twitter?' . $share_query_params}}"><span style="font-size: 16px; color: #4c4c4c;"><b>&#x1D54F;</b></span></a>
                                </div>
                            </div>
                        </div>
                        @yield('content')
                    </div>

                    <div class="col-md-3">
                        @yield('sidebar')
                    </div>
                </div>
            </div>
        </section>
    </article>

</div>
@include('includes/footer', [ 'share_controller' => $share_controller, 'share_query_params' => $share_query_params ])
</body>
</html>
