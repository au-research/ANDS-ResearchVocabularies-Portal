<?php

// Doesn't work due to scoping rules.
//   use ANDS\VocabsRegistry\Model\AccessPoint;
// So define constants instead.
define("AP_API_SPARQL",
        ANDS\VocabsRegistry\Model\AccessPoint::DISCRIMINATOR_API_SPARQL);
define("AP_FILE",
        ANDS\VocabsRegistry\Model\AccessPoint::DISCRIMINATOR_FILE);
define("AP_SESAME_DOWNLOAD",
        ANDS\VocabsRegistry\Model\AccessPoint::DISCRIMINATOR_SESAME_DOWNLOAD);
define("AP_SISSVOC",
        ANDS\VocabsRegistry\Model\AccessPoint::DISCRIMINATOR_SISSVOC);
define("AP_WEB_PAGE",
        ANDS\VocabsRegistry\Model\AccessPoint::DISCRIMINATOR_WEB_PAGE);

// Maximum number of superseded versions to show on page load.
// If there are more than that, the remaining ones will
// be initially hidden.
define("DEFAULT_SUPERSEDED_VERSIONS", 5);

// check if there's not current version
$hasNotCurrentVersion = true;
foreach ($vocab->getVersion() as $version) {
    if ($version->getStatus() == ANDS\VocabsRegistry\Model\Version::STATUS_CURRENT && ! empty($version->getAccessPoint())) {
        $hasNotCurrentVersion = false;
        break;
    }
}

function onclickURL($vocab, $version, $ap, $key = '') {
    // $key is currently only for sesameDownload.
    $share_params = [ ];
    switch ($ap->getDiscriminator()) {
    case AP_API_SPARQL:
        $ap_url = $ap->getApApiSparql()->getUrl();
        break;
    case AP_FILE:
        $ap_url = $ap->getApFile()->getUrl();
        break;
    case AP_SESAME_DOWNLOAD:
        $ap_url = $ap->getApSesameDownload()->getUrlPrefix() . $key;
        break;
    case AP_SISSVOC:
        $ap_url = $ap->getApSissvoc()->getUrlPrefix() . '/concept';
        // referrer_type only for sissvoc, so far.
        $share_params['referrer_type'] = 'view_concept_list';
        break;
    case AP_WEB_PAGE:
        $ap_url = $ap->getApWebPage()->getUrl();
        break;
    default:
        $ap_url = 'unknown';
    }
    $share_params['vocab_id'] = $vocab->getId();
    $share_params['vocab_status'] = $vocab->getStatus();
    $share_params['vocab_title'] = $vocab->getTitle();
    $share_params['vocab_slug'] = $vocab->getSlug();
    $share_params['vocab_owner'] = $vocab->getOwner();
    $share_params['version_id'] = $version->getId();
    $share_params['version_status'] = $version->getStatus();
    $share_params['version_title'] = $version->getTitle();
    $share_params['version_slug'] = $version->getSlug();
    $share_params['ap_id'] = $ap->getId();
    $share_params['ap_type'] = $ap->getDiscriminator();
    $share_params['ap_url'] = $ap_url;

    return htmlspecialchars(portal_url('vocabs/logAccessPoint') . '?' . http_build_query($share_params));
}

// Need to use $GLOBALS explicitly here, because we're in an eval.
$GLOBALS['isTheFirstSissvocAccessPoint'] = true;
function getIdForSissvocAccessPoint() {
    global $isTheFirstSissvocAccessPoint;
    if ($isTheFirstSissvocAccessPoint) {
        $isTheFirstSissvocAccessPoint = false;
        return 'id="current_version_sissvoc"';
    } else {
        return '';
    }
}
?>
@if(isset($current_version) && $current_version != '')

  <?php
    $aps = array();
    // get file
    foreach ($current_version->getAccessPoint() as $ap) {
        $aps[$ap->getDiscriminator()] = array();
        array_push($aps[$ap->getDiscriminator()], $ap);
    }

    // checking if current version has a file download and has a sesame downloads
    $hasFile = false;
    $hasSesameDownloads = false;
    $fileCounter = 0;
    foreach ($current_version->getAccessPoint() as $ap) {
        if ($ap->getDiscriminator() === AP_FILE) {
            $hasFile = true;
            $fileCounter ++;
        }
        if ($ap->getDiscriminator() === AP_SESAME_DOWNLOAD)
            $hasSesameDownloads = true;
    }

    // single file happens when there is only 1 download for a file and no other formats
    $singleFile = false;
    if ($hasFile && ! $hasSesameDownloads && $fileCounter < 2) {
        $singleFile = true;
    }

  ?>

  <div class="box" ng-non-bindable>
    <div
      class="box-title {{ $hasNotCurrentVersion ? 'box-title-collapsible' : '' }}">
      <h4 class="break">
        <i class="fa fa-lg fa-caret-down" style="display: none;">&nbsp;</i><i
          class="fa fa-lg fa-caret-right" style="display: none;">&nbsp;</i>
        {{ htmlspecialchars($current_version->getTitle()) }}
      </h4>
      <span class="box-tag box-tag-green"> current </span>
    </div>
    <div class="clearfix"></div>
    <div class="box-content">

      @foreach($current_version->getAccessPoint() as $ap)
        @if(($ap->getDiscriminator() === AP_FILE && !$singleFile) || ($hasSesameDownloads))
        <a role="button" tabindex="0" class="btn btn-lg btn-block btn-primary download-chooser"><i
          class="fa fa-download"></i> Download <i
          class="fa fa-chevron-right"></i></a>
        <?php break; ?>
        @endif
      @endforeach

      @if($singleFile)
        @foreach($current_version->getAccessPoint() as $ap)
          @if($ap->getDiscriminator() === AP_FILE)
            <a role="button" class="download-link btn btn-lg btn-block btn-primary"
               style="white-space: normal;"
               onclick="$.ajax('{{ onclickURL($vocab, $current_version, $ap) }}'); return true"
               href="{{ $ap->getApFile()->getUrl() }}"><i class="fa fa-download"></i>
               Download ({{ htmlspecialchars($ap->getApFile()->getFormat()) }})</a>
          @endif
        @endforeach
      @endif
      @foreach($current_version->getAccessPoint() as $ap)
        @if($ap->getDiscriminator() === AP_WEB_PAGE)
          <div
            class="btn-group btn-group-justified text-center element element-no-bottom element-no-top"
            role="group" aria-label="...">
            <a target="_blank"
              class="{{$ap->getDiscriminator()}}"
              onclick="$.ajax('{{ onclickURL($vocab, $current_version, $ap) }}'); return true"
              href="{{ $ap->getApWebPage()->getUrl() }}"><i
              class="fa fa-external-link"></i> Access Web Page</a>
          </div>
        @endif
      @endforeach
      @foreach($current_version->getAccessPoint() as $ap)
        @if($ap->getDiscriminator() === AP_SISSVOC)
          <div
            class="btn-group btn-group-justified text-center element element-no-bottom element-no-top"
            role="group" aria-label="...">
            {{-- The id attribute with value "current_version_sissvoc" --}}
            {{-- goes on the first such match. This assignment must match --}
            {{-- the access point selected by --}}
            {{-- the vocabs controller method displayTree(). --}}
            <a {{ getIdForSissvocAccessPoint() }}
              target="_blank"
              class="{{$ap->getDiscriminator()}}"
              vocab="{{ htmlspecialchars($vocab) }}"
              current_version="{{ htmlspecialchars($current_version) }}"
              ap="{{ htmlspecialchars($ap) }}"
              onclick="$.ajax('{{ onclickURL($vocab, $current_version, $ap) }}'); return true"
              sissvoc_endpoint="{{ $ap->getApSissvoc()->getUrlPrefix() }}"
              href="{{ $ap->getApSissvoc()->getUrlPrefix() }}/concept"><i
              class="fa fa-share-alt"></i> Access Linked Data API</a>
          </div>
        @endif
      @endforeach
      @foreach($current_version->getAccessPoint() as $ap)
        @if($ap->getDiscriminator() === AP_API_SPARQL)
          <div class="sp-box">
            <div class="text-center">
              <small><a class="showsp" role="button" tabindex="0">Show SPARQL Endpoint</a></small>
            </div>
            <div class="sp text-center collapse">
              <small>SPARQL Endpoint:</small>
              <p style="word-break: break-all">
                <a target="_blank"
                  onclick="$.ajax('{{ onclickURL($vocab, $current_version, $ap) }}'); return true"
                  href="{{ $ap->getApApiSparql()->getUrl() }}"><i
                  class="fa fa-cog"></i> {{ htmlspecialchars($ap->getApApiSparql()->getUrl()) }}</a>
              </p>
              <p>
                <a target="_blank" href="//documentation.ardc.edu.au/rva/sparql-endpoint">Learn More</a>
              </p>
            </div>
          </div>
        @endif
      @endforeach
      <div class="text-center">
        {{ !empty($current_version->getReleaseDate()) ? '<span class="small"><em>released: '. display_release_date($current_version->getReleaseDate())."</em></span>": '' }}{{ !empty($current_version->getNote()) ? '<span class="small"> <a role="button" tabindex="0" tip="'.htmlentities($current_version->getNote()).'">view notes</a></span>': '' }}
      </div>
      <div class="download-content hidden">
        @if($hasFile && $hasSesameDownloads)
          Original:
        @endif
        <ul>
          @foreach($current_version->getAccessPoint() as $ap)
            @if($ap->getDiscriminator() === AP_FILE)
              <li><a class="download-link"
                onclick="$.ajax('{{ onclickURL($vocab, $current_version, $ap) }}'); return true"
                href="{{ $ap->getApFile()->getUrl() }}">{{ htmlspecialchars($ap->getApFile()->getFormat()) }}</a></li>
            @endif
          @endforeach
        </ul>
        @foreach($current_version->getAccessPoint() as $ap)
          @if($ap->getDiscriminator() === AP_SESAME_DOWNLOAD)
            @if($hasFile && $hasSesameDownloads)
              Other Formats:
            @endif
            <ul>
              <?php
                $sesameFormats = array(
                  "rdf" => "RDF/XML",
                  "nt" => "N-Triples",
                  "ttl" => "Turtle",
                  "n3" => "Notation3",
                  "nq" => "N-Quads",
                  "json" => "RDF/JSON",
                  "jsonld" => "JSON-LD",
                  "trix" => "TriX",
                  "trig" => "TriG",
                  "bin" => "Sesame Binary RDF"
                );
              ?>
              @foreach($sesameFormats as $key=>$val)
                <li><a class="download-link" target="_blank"
                  onclick="$.ajax('{{ onclickURL($vocab, $current_version, $ap, $key) }}'); return true"
                  href="{{ $ap->getApSesameDownload()->getUrlPrefix() }}{{$key}}">{{ $val }}</a></li>
              @endforeach
            </ul>
          @endif
        @endforeach
      </div>
    </div>
  </div>
@endif <!-- current_version -->

<?php $first = true; $supersedVersionsDisplayed = 0; ?>
@foreach($vocab->getVersion() as $version)

  @if($version->getStatus() !== ANDS\VocabsRegistry\Model\Version::STATUS_CURRENT && !empty($version->getAccessPoint()))
    <?php
      $hasFile = false;
      $hasSesameDownloads = false;
      $fileCounter = 0;
      foreach ($version->getAccessPoint() as $ap) {
        if ($ap->getDiscriminator() === AP_FILE) {
          $hasFile = true;
          $fileCounter++;
        }
        if ($ap->getDiscriminator() === AP_SESAME_DOWNLOAD) $hasSesameDownloads = true;
      }

      //single file happens when there is only 1 download for a file and no other formats
      $singleFile = false;
      if ($hasFile && !$hasSesameDownloads && $fileCounter < 2) {
        $singleFile = true;
      }
    ?>
    @if ($supersedVersionsDisplayed == DEFAULT_SUPERSEDED_VERSIONS)
    <div id="hiddenSupersedVersions" style="display: none;">
    @endif
    <div class="box" ng-non-bindable>
      <div class="box-title {{ $hasNotCurrentVersion ? 'box-title-collapsible' : '' }}">
        <h4 class="break"><i class="fa fa-lg fa-caret-down" style="display: none;"></i>&nbsp;<i class="fa fa-lg fa-caret-right" style="display: none;">&nbsp;</i> {{ htmlspecialchars($version->getTitle()) }} </h4>
        <span class="box-tag box-tag box-tag-{{ htmlspecialchars($version->getStatus()) }}"> {{htmlspecialchars($version->getStatus())}} </span>
      </div>
      <div class="clearfix"></div>
      <?php  if($first && $hasNotCurrentVersion){$collapse = '';}else{$collapse="collapse";}?>
      <div class="box-content <?=$collapse?>">
        @foreach($version->getAccessPoint() as $ap)
          @if(($ap->getDiscriminator() == AP_FILE && !$singleFile) || ($hasSesameDownloads))
            <a role="button" tabindex="0" class="btn btn-lg btn-block btn-primary download-chooser"><i class="fa fa-download"></i> Download <i class="fa fa-chevron-right"></i></a>
              <?php break; ?>
          @endif
        @endforeach

        @if($singleFile)
          @foreach($version->getAccessPoint() as $ap)
            @if($ap->getDiscriminator() === AP_FILE)
              <a role="button" tabindex="0" class="download-link btn btn-lg btn-block btn-primary"
                 style="white-space: normal;"
                onclick="$.ajax('{{ onclickURL($vocab, $version, $ap) }}'); return true"
                href="{{ $ap->getApFile()->getUrl() }}"><i class="fa fa-download"></i> Download ({{ htmlspecialchars($ap->getApFile()->getFormat()) }})</a>
            @endif
          @endforeach
        @endif

        @foreach($version->getAccessPoint() as $ap)
          @if($ap->getDiscriminator() === AP_WEB_PAGE)
            <div class="btn-group btn-group-justified text-center element element-no-bottom element-no-top" role="group" aria-label="...">
                <a target="_blank" class="{{htmlspecialchars($ap->getDiscriminator())}}"
                  onclick="$.ajax('{{ onclickURL($vocab, $version, $ap) }}'); return true"
                  href="{{ $ap->getApWebPage()->getUrl() }}"><i class="fa fa-external-link"></i> Access Web Page</a>
            </div>
          @endif
        @endforeach

        @foreach($version->getAccessPoint() as $ap)
          @if($ap->getDiscriminator() === AP_SISSVOC)
            <div class="btn-group btn-group-justified text-center element element-no-bottom element-no-top" role="group" aria-label="...">
              <a target="_blank" class="text-center {{htmlspecialchars($ap->getDiscriminator())}}"
                onclick="$.ajax('{{ onclickURL($vocab, $version, $ap) }}'); return true"
                href="{{ $ap->getApSissvoc()->getUrlPrefix() }}/concept"><i class="fa fa-share-alt"></i> Access Linked Data API</a>
            </div>
          @endif
        @endforeach

        @foreach($version->getAccessPoint() as $ap)
          @if($ap->getDiscriminator() === AP_API_SPARQL)
            <div class="sp-box">
              <div class="text-center">
                <small><a class="showsp" role="button" tabindex="0">Show SPARQL Endpoint</a></small>
              </div>
              <div class="sp text-center collapse">
                <small>SPARQL Endpoint:</small>
                <p style="word-break:break-all">
                  <a target="_blank"
                    onclick="$.ajax('{{ onclickURL($vocab, $version, $ap) }}'); return true"
                    href="{{ $ap->getApApiSparql()->getUrl() }}"><i
                    class="fa fa-cog"></i> {{ htmlspecialchars($ap->getApApiSparql()->getUrl()) }}</a>
                </p>
                <p>
                  <a target="_blank" href="//documentation.ardc.edu.au/rva/sparql-endpoint">Learn More</a>
                </p>
              </div>
            </div>
          @endif
        @endforeach
        <div class="text-center">
          {{ !empty($version->getReleaseDate()) ? '<span class="small"><em>released: '. display_release_date($version->getReleaseDate())."</em></span>": '' }}{{ !empty($version->getNote()) ? '<span class="small"> <a role="button" tabindex="0" tip="'.htmlentities($version->getNote()).'">view notes</a></span>': '' }}
        </div>
        <div class="download-content hidden">
          @foreach($version->getAccessPoint() as $ap)
            @if($ap->getDiscriminator() === AP_FILE)
              @if($hasFile && $hasSesameDownloads)
                Original:
              @endif
              <ul>
                <li><a class="download-link" target="_blank"
                       onclick="$.ajax('{{ onclickURL($vocab, $version, $ap) }}'); return true"
                       href="{{ $ap->getApFile()->getUrl() }}">{{ htmlspecialchars($ap->getApFile()->getFormat()) }}</a></li>
              </ul>
            @endif
          @endforeach
          @foreach($version->getAccessPoint() as $ap)
            @if($ap->getDiscriminator() === AP_SESAME_DOWNLOAD)
              @if($hasFile && $hasSesameDownloads)
                Other Formats:
              @endif
              <ul>
                <?php
                  $sesameFormats = array(
                    "rdf" => "RDF/XML",
                    "nt" => "N-Triples",
                    "ttl" => "Turtle",
                    "n3" => "Notation3",
                    "nq" => "N-Quads",
                    "json" => "RDF/JSON",
                    "trix" => "TriX",
                    "trig" => "TriG",
                    "bin" => "Sesame Binary RDF"
                  );
                ?>
                @foreach($sesameFormats as $key=>$val)
                  <li><a class="download-link" target="_blank"
                    onclick="$.ajax('{{ onclickURL($vocab, $version, $ap, $key) }}'); return true"
                    href="{{ $ap->getApSesameDownload()->getUrlPrefix() }}{{$key}}">{{ $val }}</a></li>
                @endforeach
              </ul>
            @endif
          @endforeach
        </div>

      </div>
    </div>
    <?php $first = false; $supersedVersionsDisplayed++; ?>
  @endif
@endforeach

@if ($supersedVersionsDisplayed > DEFAULT_SUPERSEDED_VERSIONS)
  </div>
  <div class="box" id="hideAfterShowingSuperdedVersions"><div class="box-content text-center"><a role="button" tabindex="0" id="showSupersededVersions" >Show the other superseded versions</a></div></div>
@endif
