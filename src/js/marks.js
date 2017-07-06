"use strict";

import { Settings } from "./settings.js";
import { XHR } from "./helpers/xhr.js";
import { Loading } from "./helpers/loading.js";
import { Message } from "./helpers/message.js";
import { cfg } from "./config.js";
import { CryptoJS } from "./external/cryptojslib/rollups/md5.js";
import { idbKeyval } from "./external/idb-keyval/idb-keyval.js";
import { Toast } from "./helpers/toast.js";
import { XMLTransformer } from "./helpers/xmlTransformer.js";

export class Marks {
  constructor() {
    this.settings = new Settings();
    this.loading = new Loading();
    this.message = new Message();
    // bind context to functions
    this.loadMarks = this.loadMarks.bind(this);
    this.displayMarks = this.displayMarks.bind(this);
    this.addEventListenersBtns = this.addEventListenersBtns.bind(this);
    this.getMarksFromDB = this.getMarksFromDB.bind(this);
    this.getMarksFromWeb = this.getMarksFromWeb.bind(this);

    this.loadDetails = this.loadDetails.bind(this);
    this.displayDetails = this.displayDetails.bind(this);
    this.getDetailsFromWeb = this.getDetailsFromWeb.bind(this);
    this.getDetailsFromDB = this.getDetailsFromDB.bind(this);
  }
  // displays given terms in a pre-defined html-template
  displayMarks(terms) {
    let marks_div = document.querySelector("#wrapper");
    marks_div.innerHTML = "";
    for (let termName in terms) {
      if (terms.hasOwnProperty(termName)) {
        //add Term title
        let container = document.createElement("div");
        container.innerHTML += `<div class="marks_semester">
                                    ${termName}
                                  </div>`;

        // add element for every course per Term
        for (let markId in terms[termName]) {
          if (terms[termName].hasOwnProperty(markId)) {
            container.innerHTML += `
                            <button class="marks_course" id="${markId}">
                              <span><div class="courseName">${terms[termName][markId].title}</div> <div class="grade" aria-label="Grade ${terms[termName][markId].grade}. Click for detailed statistics">${terms[termName][markId].grade} <small> ></small></div></span>
                            </button>
                            `;
          }
        }
        marks_div.appendChild(container);
      }
    }
  }
  // add Eventlisteners for each mark to display additional info when clicked
  addEventListenersBtns() {
    let btns = document.querySelectorAll(".marks_course");

    Array.from(btns).forEach(btn => {
      btn.addEventListener("click", this.loadDetails);
    });
  }
  // not used atm
  getMarksFromDB() {
    return idbKeyval.get("marks").catch(err => {
      console.log(err);
    });
  }

  // get marks and show loading spinner while fetching and display marks when done fetching
  loadMarks() {
    this.loading.showLoading();
    return new Promise((resolve, reject) => {
      this.getMarksFromWeb().then(marks => {
        if (window.location.pathname !== "/marks") {
          return false;
        }
        if (!marks) {
          return false;
        }

        this.loading.hideLoading();
        this.displayMarks(marks);
        Toast.showToast("new marks added");
        this.addEventListenersBtns();
        resolve(true);
      });
    });
  }
  // load marks from the web + transform it to json
  getMarksFromWeb() {
    this.message.visible = false;
    // get needed info
    return this.settings.getUser().then(values => {
      let username = values[0];
      let password = values[1];
      // show error msg if user+pw is not set
      if (!username || !password) {
        this.message.showMessage("Sorry");
        this.message.setMessage(
          "Sorry",
          "You have to enter at least your username and password in the settings"
        );
        return;
      }
      // fetch data
      let url = `https://ws.fh-joanneum.at/getmarks.php`;
      let params = `u=${username}&p=${password}&k=${cfg.key}`;
      return new Promise((resolve, reject) => {
        XHR.post(url, params)
          .then(res => {
          //check status
            let status = res.querySelector("Status");
            if (status.innerHTML != "OK") {
              this.message.showMessage();
              this.message.setMessage(
                "Oops!",
                "Something went wrong, either your user/pass is incorrect or the Server has a problem. Sorry :("
              );
              this.loading.hideLoading();
              return;
            }
            // transform xml to json-object
            let marks = XMLTransformer.transformMarks(res);

            // save to local storage (not needed atm)
            idbKeyval.set("marks", marks).then(_ => {
              // retun JSON object
              resolve(marks);
            });
          })
          .catch(err => console.error(err));
      });
    });
  }
  // displays more details to a mark
  displayDetails(obj, id) {
    let msg = `
              <div class="mark_details">
              <div class="mark_detail"><span>Participants:</span> ${obj[id].participants || 0}</div>
              <div class="mark_detail"><span>Excellent:</span> ${obj[id].excellent || 0}</div>
              <div class="mark_detail"><span>Good:</span> ${obj[id].good || 0}</div>
              <div class="mark_detail"><span>Satisfactory:</span> ${obj[id].satisfactory || 0}</div>
              <div class="mark_detail"><span>Sufficient:</span> ${obj[id].sufficient || 0}</div>
              <div class="mark_detail"><span>Unsatisfactory:</span> ${obj[id].unsatisfactory || 0}</div>
              <div class="mark_detail"><span>Average:</span> ${obj[id].average}</div>
              </div>
              `;
    this.message.setMessage(undefined, msg);
  }
  // gets additional info and displays it
  loadDetails(evt) {
    evt.stopPropagation();
    // make sure it's always the button and not a surrounding element
    let target = evt.currentTarget;

    return new Promise((resolve, reject) => {
      let message_name = target.querySelector(".courseName").innerHTML;
      //check if id is a number (should be!)
      if (isNaN(parseInt(target.id))) {
        return;
      }

      this.message.showMessage(message_name);

      // if web/DB return nothing, display error after 10seconds
      let fallback = setTimeout(
        () => {
          this.message.setMessage("Error", "Something went wrong, sorry :(");
        },
        10000
      );
      // get data from web / compare it to local-version and updates show info, only if data from the web is newer
      this.getDetailsFromWeb(target.id).then(obj => {
        idbKeyval.get("hashMarkDetails" + target.id).then(oldHash => {
          let newHash = CryptoJS.MD5(JSON.stringify(obj)).toString();
          console.log("hash?");
          if (oldHash !== newHash) {
            this.displayDetails(obj, target.id);
            clearTimeout(fallback);
            idbKeyval.set("hashMarkDetails" + target.id, newHash);
            resolve(true);
          }
        });
      });
      // get data from the web
      this.getDetailsFromDB(target.id).then(obj => {
        if (obj) {
          this.displayDetails(obj, target.id);
          clearTimeout(fallback);
          resolve(true);
        }
      });
    });
  }
  // loads details-data from web
  getDetailsFromWeb(id) {
    // get needed info
    return this.settings.getUser().then(values => {
      let username = values[0];
      let password = values[1];
      // no need to check if user + pass is set, because, if its not set -> no marks get displays -> no details either
      let params = `u=${username}&p=${password}&id=${id}&k=${cfg.key}`;
      // fetch data from web
      return new Promise((resolve, reject) => {
        XHR.post("https://ws.fh-joanneum.at/getstatistics.php", params)
          .then(res => {
          // check status of response
            let status = res.querySelector("Status");
            if (status.innerHTML != "OK") {
              this._message.showMessage(
                "Oops!",
                "Something went wrong, either your user/pass is incorrect or the Server has a problem. Sorry :("
              );
              return;
            }
            // transform xml to json-object
            let statistics = XMLTransformer.transformMarksDetails(res, id);
            idbKeyval.set("markDetails" + id, statistics);

            resolve(statistics);
          })
          .catch(err => console.error(err));
      });
    });
  }
  // get Details from a local storage
  getDetailsFromDB(id) {
    return idbKeyval.get("markDetails" + id).catch(err => {
      console.log(err);
    });
  }
}
