<div class="modal-body swatch-white">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="form-group">
                    <!-- -label for="">Title</label><br />{{htmlspecialchars($related['title'])}} -->
                    <h3>{{htmlspecialchars($related['title'])}}</h3>
                </div>
                <div class="form-group">
                    <label for="">Relation</label><br />
                    <?php
                        if (is_array($related['relationship'])) {
                            echo implode(array_map('readable', $related['relationship']), '<br />');
                        } else {
                            echo readable($related['relationship']);
                       }
                    ?>
                </div>
                @if($related['type']!='vocabulary' && isset($related['identifiers']))
                    <div class="form-group">
                        <label for="">Identifiers</label><br />
                        @foreach($related['identifiers'] as $identifier)
                            {{htmlspecialchars($identifier['url'])}}<br />
                        @endforeach
                    </div>
                @endif
                @if(isset($related['email']))
                    <div class="form-group">
                        <label for="">Email</label><br />{{htmlspecialchars($related['email'])}}
                    </div>
                @endif
                @if(isset($related['address']))
                    <div class="form-group">
                        <label for="">Address</label><br />{{htmlspecialchars($related['address'])}}
                    </div>
                @endif
                @if(isset($related['phone']))
                    <div class="form-group">
                        <label for="">Phone</label><br />{{htmlspecialchars($related['phone'])}}
                    </div>
                @endif
                @if(isset($related['urls']))
                    <div class="form-group">
                        <label for="">URLs</label><br />
                        @foreach($related['urls'] as $url)
                            <a target="_blank" href="{{$url['url']}}">{{htmlspecialchars($url['url'])}}</a><br />
                        @endforeach
                    </div>
                @endif
                @if(isset($sub_type)&& $sub_type=='publisher')
                    @if($related['type']=='party' && isset($related['other_vocabs'][0]['title']))
                        <div class="form-group">
                            <label for="">More vocabularies related to {{htmlspecialchars($related['title'])}}</label><br />
                            @foreach($related['other_vocabs'] as $other_vocab)
                                <a target="_blank" href="{{base_url().$other_vocab['slug']}}">{{htmlspecialchars($other_vocab['title'])}}</a><br />
                            @endforeach
                        </div>
                    @endif
                @elseif(isset($related['other_vocabs'][0]['title']))
                    @if($related['type']=='party')
                        <div class="form-group">
                            <label for="">More vocabularies related to {{htmlspecialchars($related['title'])}}</label><br />
                            @foreach($related['other_vocabs'] as $other_vocab)
                                <a target="_blank" href="{{base_url().$other_vocab['slug']}}">{{htmlspecialchars($other_vocab['title'])}}</a><br />
                            @endforeach
                        </div>
                    @endif
                    @if($related['type']=='vocabulary')
                        <div class="form-group">
                            <label for="">More vocabularies related to {{htmlspecialchars($related['title'])}}</label>
                            @foreach($related['other_vocabs'] as $other_vocab)
                                <a target="_blank" href="{{base_url().$other_vocab['slug']}}">{{htmlspecialchars($other_vocab['title'])}}</a><br />
                            @endforeach
                        </div>
                    @endif
                @endif
            </div>
        </div>
    </div>
</div>
