(function (namespace) {
  'use strict';

  namespace.GitHub = {
    getMe: function(token, cache) {
      var uri = '/user';
      var method = 'GET';

      return this._request(method, uri, token, false, cache);
    },
    getMyIssues: function(token, cache) {
      var uri = '/user/issues';
      var method = 'GET';

      return this._request(method, uri, token, false, cache);
    },
    _request: function(method, uri, token, data, cache) {
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();

        if (uri === '') {
          reject('Hey, you need a URI!');
        }

        var api_base = 'https://api.github.com';
        var path = api_base + uri;

        request.open(method, path, true);
        if (cache) {
          request.setRequestHeader('X-Cache', 'x-cache/only');
        } 
        request.setRequestHeader('Accept','application/vnd.github.v3.raw+json');
        request.setRequestHeader('Content-Type','application/json;charset=UTF-8');
        request.setRequestHeader('Authorization', 'token ' + token);

        request.onload = function stateChange() {
          if (request.status >= 200 && request.status < 300 || request.status === 304) {
            resolve(JSON.parse(request.responseText));
          } else {
            reject(request.status);
          }
        };

        if (data) {
          request.send(JSON.stringify(data));
        }
        else {
          request.send();
        }
      });
    }
  };

})(window);