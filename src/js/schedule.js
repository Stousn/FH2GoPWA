"use strict";

import { XHR } from "./helpers/xhr.js";
import { Settings } from "./settings.js";
import { Message } from "./helpers/message.js";
import { Loading } from "./helpers/loading.js";
import { cfg } from "./config.js";
import { CryptoJS } from "./external/cryptojslib/rollups/md5.js";
import { idbKeyval } from "./external/idb-keyval/idb-keyval.js";
import { Toast } from "./helpers/toast.js";
import { XMLTransformer } from "./helpers/xmlTransformer.js";

export class Schedule {
  constructor() {
    this.settings = new Settings();
    this.message = new Message();
    this.loading = new Loading();
    // bind context to functions
    this.loadSchedule = this.loadSchedule.bind(this);
    this.getScheduleFromWeb = this.getScheduleFromWeb.bind(this);
    this.getScheduleFromDB = this.getScheduleFromDB.bind(this);
    this.displaySchedule = this.displaySchedule.bind(this);
  }

  // loads schedule into DOM
  displaySchedule(schedule) {
    // helper-function: add leading Zero to Numbers < 10
    function addZero(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }

    let today = new Date();
    let target = document.querySelector("#wrapper");
    let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let tempDay = -1;
    // for each entry
    for (let i in schedule) {
      // get start & end Date
      let start = new Date(parseInt(schedule[i].start) * 1000);
      let end = new Date(parseInt(schedule[i].end) * 1000);

      // if course is in the past -> skip
      if (
        start.getDate() < today.getDate() &&
        start.getMonth() < today.getMonth() &&
        start.getFullYear() <= today.getFullYear()
      ) {
        console.log(
          start.getDate(),
          today.getDate(),
          start.getMonth(),
          today.getMonth()
        );
        console.log("skip");
        continue;
      }

      let dayforAriaLabel = "";
      // insert once per Day
      if (tempDay == -1 || tempDay != start.getDate()) {
        if (
          start.getDate() == today.getDate() &&
          start.getMonth() == today.getMonth() &&
          start.getFullYear() == today.getFullYear()
        ) {
          target.innerHTML += `
                                    <div class="schedule_day">TODAY!</div>
                                  `;
          dayforAriaLabel = "Today";
        } else {
          target.innerHTML += `
                                        <div class="schedule_day">${start.getDate()}.${start.getMonth() + 1} - ${dayNames[start.getDay()]}</div>
                                      `;

          dayforAriaLabel = `${dayNames[start.getDay()]} the ${start.getDate()}.${start.getMonth() + 1}`;
        }

        tempDay = start.getDate();
      }

      // Template
      target.innerHTML += `<div class="entry" tabindex="0" aria-label="${dayforAriaLabel}, ${schedule[i].title} in Room ${schedule[i].location} with ${schedule[i].lecturer} from  ${addZero(start.getHours())}:${addZero(start.getMinutes())} to ${addZero(end.getHours())}:${addZero(end.getMinutes())}">
                              <div class="time">
                                ${addZero(start.getHours())}:${addZero(start.getMinutes())} - ${addZero(end.getHours())}:${addZero(end.getMinutes())}
                              </div>
                              <div class="detail">
                                ${schedule[i].title} / ${schedule[i].type} /  ${schedule[i].lecturer} / ${schedule[i].location}
                              </div>
                            </div>
                            `;
    }
  }

  // get data, and show loading spinner while doing so
  loadSchedule() {
    this.message.visible = false;
    this.loading.showLoading();

    return new Promise((resolve, reject) => {
      this.getScheduleFromWeb().then(schedule => {
        if (window.location.pathname !== "/schedule") {
          return false;
        }
        if (!schedule) {
          return;
        }
        this.loading.hideLoading();
        this.displaySchedule(schedule);
        resolve(true);
      });
    });
  }
  // fetches data from web
  getScheduleFromWeb() {
    // get needed info
    return this.settings.getUser().then(values => {
      let dep = values[2];
      let year = values[3];
      let group = values[4];
      // check if needed info is available -> if not show error msg
      if (!dep || !year) {
        this.message.showMessage("Sorry");
        this.message.setMessage(
          "Sorry",
          "You have to enter at least your department and year in the settings"
        );
        return;
      }
      // fetch data
      let url = `https://ws.fh-joanneum.at/getschedule.php?c=${dep}&y=${year}&k=${cfg.key}`;
      return new Promise((resolve, reject) => {
        XHR.get(url)
          .then(res => {
            // check status -> show error msg if not ok
            let status = res.querySelector("Status");
            if (status.innerHTML != "OK") {
              this.message.showMessage();
              this.message.setMessage(
                "Oops!",
                "Something went wrong, either your user/pass is incorrect or the Server has a problem. Sorry :("
              );
              return;
            }
            // transform xml response to json-object
            let schedule = XMLTransformer.transformSchedule(res, group);
            idbKeyval.set("schedule", schedule).then(_ => {
              resolve(schedule);
            });
          })
          .catch(err => console.error("Test", err));
      });
    });
  }
  //get schedule-data from a local storage -> not in use yet
  getScheduleFromDB() {
    return idbKeyval.get("schedule").catch(err => console.err(err));
  }
}
