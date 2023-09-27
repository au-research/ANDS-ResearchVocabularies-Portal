<footer id="footer" role="contentinfo">
  <section class="section swatch-dark-blue">
    <div class="container">

      <div class="row element-medium-top element-medium-bottom">
        <div class="col-md-2 visible-lg visible-md visible-sm-block visible-xs-block sidebar-widget" >
          <a href="https://ardc.edu.au/" target="_blank" class="footer_logo"><img style="margin-top: 10px; max-height: 60px" src="{{asset_url('images/ardc_logo.svg', 'core')}}" alt="" /></a>
        </div>

        <div class="col-md-2">
          <div id="categories-3" class="sidebar-widget widget_categories text-uppercase">
            <h5 class="sidebar-header">Quick Links</h5>
            <ul>
              <li class="cat-item"> <a href="{{portal_url()}}" title="">Home</a> </li>
              <li class="cat-item"> <a href="{{portal_url('vocabs/page/about')}}" title="">About</a> </li>
              <li><a href="{{portal_url('vocabs/page/widget_explorer')}}">Explore Widgetable Vocabularies</a></li>
              <li class="cat-item"> <a href="{{portal_url('vocabs/myvocabs')}}" title="">My Vocabs</a> </li>
              <li class="cat-item myCustomTrigger"> <a href="" title="">Contact us</a> </li>
              <li class="cat-item"> <a href="{{portal_url('vocabs/page/disclaimer')}}" title="">Disclaimer</a> </li>
              <li class="cat-item"> <a href="{{portal_url('vocabs/page/privacy')}}" title="">Privacy Policy</a> </li>
            </ul>
          </div>
        </div>
        <div class="col-md-2">
          <div id="categories-3" class="sidebar-widget widget_categories text-uppercase">
            <h5 class="sidebar-header">Get Involved</h5>
            <ul>
              <li><a href="{{portal_url('vocabs/page/contribute')}}">Publish a vocabulary</a></li>
              <li><a href="{{portal_url('vocabs/page/use')}}">Use a vocabulary</a></li>
              <li><a href="{{portal_url('vocabs/page/feedback')}}">Give feedback on vocabularies</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-2">
          <?php
          $url = ((isset($ro) && isset($ro->core['slug']) && isset($ro->core['id'])) ? base_url().$ro->core['slug'].'/'.$ro->core['id'] : current_url() );
          if (isset($strip_last_url_component) && $strip_last_url_component) { $url_array = explode('/', $url); array_pop($url_array); $url = implode('/', $url_array); }
          $title = ((isset($ro) && isset($ro->core['slug']) && isset($ro->core['id'])) ? $ro->core['title']. ' - Research Vocabularies Australia' : 'Research Vocabularies Australia' );
          ?>
          <div id="categories-5" class="sidebar-widget widget_categories text-uppercase">
            <h5 class="sidebar-header">Share</h5>
            <ul>
              @if(isset($share_controller))
                <li class="cat-item"><a class="noexicon social-sharing" href="{{$share_controller . 'facebook?' . $share_query_params}}" target="_blank"><i class="fa fa-facebook"></i> Facebook</a></li>
                <li class="cat-item"><a class="noexicon social-sharing" href="{{$share_controller . 'twitter?' . $share_query_params}}" target="_blank"><span style="font-size: 16px;"><b>&#x1D54F;</b></span></a></li>
              @else
                <li class="cat-item"><a class="noexicon social-sharing" href="{{ portal_url('vocabs/share/facebook?url=' . $url . '&page=' . $page) }}" target="_blank"><i class="fa fa-facebook"></i> Facebook</a></li>
                <li class="cat-item"><a class="noexicon social-sharing" href="{{ portal_url('vocabs/share/twitter?url=' . $url . '&page=' . $page . '&title=' . $title) }}" target="_blank"><span style="font-size: 16px;"><b>&#x1D54F;</b></span></a></li>
              @endif
            </ul>
          </div>
        </div>
        <div class="col-md-2">
          <div id="categories-4" class="sidebar-widget widget_categories text-uppercase">
            <h5 class="sidebar-header">External Resources</h5>
            <ul>
              <li class="cat-item"> <a href="https://ardc.edu.au/researcher/?utm_source=RVA&amp;utm_medium=referral-G&amp;utm_id=TRDC&amp;utm_term=generic&amp;utm_content=rva-footer" title="" target="_blank">Researcher guides</a></li>
              <li class="cat-item"> <a href="https://ardc.edu.au/" title="" target="_blank">ARDC Website</a> </li>
              <li class="cat-item"> <a href="https://documentation.ardc.edu.au/" title="" target="_blank">Developers</a> </li>
              <!-- <li class="cat-item"> <a href="{{base_url('registry/')}}" title="">ARDC Online Services</a> </li> -->
              @if(isset($ro) && $ro->core['id'])
                <li class="cat-item"> <a href="{{base_url('registry/registry_object/view/')}}/<?=$this->ro->id?>" title="">Registry View</a> </li>
              @endif
            </ul>
          </div>
        </div>


        <div class="col-md-2 visible-lg visible-md visible-sm-block visible-xs-block">
          <div class="image-caption-credit">The Australian Research Data Commons (ARDC) is enabled by NCRIS.</div>
          <a href="https://www.education.gov.au/ncris" target="_blank"><img style="max-height: 120px" src="<?php echo asset_url('images/NCRIS_PROVIDER_rev.png','core');?>" alt="National Collaborative Research Infrastructure Strategy (NCRIS)" /></a>
        </div>

      </div> <!-- row -->

    </div> <!-- container -->
  </section>
</footer>
