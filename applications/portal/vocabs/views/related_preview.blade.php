<div class="modal-body swatch-white">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="form-group">
          <!-- -label for="">Title</label><br />{{htmlspecialchars($related['title'])}} -->
          @if(isset($related['vocab_id']))
            <h4><a href="{{base_url().'viewById/'.$related['vocab_id']}}" target="_blank">{{htmlspecialchars($related['title'])}}</a></h4>
          @else
            <h4>{{htmlspecialchars($related['title'])}}</h4>
          @endif
        </div>
        @if(isset($related['description']))
          <div class="form-group">
            <label for="">Description</label><br />{{$related['description']}}
          </div>
        @endif
        <div class="form-group">
          <label for="">Relation</label>
          <ul class="list-unstyled">
            <li>
              <?php
              if (is_array($related['relationship'])) {
                echo implode(array_map('trim', array_map('readable', $related['relationship'])), '</li><li>');
              } else {
                echo readable($related['relationship']);
              }
              ?>
            </li>
          </ul>
        </div>
        @if(isset($related['identifiers']))
          <div class="form-group">
            <label for="">Identifiers</label>
            <ul class="list-unstyled">
              @foreach($related['identifiers'] as $identifier)
                <li>{{getResolvedLinkForIdentifier($identifier->getIdentifierType(),$identifier->getIdentifierValue())}}</li>
              @endforeach
            </ul>
          </div>
        @endif
        @if(isset($related['email']))
          <div class="form-group">
            <label for="">Email</label><br />{{htmlspecialchars($related['email'])}}
          </div>
        @endif
        @if(isset($related['phone']))
          <div class="form-group">
            <label for="">Phone</label><br />{{htmlspecialchars($related['phone'])}}
          </div>
        @endif
        @if(isset($related['urls']))
          <div class="form-group">
            <label for="">URLs</label>
            <ul class="list-unstyled">
              @foreach($related['urls'] as $url)
                <li><a target="_blank" href="{{$url}}">{{htmlspecialchars($url)}} <img src="{{asset_url('assets/core/images/icons/external_link.png','base_path')}}" alt="URL icon"></a></li>
              @endforeach
            </ul>
          </div>
        @endif
        @if(isset($related['other_vocabs'][0]))
          <div class="form-group">
            <label for="">More vocabularies related to {{htmlspecialchars($related['title'])}}</label>
            <ul class="list-unstyled">
              @foreach($related['other_vocabs'] as $other_vocab)
                <li><a target="_blank" href="{{base_url().'viewById/'.$other_vocab->getId()}}">{{htmlspecialchars($other_vocab->getTitle())}}</a></li>
              @endforeach
            </ul>
          </div>
        @endif
        @if(isset($related['vocab_id']))
          <div class="pull-right btn btn-link">
            <a href="{{base_url().'viewById/'.$related['vocab_id']}}" target="_blank">View vocabulary</a>
          </div>
        @endif
      </div>
    </div>
  </div>
</div>
