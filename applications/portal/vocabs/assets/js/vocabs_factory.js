/**
 * Vocabulary ANGULARJS Factory
 * A component that deals with the vocabulary service point directly
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
(function () {
    'use strict';

    angular
        .module('app')
        .factory('vocabs_factory', function ($http) {
            return {

                req: function (id) {
                    var url = registry_api_url + '/api/resource/vocabularies/';
                    if (id) {
                        url += id;
                    }
                    return {
                        method: 'GET',
                        url: url,
                        headers: {
                            'ands_authentication': readCookie('ands_authentication')
                        },
                        data: {}
                    }
                },

                getAll: function () {
                    return $http.get(base_url + 'vocabs/services/vocabs').then(function (response) {
                        return response.data;
                    });
                },
                getAllWidgetable: function () {
                    var filters = {
                        widgetable: true,
                        // FIXME change the controller to
                        // support a "no limit" option, rather
                        // than having to specify this here.
                        pp: 1000000
                    }
                    return this.search(filters);
                },
                add: function (data) {
                    // console.log('saving', data);
                    // return $http.post(base_url + 'vocabs/services/vocabs', {data: data}).then(function (response) {
                    //     return response.data;
                    // });
                },
                get: function (slug) {
                    return $http.get(base_url + 'vocabs/services/vocabs/' + slug).then(function (response) {
                        return response.data;
                    });
                },

                // new save function for registry api
                save: function (data) {

                    console.log("Saving", data);

                    var req = this.req(data.id);
                    req.method = 'PUT';
                    req.data = data;

                    return $http(req).then(function (response) {
                        return response.data;
                    });
                },

                // pack relevant data in order to be used with registry api
                pack: function (vocab) {

                    return {
                        id: parseInt(vocab.id),
                        title: vocab.title,
                        status: vocab.status,
                        owner: vocab.owner,
                        slug: vocab.slug,
                        'primary-language': vocab.language[0],
                        'top-concept': vocab.top_concept,
                        acronym: vocab.acronym,
                        note: vocab.note,
                        description: vocab.description,
                        subject: vocab.subjects.map(function(subj) {
                            return {
                                source: subj.subject_source,
                                label: subj.subject_label,
                                notation: subj.subject_notation,
                                iri: subj.subject_iri
                            }
                        }),
                        'related-entity-ref': vocab.related_entity.map(function(rel) {
                            return {
                                relation: rel.relationship,
                                id: rel.id,
                                'related-entity': {
                                    'related-entity-identifier': rel.identifiers.map(function(rei) {
                                        return {
                                            id: 0,
                                            'identifier-type': rei.rei_type,
                                            'identifier-value': rei.rei_value
                                        }
                                    })
                                }
                            }
                        })
                    }
                },

                // deprecated
                modify: function (slug, data) {
                    return $http.post(base_url + 'vocabs/services/vocabs/' + slug, {data: data}).then(function (response) {
                        return response.data;
                    });
                },
                search: function (filters) {
                    return $http.post(base_url + 'vocabs/filter', {filters: filters}).then(function (response) {
                        return response.data;
                    });
                },
                toolkit: function (req) {
                    return $http.get(base_url + 'vocabs/toolkit?request=' + req).then(function (response) {
                        return response.data;
                    });
                },
                getMetadata: function (id) {
                    return $http.get(base_url + 'vocabs/toolkit?request=getMetadata&ppid=' + id).then(function (response) {
                        return response.data;
                    });
                },
                suggest: function (type) {
                    return $http.get(base_url + 'vocabs/services/vocabs/all/related?type=' + type).then(function (response) {
                        return response.data;
                    });
                },
                user: function () {
                    return $http.get(base_url + 'vocabs/services/vocabs/all/user').then(function (response) {
                        return response.data;
                    });
                }
            }
        });
})();
