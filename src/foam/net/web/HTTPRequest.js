/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.net.web',
  name: 'HTTPRequest',

  requires: [
    'foam.net.web.HTTPResponse',
    'foam.blob.Blob',
    'foam.blob.BlobBlob'
  ],
  mixins: [
    'foam.nanos.analytics.Analyticable'
  ],

  topics: [
    'data'
  ],

  messages: [
    { name: 'GENERAL_ERROR', message: 'Network Error, please check your connection and try again.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'hostname'
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      class: 'String',
      name: 'protocol',
      preSet: function(old, nu) {
        return nu.replace(':', '');
      }
    },
    {
      class: 'String',
      name: 'path',
      preSet: function(old, nu) {
        if ( ! nu.startsWith('/') ) return '/' + nu;
        return nu;
      }
    },
    {
      class: 'String',
      name: 'url'
    },
    {
      class: 'String',
      name: 'method',
      value: 'GET'
    },
    {
      class: 'Map',
      name: 'headers'
    },
    {
      name: 'payload'
    },
    {
      // TODO: validate acceptable types
      class: 'String',
      name: 'responseType',
      value: 'text'
    },
    {
      class: 'String',
      name: 'contentType',
      factory: function() { return this.responseType; }
    },
    {
      class: 'String',
      name: 'mode',
      value: 'cors'
    },
    {
      class: 'Boolean',
      name: 'cache'
    },
    {
      class: 'Int',
      name: 'timeout',
      value: 3000
    },
    {
      class: 'Int',
      name: 'maxRetries',
      value: 3
    }
  ],

  methods: [
    function fromUrl(url) {
      var u = new URL(url);
      this.protocol = u.protocol.substring(0, u.protocol.length-1);
      this.hostname = u.hostname;
      if ( u.port ) this.port = u.port;
      this.path = u.pathname + u.search;
      return this;
    },

    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }
      this.addContentHeaders();

      if ( this.cache ) {
        this.headers['Cache-Control'] = 'public';
      } else {
        this.headers['Pragma'] = 'no-cache';
        this.headers['Cache-Control'] = 'no-cache, no-store';
      }

      var self = this;

      var headers = new Headers();
      for ( var key in this.headers ) {
        headers.set(key, this.headers[key]);
      }

      var options = {
        method: this.method,
        headers: headers,
        mode: this.mode,
        redirect: "follow",
        credentials: "same-origin"
      };

      if ( this.payload ) {
        if ( this.BlobBlob.isInstance(this.payload) ) {
          options.body = this.payload.blob;
        } else if ( this.Blob.isInstance(this.payload) ) {
          foam.assert(false, 'TODO: Implemented sending of foam.blob.Blob over HTTPRequest.');
        } else {
          options.body = this.payload;
        }
      }

      var retries = 0;
      function fetchResponse() {
        var resp;
        var request = new Request(
          ( self.protocol ? ( self.protocol + '://' ) : '' ) +
          self.hostname +
          ( self.port ? ( ':' + self.port ) : '' ) +
          self.path,
          options);
        return fetch(request).then(res => {
          resp = self.HTTPResponse.create({
            resp: res,
            responseType: self.responseType
          });
          if ( resp.success ) {
            return resp;
          }
          return Promise.reject(resp);
        }).catch( err => {
          if ( retries >= self.maxRetries ) {
            throw new Error(self.GENERAL_ERROR + err);
          } else {
            retries += 1;
            console.log(retries);
            return new Promise(resolve => setTimeout(resolve, self.timeout))
                      .then(fetchResponse());
          }
        });
      }
      return fetchResponse();
    },

    function addContentHeaders() {
      // Specify Content-Type header when it can be deduced.
      if ( ! this.headers['Content-Type'] ) {
        switch ( this.contentType ) {
          case 'text':
          this.headers['Content-Type'] = 'text/plain';
          break;
          case 'json':
          this.headers['Content-Type'] = 'application/json';
          break;
          case 'url':
          this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          break;
        }
      }
      // Specify this.contentType when it can be deduced.
      if ( ! this.headers['Accept'] ) {
        switch ( this.contentType ) {
          case 'json':
          this.headers['Accept'] = 'application/json';
          break;
        }
      }
    }
  ]
});
