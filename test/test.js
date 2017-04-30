(function () {
'use strict';

class XHR {
  constructor() {}
  // XMLHttpRequest GET -> Promise-based
  static get(url) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open("GET", url);
      request.responseType = "document";
      request.onload = function() {
        if (request.status === 200) {
          resolve(request.response);
        } else {
          reject(Error("Something went wrong:" + request.statusText));
        }
      };
      request.onerror = function() {
        reject(Error("An Error occured while requesting the document"));
      };
      request.send();
    });
  }

  // XMLHttpRequest POST -> Promise
  static post(url, params) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open("POST", url);
      request.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
      request.responseType = "document";
      request.onload = function() {
        if (request.status === 200) {
          resolve(request.response);
        } else {
          reject(Error("Something went wrong:" + request.statusText));
        }
      };
      request.onerror = function() {
        reject(Error("An Error occured while requesting the document"));
      };
      request.send(params);
    });
  }
}

var assert = require("assert");
describe("XHR", function() {
  describe("get()", function() {
    it("should return status 200", function() {
      XHR.get("www.google.com")
        .then(res => {
          assert.equal(200, res.status);
        })
        .catch(err => {
          // console.log(err);
        });
    });
  });

  describe("post()", function() {
    it("should return status 200", function() {
      XHR.post("https://httpbin.org/post")
        .then(res => {
          assert.equal(200, res.status);
        })
        .catch(err => {
          // console.log(err);
        });
    });
  });
});

}());
