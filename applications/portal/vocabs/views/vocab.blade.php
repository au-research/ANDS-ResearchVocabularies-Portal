<?php

use ANDS\VocabsRegistry\Model\Version;
use ANDS\VocabsRegistry\Model\RelatedEntity;
use ANDS\VocabsRegistry\Model\RelatedEntityRef;

$cc=$vocab->getLicence();
$versions = $vocab->getVersion();
$current_version = null;
$superseded_version = null;
foreach ($versions as $version) {
    if ($version->getStatus() === Version::STATUS_CURRENT) {
        $current_version = $version;
        break;
    }
}
if(!isset($current_version)){
    // In fact, given that the status can only be either current
    // or superseded, the very first version _must_ be the one
    // we want. Leave the loop for now, "just in case" we ever introduce
    // a third version status which would be "less suitable"
    // than superseded. See the corresponding Registry implementation
    // in the EntityIndexer.addFieldsForMostSuitableVersion() method.
    foreach ($versions as $version) {
        if ($version->getStatus() === Version::STATUS_SUPERSEDED) {
            $superseded_version = $version;
            break;
        }
    }
}
$publisher = array();
$related_people = array();
$related_vocabs = array();
$related_service = array();
$related_internal_vocabs = array();

foreach ($vocab->getRelatedEntityRef() as $relatedRef) {
    $related = $relatedRef->getRelatedEntity();
    if ($related->getType() === RelatedEntity::TYPE_PARTY) {
        $relationships = implode($relatedRef->getRelation(), ',');
        if(strpos($relationships, RelatedEntityRef::RELATION_PUBLISHED_BY)
            !== false) {
                $publisher[]=$relatedRef;
                // And also add it to related people, if
                // it is not _just_ a publisher.
                if (count($relatedRef->getRelation()) > 1) {
                    $related_people[] =$relatedRef;
                }
            } else {
                $related_people[] =$relatedRef;
            }
    }
    elseif ($related->getType() === RelatedEntity::TYPE_SERVICE) {
        $related_service[]=$relatedRef;
    }
    elseif ($related->getType() === RelatedEntity::TYPE_VOCABULARY) {
        $related_vocabs[]=$relatedRef;
    }
}

foreach ($vocab->getRelatedVocabularyRef() as $relatedVocabRef) {
    $related_internal_vocabs[]=$relatedVocabRef;
}

// Determine whether or not to show the widgetableness.
// It is based on the presence of a SISSVoc endpoint in
// the "most suitable" version.
// Set $sissvocEndPoint if it is to be shown.
if (isset($current_version)) {
    foreach ($current_version->getAccessPoint() as $ap) {
        if (is_object($ap->getApSissvoc())) {
            $sissvocEndPoint = $ap->getApSissvoc()->getUrlPrefix();
            break;
        }
    }
} elseif (isset($superseded_version)) {
    foreach ($superseded_version->getAccessPoint() as $ap) {
        if (is_object($ap->getApSissvoc())) {
            $sissvocEndPoint = $ap->getApSissvoc()->getUrlPrefix();
            break;
        }
    }
}

// Determine the "ad" to show.
// Default to the generic ad.
$ad_image = 'GEN-330pxAdSpace.gif';
$ad_href = 'https://ardc.edu.au/researcher/?utm_source=RVA&utm_medium=referral-G&utm_id=TRDC&utm_term=generic&utm_content=rva-view';
$subjects = $vocab->getSubject();
foreach ($vocab->getSubject() as $subject) {
  if ($subject->getSource() != 'anzsrc-for') {
    continue;
  }
  $notation_first_two_digits = substr($subject->getNotation(), 0, 2);
  // We only show one ad, so first match wins.
  switch ($notation_first_two_digits) {
    case '04':
    case '05':
      $ad_image = 'Planet-330pxAdSpace.gif';
      $ad_href = 'https://ardc.edu.au/campaign/accelerate-your-earth-and-environmental-sciences-research/?utm_source=RVA&utm_medium=referral-EE&utm_id=TRDC&utm_term=planet&utm_content=rva-view';
      break 2;
    case '11':
      $ad_image = 'People-330pxAdSpace.gif';
      $ad_href = 'https://ardc.edu.au/campaign/accelerate-your-health-and-medical-research/?utm_source=RVA&utm_medium=referral-HM&utm_id=TRDC&utm_term=people&utm_content=rva-view';
      break 2;
    case '13':
    case '16':
    case '17':
    case '19':
    case '20':
    case '21':
    case '22':
      $ad_image = 'HASS-330pxAdSpace.gif';
      $ad_href = 'https://ardc.edu.au/campaign/accelerate-your-hass-and-indigenous-research/?utm_source=RVA&utm_medium=referral-HASS&utm_id=TRDC&utm_term=HASS&utm_content=rva-view';
      break 2;
    default:
      break;
  }
}

?>

@section('og-description')
    @if(is_object($vocab) && (!empty($vocab->getDescription())))
        <?php
        $clean_description = htmlspecialchars(substr(str_replace(
        array('"','[[',']]'), '', $vocab->getDescription()), 0, 200));
        ?>
    @endif
    @if(isset($clean_description))
        <meta ng-non-bindable property="og:description"
              content="{{ $clean_description }}" />
    @else
        <meta ng-non-bindable property="og:description"
              content="Find, access, and re-use vocabularies for research" />
    @endif
@stop
@section('og-other-meta')
    <meta property="og:url" content="{{ base_url().$vocab->getSlug() }}" />
    <meta property="og:title"
          content="{{ htmlspecialchars($vocab->getTitle()) }}" />
@stop
@section('vocab-meta')
    <meta property="vocab:id" content="{{ $vocab->getId() }}" />
    <meta property="vocab:status"
          content="{{ htmlspecialchars($vocab->getStatus()) }}" />
    <meta property="vocab:title"
          content="{{ htmlspecialchars($vocab->getTitle()) }}" />
    <meta property="vocab:slug"
          content="{{ htmlspecialchars($vocab->getSlug()) }}" />
    <meta property="vocab:owner"
          content="{{ htmlspecialchars($vocab->getOwner()) }}" />
@stop
@extends('layout/vocab_2col_layout')
@section('content')
    <article class="post">
        <div class="post-body">
            <div class="panel swatch-white panel-primary element-no-top
                        element-short-bottom panel-content">

                <div class="container-fluid" >
                    <div class="row">
                        @if($current_version != null || $superseded_version!=null )

                            <div class="col-md-4 panel-body">
                                @include('wrap-getvocabaccess', [ 'current_version' => $current_version ])
                            </div>
                        @endif


                        <div class="col-md-8 panel-body">
                            <!-- Use element-bottom-same-as-p to cancel Bootstrap's gobbling
                                 of the space after a last p of the description. -->
                            <div class="element-bottom-same-as-p break">{{ $vocab->getDescription() }}</div>
                            @if(!empty($vocab->getRevisionCycle()))
                                <h5>Revision Cycle</h5>
                                <p class="break">{{ $vocab->getRevisionCycle() }}</p>
                            @endif
                            <h5>Languages</h5>
                            <p>
                                <?php
                                echo(readable_lang($vocab->getPrimaryLanguage(), $vocab->getLanguageList()->getLanguageDetails()));
                                foreach($vocab->getOtherLanguage() as $language)
                                {
                                echo " | ";
                                echo(readable_lang($language, $vocab->getLanguageList()->getLanguageDetails()));
                                }
                                ?>

                            </p>
                            @if(!empty($vocab->getNote()))
                                <h5>Notes</h5>
                                <p class="break">{{ $vocab->getNote() }}</p>
                            @endif
                            @if(isset($cc)&&$cc!='')
                                <h5>Licence</h5>
                                <p>
                                    @if($cc=='CC-BY')
                                        <a href="http://creativecommons.org/licenses/by/3.0/au/" tip="Attribution"><img src="{{asset_url('images/icons/CC-BY.png', 'core')}}" class="img-cc" alt="CC-BY"></a> <br/>
                                    @elseif($cc=='CC-BY-SA')
                                        <a href="http://creativecommons.org/licenses/by-sa/3.0/au/" tip="Attribution-Shared Alike"><img src="{{asset_url('images/icons/CC-BY-SA.png', 'core')}}" class="img-cc" alt="CC-BY-SA"></a> <br/>
                                    @elseif($cc=='CC-BY-ND')
                                        <a href="http://creativecommons.org/licenses/by-nd/3.0/au/" tip="Attribution-No Derivatives"><img src="{{asset_url('images/icons/CC-BY-ND.png', 'core')}}" class="img-cc" alt="CC-BY-ND"></a> <br/>
                                    @elseif($cc=='CC-BY-NC')
                                        <a href="http://creativecommons.org/licenses/by-nc/3.0/au/" tip="Attribution-Non Commercial"><img src="{{asset_url('images/icons/CC-BY-NC.png', 'core')}}" class="img-cc" alt="CC-BY-NC"></a> <br/>
                                    @elseif($cc=='CC-BY-NC-SA')
                                        <a href="http://creativecommons.org/licenses/by-nc-sa/3.0/au/" tip="Attribution-Non Commercial-Shared Alike"><img src="{{asset_url('images/icons/CC-BY-NC-SA.png', 'core')}}" class="img-cc" alt="CC-BY-NC-SA"></a> <br/>
                                    @elseif($cc=='CC-BY-NC-ND')
                                        <a href="http://creativecommons.org/licenses/by-nc-nd/3.0/au/" tip="Attribution-Non Commercial-Non Derivatives"><img src="{{asset_url('images/icons/CC-BY-NC-ND.png', 'core')}}" class="img-cc" alt="CC-BY-NC-ND"></a> <br/>
                                    @elseif($cc=='CC0')
                                        <a href="https://creativecommons.org/publicdomain/zero/1.0/" tip="No Rights Reserved"><img src="{{asset_url('images/icons/CC0.png', 'core')}}" class="img-cc" alt="CC0"></a> <br/>
                                    @else
                                        <span>Licence: {{ htmlspecialchars($cc) }}</span>
                                    @endif
                                </p>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            @if(!empty($vocab->getTopConcept()))
                <div class="panel swatch-white" id="concept">
                    <div class="panel-heading">Top Concepts</div>
                    <div class="panel-body">
                        <table class="table">
                            <tbody>
                                @foreach($vocab->getTopConcept() as $concept)
                                    <tr><td class="break" style="max-width: 1px">{{htmlspecialchars($concept)}}</td></tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif

            {{-- The concept tree is shown if there is one to show. --}}
            {{-- There is one to show, if the "tree" service returns one. --}}
            @if(isset($current_version))
                <div ng-controller="visualise"
                versionid="{{ $current_version->getId() }}">
                @include('wrap-visualise')
                </div>
            @elseif(isset($superseded_version))
                <div ng-controller="visualise"
                versionid="{{ $superseded_version->getId() }}">
                @include('wrap-visualise')
                </div>
            @endif
            {{-- Show widgetable status based on $sissVocEndPoint. --}}
            @if(isset($sissvocEndPoint))
                <div id="widget" class="panel swatch-white">
                    <div class="panel-body">Use this code snippet to describe or
                        discover resources with
                        {{htmlspecialchars($vocab->getTitle())}} in your system
                        <br/><br/><b>Example:</b> Search for and select concepts
                        in this vocabulary
                        <input type="text" id="{{$vocab->getSlug()}}"
                               name="{{$vocab->getSlug()}}" placeholder="Search"
                               size="80" autocomplete="off">
                        <script>
                         $("#{{$vocab->getSlug()}}").vocab_widget({
                             mode: 'search',
                             cache: false,
                             repository: '{{$sissvocEndPoint}}',
                             target_field: 'label',
                             endpoint: '{{ portal_url("apps/vocab_widget/proxy/") }}'
                         });
                        </script>
                    </div>
                    <button id="widget-toggle">Show
                        code</button><div class="pull-right dev-link"><a target="_blank" href="{{portal_url('vocabs/page/widget_explorer')}}">Learn more</a></div>
                    <br/>
                    <div id="widget-info" class="toggle">
                        <pre class="panel-body prettyprint">
&lt;input type="text" id="{{$vocab->getSlug()}}" name="{{$vocab->getSlug()}}" value="" size="80" autocomplete="off"&gt;
&lt;script&gt;
    $("#{{$vocab->getSlug()}}").vocab_widget({
        mode: 'search',
        cache: false,
        repository: '{{$sissvocEndPoint}}',
        target_field: 'label',
        endpoint: '{{ portal_url("apps/vocab_widget/proxy/") }}'
    });
&lt;/script&gt;
                        </pre>
                    </div>
                </div>

            @endif

            @if(!empty($vocab->getSubject()))
                <div class="panel swatch-white">
                    <div class="panel-heading">Subjects</div>
                    <div class="panel-body">
                        <?php $sub_count=0; ?>
                        @foreach($vocab->getSubject() as $subject)
                            <?php $sub_count++; ?>
                            <a href="{{base_url()}}search/#!/?v_subject_labels={{rawurlencode($subject->getLabel())}}">
                                {{htmlspecialchars($subject->getLabel())}} </a>
                            <?php if($sub_count<count($vocab->getSubject())) echo " | "; ?>
                        @endforeach
                    </div>
                </div>
            @endif

        </div>
    </article>
@stop


@section('sidebar')
  @if($related_service)

    <div class="panel swatch-white  panel-primary element-no-top
                element-short-bottom panel-content">
      <div class="panel-heading">Services that make use of this vocabulary</div>
      <div class="panel-body">

        @foreach($related_service as $serviceRef)
          <p><small>
            <?php
            echo implode(array_map('trim', array_map('readable', $serviceRef->getRelation())), ', ');
            ?>
          </small>
          <a role="button" tabindex="0" class="re_preview" related='{{htmlspecialchars($serviceRef, ENT_QUOTES)}}'
          >{{htmlspecialchars($serviceRef->getRelatedEntity()->getTitle())}}</a></p>
        @endforeach

      </div>
    </div>
  @endif
  @if($related_people||$related_vocabs||$related_internal_vocabs)
    <div class="panel swatch-white  panel-primary element-no-top element-short-bottom panel-content">
      <div class="panel-heading">Related</div>
      <div class="panel-body">

        @if($related_people)
          <h5>Related people and organisations</h5>
          @foreach($related_people as $relatedRef)

            <p>

              <small>
                <?php
                echo implode(array_map('trim', array_map('readable', $relatedRef->getRelation())), ', ');
                ?>
              </small>
              <a role="button" tabindex="0" class="re_preview break" related='{{htmlspecialchars($relatedRef, ENT_QUOTES)}}'
              > {{htmlspecialchars($relatedRef->getRelatedEntity()->getTitle())}}</a>
            </p>
          @endforeach
        @endif
        @if($related_vocabs||$related_internal_vocabs)
          <h5>Related vocabularies</h5>
          @foreach($related_vocabs as $relatedRef)
            <p>
              <small>
                <?php
                echo implode(array_map('trim', array_map('readable',
                $relatedRef->getRelation())), ', ');
                ?>
              </small>
              <a role="button" tabindex="0" class="re_preview break" related='{{htmlspecialchars($relatedRef, ENT_QUOTES)}}'
              > {{htmlspecialchars($relatedRef->getRelatedEntity()->getTitle())}}</a>
            </p>
          @endforeach
          @foreach($related_internal_vocabs as $relatedRef)
            <p>
              <small>
                <?php
                echo implode(array_map('trim', array_map('readable',
                $relatedRef->getRelation())), ', ');
                ?>
              </small>
              <a role="button" tabindex="0" class="re_preview break" related='{{htmlspecialchars($relatedRef, ENT_QUOTES)}}'
              > {{htmlspecialchars($relatedRef->getRelatedVocabulary()->getTitle())}}</a>
            </p>
          @endforeach
        @endif
      </div>
    </div>

  @endif

  @if(isset($lens['users']))
    <div class="panel swatch-white  panel-primary element-no-top element-short-bottom panel-content">
      <div class="panel-heading">Used by</div>
      <div class="panel-body break">
        {{ $lens['users'] }}
      </div>
    </div>
  @endif

  @if(isset($lens['examples']))
    <div class="panel swatch-white  panel-primary element-no-top element-short-bottom panel-content">
      <div class="panel-heading">Examples of use</div>
      <div class="panel-body break">
        {{ $lens['examples'] }}
      </div>
    </div>
  @endif

  <div class="element-short-bottom">
    <a target="_blank"
       href="{{ $ad_href }}">
      <img src="{{asset_url('images/' . $ad_image)}}"/>
    </a>
  </div>

@stop
