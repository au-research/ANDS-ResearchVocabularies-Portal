<div class="navbar swatch-white" role="banner">
  <div class="container" style="z-index:10">
    <div class="navbar-header">

      <button type="button" class="navbar-toggle collapsed close" data-toggle="collapse" data-target=".main-navbar" aria-expanded="false">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>

      <div style="display: inline-flex">
        <span style="display: inline-block; height: 100%; vertical-align: middle"></span>
        <a style="vertical-align: middle" href="{{portal_url()}}" >
          <img style="vertical-align: middle; min-width: 150px" src="{{ asset_url('images/ARDC_Research_Vocabularies_RGB_FA_Master.svg') }}"
               width="300px">
        </a>
      </div>
    </div> <!-- row -->

    <nav class="collapse navbar-collapse main-navbar" role="navigation">
      <ul class="nav navbar-nav navbar-right h5 text-uppercase">
        <li><a href="{{portal_url('vocabs/page/about')}}">About</a></li>
        <li><a href="{{portal_url('vocabs/page/widget_explorer')}}">Widget Explorer</a></li>
        <li> <a role="button" tabindex="0" class="dropdown-toggle" data-toggle="dropdown"
                aria-expanded="false">Get Involved <i class="fa fa-caret-down"></i></a>
          <ul class="dropdown-menu" role="menu">
            <li><a href="{{portal_url('vocabs/page/contribute')}}">Publish a vocabulary</a></li>
            <li><a href="{{portal_url('vocabs/page/use')}}">Use a vocabulary</a></li>
            <li><a href="{{portal_url('vocabs/page/feedback')}}">Give feedback on vocabularies</a></li>
            <li><a href="https://ardc.edu.au/researcher/?utm_source=RVA&amp;utm_medium=referral-G&amp;utm_id=TRDC&amp;utm_term=generic&amp;utm_content=rva-menu" target="_blank">Researcher guides</a></li>
          </ul></li>
        @if(!empty($lensMenu))
          <li> <a role="button" tabindex="0" class="dropdown-toggle" data-toggle="dropdown"
                  aria-expanded="false">Community lenses <i class="fa fa-caret-down"></i></a>
            <ul class="dropdown-menu" role="menu">
              @foreach($lensMenu as $lensMenuItem)
                <li><a href="{{portal_url('lenses/' . $lensMenuItem['type'] . '/' . $lensMenuItem['url'])}}">{{$lensMenuItem['title']}}</a></li>
              @endforeach
            </ul>
          </li>
        @endif
        @if(!$this->user->loggedIn())
          <li><a href="{{ get_vocab_config('auth_url') }}login?redirect={{ portal_url('vocabs/myvocabs') }}#!/?redirect={{ portal_url('vocabs/myvocabs') }}" class="login_btn">My Vocabs Login</a></li>
        @else
          <li><a href="{{ portal_url('vocabs/myvocabs') }}">My Vocabs</a></li>
        @endif
        <?php
        $profile_image = $this->user->profileImage();
        ?>
        @if($profile_image)
          <li><a href="{{portal_url('profile')}}"><img src="{{ $profile_image }}" alt="" class="profile_image_small"></a></li>
        @endif
      </ul>
    </nav>

  </div> <!-- container -->
</div> <!-- swatch-white -->
@if(isset($search_app))
  <input type="hidden" id="search_app" value="true">
@endif
@if(!isset($customSearchBlock))
  <div class="swatch-dark-blue" style="position:relative">
    <div id="banner-image" class="background-media"></div>
    <div class="background-overlay grid-overlay-30"
         style="background-color: rgba(0,0,0,0.3)"></div>
    <div class="container-fluid">
      <div class="row element-shorter-bottom element-shorter-top">
        <div class="col-md-4 col-lg-3">
        </div>
        <!-- Force z-index; need this with container-fluid, but
             not container. -->
        <div class="col-md-9" style="z-index: 3">
          <form action="" ng-submit="$event.preventDefault();search()">
            <div class="input-group" style="max-width: 970px">
              <input type="text" class="form-control"
                     placeholder="Search for a vocabulary or a concept"
                     ng-model="form.query">
              <span class="input-group-btn">
                <button class="btn btn-primary" type="button"
                        ng-click="search()"><i class="fa fa-search"></i> Search</button>
              </span>
              <span class="input-group-btn">
                <a href="https://documentation.ardc.edu.au/rva/vocabulary-search" target="_blank" class="btn" style="color: white"><i class="fa fa-question-circle"></i> Using search</a>
              </span>
              <span class="input-group-btn" style="padding-right: 3px">
                <a href="{{ portal_url('search/#!/?activeTab=vocabularies') }}" class="btn" style="color: white; padding-right: 0px">Browse all vocabularies</a>
              </span>
              <span class="input-group-btn" style="width: 0px">
                <span style="font-size: 16px; vertical-align: middle">|</span>
              </span>
              <span class="input-group-btn" style="padding-left: 3px">
                <a href="{{ portal_url('search/#!/?activeTab=resources') }}" class="btn" style="color: white; padding-left: 0px">concepts</a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
@endif
<button class="yellow_button feedback_button">Feedback</button>
<a href="https://documentation.ardc.edu.au/rva/" target="_blank" class="yellow_button help_button"><i class="fa fa-question-circle"></i> Help</a>
