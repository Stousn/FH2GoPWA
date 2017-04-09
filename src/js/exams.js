"use strict";

import { XHR } from "./helpers/xhr.js";
import { Settings } from "./settings.js";
import { Loading } from "./helpers/loading.js";
import { Message } from "./helpers/message.js";
import { cfg } from "./config.js";
import { idbKeyval } from "./external/idb-keyval/idb-keyval.js";
import { CryptoJS } from "./external/cryptojslib/rollups/md5.js";
import { Toast } from "./helpers/toast.js";
import { XMLTransformer } from "./helpers/xmlTransformer.js";

export class Exams {
  constructor() {
    this.settings = new Settings();
    this.loading = new Loading();
    this.message = new Message();

    this.loadExams = this.loadExams.bind(this);
    this.getExamsFromWeb = this.getExamsFromWeb.bind(this);
    this.displayExams = this.displayExams.bind(this);
    this.addEventListenersBtns = this.addEventListenersBtns.bind(this);
    this.displayExamsDetails = this.displayExamsDetails.bind(this);
  }

  displayExams(exams) {
    let target = document.querySelector("#wrapper");
    for (let key in exams) {
      if (exams.hasOwnProperty(key)) {
        target.innerHTML += `<div class="schedule_day">${key}</div>`;

        for (let key2 in exams[key]) {
          if (exams[key].hasOwnProperty(key2)) {
            let temp_exam = exams[key][key2];
            // let btn = document.createElement('button');
            // btn.className = "exam";

            let template = `<button class="exam" id="${key2}">
                                    <div class="entry">
                                      <div class="time">${temp_exam.title}</div>
                                      <div class="detail">${temp_exam.dateStr}</div>
                                      <div class="detail">Register before: ${temp_exam.regUntilStr}</div>
                                    </div>
                                  </button>
                                  `;
            target.innerHTML += template;
          }
        }
      }
    }
  }

  addEventListenersBtns() {
    let btns = document.querySelectorAll(".exam");
    Array.from(btns).forEach(btn => {
      btn.addEventListener("click", this.displayExamsDetails);
    });
  }

  // middleware to get exams from web and idb
  // displays the fastest (idb normally) and updates
  // when new data from web arrives
  // updates only when data from web differs from idb-data
  loadExams() {
    this.message.visible = false;
    this.loading.showLoading();

    return new Promise((resolve, reject) => {
      this.getExamsFromWeb().then(exams => {
        if (window.location.pathname !== "/exams") {
          return false;
        }
        if (!exams) {
          return;
        }
        idbKeyval.get("hashExams").then(oldHash => {
          let newHash = CryptoJS.MD5(JSON.stringify(exams)).toString();
          console.log("hash?");
          if (oldHash !== newHash) {
            this.loading.hideLoading();
            this.displayExams(exams);
            Toast.showToast("new exams added");
            this.addEventListenersBtns();
            idbKeyval.set("hashExams", newHash);
            resolve(true);
          }
        });
      });

      this.getExamsFromDB().then(exams => {
        if (window.location.pathname !== "/exams") {
          return false;
        }
        if (!exams) {
          return;
        }
        this.loading.hideLoading();
        this.displayExams(exams);
        this.addEventListenersBtns();
        resolve(true);
      });
    });
  }

  getExamsFromDB() {
    return idbKeyval.get("exams").catch(err => {
      console.err(err);
    });
  }

  getExamsFromWeb() {
    return this.settings.getUser().then(values => {
      let username = values[0];
      let password = values[1];

      if (!username || !password) {
        this.message.showMessage("Sorry");
        this.message.setMessage(
          "Sorry",
          "You have to enter at least your username and password in the settings"
        );
        return;
      }
      // url and parameters
      let url = `https://ws.fh-joanneum.at/getexams.php?`;
      let params = `u=${username}&p=${password}&k=${cfg.key}`;

      return new Promise((resolve, reject) => {
        XHR.post(url, params)
          .then(res => {
            console.log(res);
            // res = document
            // get needed Information and parse to JSON
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

            let all_exams = XMLTransformer.transformExams(res);
            idbKeyval.set("exams", all_exams);

            resolve(all_exams);
          })
          .catch(err => console.err(err));
      });
    });
  }

  displayExamsDetails(evt) {
    console.log(evt.currentTarget);
  }
}
