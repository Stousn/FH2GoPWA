'use strict'

export class XHR {
  constructor() {
  }
  // XMLHttpRequest GET -> Promise-based
  get(url) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('GET', url);
      request.responseType = 'document';
      request.onload = function() {
        if (request.status === 200) {
          resolve(request.response);
        } else {
          reject(Error('Something went wrong:' + request.statusText));
        }
      };
      request.onerror = function() {
        reject(Error('An Error occured while requesting the document'));
      };
      request.send();
    });
  }

  // XMLHttpRequest POST -> Promise
  post(url, params){
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('POST', url);
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      request.responseType = 'document';
      request.onload = function() {
        if (request.status === 200) {
          resolve(request.response);
        } else {
          reject(Error('Something went wrong:' + request.statusText));
        }
      };
      request.onerror = function() {
        reject(Error('An Error occured while requesting the document'));
      };
      request.send(params);
    });
  }
}
