var assert = require("assert");
git;
import { XHR } from "../src/js/helpers/xhr.js";
import { Toast } from "../src/js/helpers/toast.js";

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
