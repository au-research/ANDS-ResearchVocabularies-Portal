@extends('layout/vocab_layout')
@section('content')
  <article>
    <section class="section swatch-gray">
      <div class="container element-short-top">
	<div class="row">
	  <div class="col-md-8">
	    <div class="panel swatch-white">
	      <div class="panel-heading">My Vocabs</div>
	      <div class="panel-body">
                <div align="center">
                  <p class="small center"> <span class="yellow_exclamation"><i class="fa fa-exclamation" style="color:#fff"></i></span>
                    Please review the <a href="https://documentation.ardc.edu.au/rva/research-vocabularies-australia-participant-agreem" target="_blank">Research Vocabularies Australia participant agreement</a> before you proceed.<br />
                  </p>
                </div>
                @if(count($affiliates) > 0)
		  <a role="button" href="{{ portal_url('vocabs/add') }}" class="btn btn-block btn-primary"><i class="fa fa-plus"></i> Add a new vocabulary from PoolParty</a>
                  <a role="button" href="{{ portal_url('vocabs/add#!/?skip=true') }}" class="btn btn-block btn-primary"><i class="fa fa-plus"></i> Add a new Vocabulary</a>
		@else
		  <br>
		  <div align="center">
		    <p class="small center">
		      Your account is not affiliated with an organisational role. Please contact <a href="mailto:services@ardc.edu.au">services@ardc.edu.au</a> for assistance.
		    </p>
		  </div>
		@endif
		<hr>
		@if(sizeof($ownedCount) == 0)
		  You don't own any vocabularies, start by adding a new one
		@else
		  <h5>Published Vocabularies</h5>
		  <table class="table">
		    <thead>
		      <tr><th>Vocabulary</th><th>Action</th></tr>
		    </thead>
		    <tbody>
		      @foreach($published as $vocab)
			<tr>
			  <td style="width:90%"><div class="published_title"><a href="{{ portal_url('vocabs/edit/'.$vocab->getId()) }}" ng-non-bindable>{{ htmlspecialchars($vocab->getTitle()) }}</a></div></td>
			  <td>
			    <div class="btn-group" style="display:inline-flex">
			      <a role="button"
				 href="{{ portal_url('viewById/'.$vocab->getId()) }}"
				 class="btn btn-primary"
				 style="float:none">
				<i class="fa fa-search"></i> View
			      </a>
			      <a role="button"
				 href="{{ portal_url('vocabs/edit/'.$vocab->getId()) }}"
				 class="btn btn-primary"
				 style="float:none">
				<i class="fa fa-edit"></i> Edit
			      </a>
			      <a role="button" tabindex="0"
				 class="btn btn-primary btn-primary-warning btn-non-rounded deleteVocab"
				 style="float:none"
				 vocab_id="{{ $vocab->getId() }}"
				 vocab_status="published"
				 vocab_owner="{{ htmlspecialchars($vocab->getOwner()) }}"
				 vocab_slug="{{ htmlspecialchars($vocab->getSlug()) }}"
				 vocab_title="{{ htmlspecialchars($vocab->getTitle()) }}"
				 delete_mode="current"
				 title="Delete this vocabulary">
				<i class="fa fa-trash"></i>
			      </a>
			    </div>
			  </td>
			</tr>
		      @endforeach
		    </tbody>
		  </table>

		  <h5>Drafts</h5>
		  <table class="table">
		    <thead>
		      <tr><th>Vocabulary</th><th>Action</th></tr>
		    </thead>
		    <tbody>
		      @foreach($draft as $vocab)
			<tr>
			  <td style="width:90%">
			    <div class="draft_title">
			      <a href="{{ portal_url('vocabs/edit/'.$vocab->getId()) }}" ng-non-bindable>{{ htmlspecialchars($vocab->getTitle()) }}</a>
			    </div>
			  </td>
                          <td>
			    <div class="btn-group" style="display:inline-flex">
			      <a role="button" href="{{ portal_url('vocabs/edit/'.$vocab->getId()) }}" class="btn btn-primary" style="float:none"><i class="fa fa-edit"></i> Edit</a>
			      <a role="button" tabindex="0" class="btn btn-primary btn-primary-warning btn-non-rounded deleteVocab" style="float:none" vocab_id="{{ $vocab->getId() }}" vocab_status="draft" vocab_owner="{{ htmlspecialchars($vocab->getOwner()) }}" vocab_slug="{{ htmlspecialchars($vocab->getSlug()) }}" vocab_title="{{ htmlspecialchars($vocab->getTitle()) }}" delete_mode="draft" title="Delete this vocabulary"><i class="fa fa-trash"></i></a>
			    </div>
			  </td>
			</tr>
		      @endforeach
		    </tbody>
		  </table>

		  <h5>Deprecated</h5>
		  <table class="table">
		    <thead>
		      <tr><th>Vocabulary</th><th>Action</th></tr>
		    </thead>
		    <tbody>
		      @foreach($deprecated as $vocab)
			<tr>
			  <td style="width:90%">
			    <div class="draft_title">
			      <a href="{{ portal_url('vocabs/edit/'.$vocab->getId()) }}" ng-non-bindable>{{ htmlspecialchars($vocab->getTitle()) }}</a>
			    </div>
			  </td>
			  <td>
			    <div class="btn-group" style="display:inline-flex">
			      <a role="button"
                                 href="{{ portal_url('viewById/'.$vocab->getId()) }}"
				 class="btn btn-primary"
				 style="float:none">
				<i class="fa fa-search"></i> View
			      </a>
			      <a role="button" href="{{ portal_url('vocabs/edit/'.$vocab->getId()) }}" class="btn btn-primary" style="float:none"><i class="fa fa-edit"></i> Edit</a>
			      <a role="button" tabindex="0" class="btn btn-primary btn-primary-warning btn-non-rounded deleteVocab" style="float:none" vocab_id="{{ $vocab->getId() }}" vocab_status="deprecated" vocab_owner="{{ htmlspecialchars($vocab->getOwner()) }}" vocab_slug="{{ htmlspecialchars($vocab->getSlug()) }}" vocab_title="{{ htmlspecialchars($vocab->getTitle()) }}" delete_mode="current" title="Delete this vocabulary"><i class="fa fa-trash"></i></a>
			    </div>
			  </td>
			</tr>
		      @endforeach
		    </tbody>
		  </table>
		@endif
	      </div>
	    </div>
	  </div>
	  <div class="col-md-4">
	    <div class="panel swatch-white">
	      <div class="panel-heading">Profile</div>
	      <div class="panel-body">
		<h5>{{ $this->user->name() }}</h5>
		<a role="button" href="{{ portal_url('vocabs/logout') }}" class="btn btn-danger">Logout</a>
	      </div>
	    </div>
	  </div>
	</div>
      </div>
    </section>
  </article>
@stop
