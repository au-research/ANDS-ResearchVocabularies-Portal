<footer id="footer" role="contentinfo">
    <section class="section swatch-dark-blue">
        <div class="container">
            <table class="row element-medium-top element-medium-bottom">
              <tr>
                <td class="col-md-8" style="vertical-align:bottom">
                        Research Vocabularies Australia is the controlled vocabulary discovery service of the Australian Research Data Commons (ARDC). ARDC is supported by the Australian Government through the National Collaborative Research Infrastructure Strategy Program.
                        <a href="https://ardc.edu.au/about/" target="_blank" style="color:#84A07B">Read more about ARDC...</a>
                </td>
                <td class="col-md-2" style="vertical-align:bottom">
                   <a href="https://education.gov.au/national-collaborative-research-infrastructure-strategy-ncris" target="_blank"><img style="vertical-align:bottom; max-height: 120px" src="<?php echo asset_url('images/NCRIS_PROVIDER_rev.png','core');?>" alt="National Collaborative Research Infrastructure Strategy (NCRIS)" /></a>
                </td>
                <td class="col-md-2" style="vertical-align:bottom">
                    <a style="vertical-align:text-bottom" href="https://ardc.edu.au/" target="_blank" class="footer_logo"><img style="vertical-align:text-bottom; max-height: 60px" src="{{asset_url('images/ardc_logo_white.png', 'core')}}" alt="" /></a>
                </td>
              </tr>
            </table>
            <div class="row element-normal-top element-normal-bottom">
                <div class="col-md-3">
                    <div id="categories-3" class="sidebar-widget  widget_categories">
                        <h3 class="sidebar-header">Quick Links</h3>
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
                <div class="col-md-3">
                    <div id="categories-3" class="sidebar-widget  widget_categories">
                        <h3 class="sidebar-header">Get Involved</h3>
                        <ul>
                            <li><a href="{{portal_url('vocabs/page/contribute')}}">Publish a vocabulary</a></li>
                            <li><a href="{{portal_url('vocabs/page/use')}}">Use a vocabulary</a></li>
                            <li><a href="{{portal_url('vocabs/page/feedback')}}">Give feedback on vocabularies</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-3">
                    <?php
                    $url = ((isset($ro) && isset($ro->core['slug']) && isset($ro->core['id'])) ? base_url().$ro->core['slug'].'/'.$ro->core['id'] : current_url() );
                    if (isset($strip_last_url_component) && $strip_last_url_component) { $url_array = explode('/', $url); array_pop($url_array); $url = implode('/', $url_array); }
                    $title = ((isset($ro) && isset($ro->core['slug']) && isset($ro->core['id'])) ? $ro->core['title']. ' - Research Vocabularies Australia' : 'Research Vocabularies Australia' );
                    ?>
                    <div id="categories-5" class="sidebar-widget widget_categories">
                        <h3 class="sidebar-header">Share</h3>
                        <ul>
                            @if(isset($share_controller))
                                <li class="cat-item"><a class="noexicon social-sharing" href="{{$share_controller . 'facebook?' . $share_query_params}}" target="_blank"><i class="fa fa-facebook"></i> Facebook</a></li>
                                <li class="cat-item"><a class="noexicon social-sharing" href="{{$share_controller . 'twitter?' . $share_query_params}}" target="_blank"><i class="fa fa-twitter"></i> Twitter</a></li>
                            @else
                                <li class="cat-item"><a class="noexicon social-sharing" href="{{ portal_url('vocabs/share/facebook?url=' . $url . '&page=' . $page) }}" target="_blank"><i class="fa fa-facebook"></i> Facebook</a></li>
                                <li class="cat-item"><a class="noexicon social-sharing" href="{{ portal_url('vocabs/share/twitter?url=' . $url . '&page=' . $page . '&title=' . $title) }}" target="_blank"><i class="fa fa-twitter"></i> Twitter</a></li>
                            @endif

                        </ul>
                    </div>
                </div>
                <div class="col-md-3">
                    <div id="categories-4" class="sidebar-widget  widget_categories">
                        <h3 class="sidebar-header">External Resources</h3>
                        <ul>
                            <li class="cat-item"> <a href="https://ardc.edu.au/" title="" target="_blank">ARDC Website</a> </li>
                            <li class="cat-item"> <a href="http://developers.ands.org.au" title="" target="_blank">Developers</a> </li>
                            <li class="cat-item"> <a href="{{base_url('registry/')}}" title="">ARDC Online Services</a> </li>
                            @if(isset($ro) && $ro->core['id'])
                            <li class="cat-item"> <a href="{{base_url('registry/registry_object/view/')}}/<?=$this->ro->id?>" title="">Registry View</a> </li>
                            @endif
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>
</footer>
