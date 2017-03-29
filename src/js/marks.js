'use strict';

import {
  Settings
} from './settings.js';
import {
  XHR
} from './xhr.js';
import {
  Loading
} from './loading.js';
import {
  Message
} from './message.js';
import {
  cfg
} from './config.js';
import {
  CryptoJS
} from './external/cryptojslib/rollups/md5.js';
import {
  idbKeyval
} from './external/idb-keyval/idb-keyval.js';
import {
  Toast
} from './toast.js';

export class Marks {
  constructor() {
    this.xhr = new XHR();
    this.settings = new Settings();
    this.loading = new Loading();
    this.message = new Message();
    this.toast = new Toast();

    this.marksXMLtoJSON = this.marksXMLtoJSON.bind(this);
    this.detailsXMLtoJSON = this.detailsXMLtoJSON.bind(this);

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

  displayMarks(terms) {
    let marks_div = document.querySelector('#wrapper');
    marks_div.innerHTML = '';
    for (let termName in terms) {
      if (terms.hasOwnProperty(termName)) {

        //add Term title
        let container = document.createElement('div');
        container.innerHTML += `<div class="marks_semester">
                                    ${termName}
                                  </div>`


        // add element for every course per Term
        for (let markId in terms[termName]) {
          if (terms[termName].hasOwnProperty(markId)) {

            container.innerHTML += `
                            <button class="marks_course" id="${markId}">
                              <span><div class="courseName">${terms[termName][markId].title}</div> <div class="grade" aria-label="Grade ${terms[termName][markId].grade}. Click for detailed statistics">${terms[termName][markId].grade} <small> ></small></div></span>
                            </button>
                            `
          }
        }
        marks_div.appendChild(container);
      }
    }
  }

  addEventListenersBtns() {
    let btns = document.querySelectorAll('.marks_course');

    Array.from(btns).forEach(btn => {
      btn.addEventListener('click', this.loadDetails);
    })
  }

  getMarksFromDB() {
    return idbKeyval.get('marks')
      .catch(err => {
        console.log(err);
      })
  }

  // middleware to get marks from web and idb
  // displays the fastest (idb normally) and updates
  // when new data from web arrives
  // updates only when data from web differs from idb-data
  loadMarks() {
    this.loading.showLoading();
    return new Promise((resolve, reject) => {
      this.getMarksFromWeb()
        .then(marks => {
          if (window.location.pathname !== '/marks') {
            return false;
          }
          if (!marks) {
            return false;
          }
          idbKeyval.get('hashMarks')
            .then(oldHash => {
              let newHash = CryptoJS.MD5(JSON.stringify(marks)).toString();
              if (newHash !== oldHash) {
                this.loading.hideLoading();
                this.displayMarks(marks);
                this.toast.showToast('new marks added');
                this.addEventListenersBtns();
                idbKeyval.set('hashMarks', newHash);
                return true;
              }
            })
          resolve(true);
        })

      this.getMarksFromDB()
        .then(marks => {
          if (window.location.pathname !== '/marks') {
            return false;
          }
          if (!marks) {
            return false;
          }
          if (marks) {
            this.loading.hideLoading();
            this.displayMarks(marks);
            this.addEventListenersBtns();
            resolve(true);
          }
        })
    })
  }

  getMarksFromWeb() {
    this.message.visible = false;
    return this.settings.getUser()
      .then(values => {
        let username = values[0];
        let password = values[1];

        if (!username || !password) {
          this.message.showMessage('Sorry');
          this.message.setMessage('Sorry', 'You have to enter at least your username and password in the settings');
          return;
        }

        let url = `https://ws.fh-joanneum.at/getmarks.php`;
        let params = `u=${username}&p=${password}&k=${cfg.key}`;
        return new Promise((resolve, reject) => {
          this.xhr.post(url, params)
            .then(res => {

              let status = res.querySelector('Status');
              if (status.innerHTML != 'OK') {
                this.message.showMessage();
                this.message.setMessage('Oops!', 'Something went wrong, either your user/pass is incorrect or the Server has a problem. Sorry :(')
                this.loading.hideLoading();
                return;
              }

              let marks = this.marksXMLtoJSON(res);

              // hashing
              idbKeyval.set('marks', marks)
                .then(_ => {
                  // retun JSON object
                  resolve(marks);
                })
            })
            .catch(err => console.error(err));
        });
      })
  }

  marksXMLtoJSON(xml) {
    let terms = xml.getElementsByTagName('Term');

    let marks = {};

    Array.from(terms).forEach(term => {
      let termName = term.getAttribute('name');

      if (termName == 'Wichtige Meldung') {
        reject('Serverside Problem / Wrong User/Pass');
      }

      let courses = term.getElementsByTagName('Course');
      marks[termName] = {};
      Array.from(courses).forEach(course => {
        let courseTitle = course.querySelector('Title').innerHTML;
        let courseGrade = course.querySelector('Grade').innerHTML;
        let markId = course.querySelector('MarkId').innerHTML;
        marks[termName][markId] = {
          title: courseTitle,
          grade: courseGrade
        };
      });


    })

    return marks;
  }

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
              `
    this.message.setMessage(undefined, msg);
  }

  loadDetails(evt) {
    evt.stopPropagation();
    // make sure it's always the button
    let target = evt.currentTarget;

    return new Promise((resolve, reject) => {
      let message_name = target.querySelector('.courseName').innerHTML;
      //check if id is a number (should be!)
      if (isNaN(parseInt(target.id))) {
        return;
      }

      this.message.showMessage(message_name);

      // if web/DB return nothing, display error after 10seconds
      let fallback = setTimeout(() => {
        this.message.setMessage('Error', 'Something went wrong, sorry :(')
      }, 10000);

      this.getDetailsFromWeb(target.id)
        .then(obj => {
          idbKeyval.get('hashMarkDetails'+target.id)
            .then(oldHash => {
              let newHash = CryptoJS.MD5(JSON.stringify(obj)).toString();
              console.log('hash?');
              if (oldHash !== newHash) {
                this.displayDetails(obj, target.id);
                clearTimeout(fallback);
                idbKeyval.set('hashMarkDetails'+target.id, newHash);
                resolve(true);
              }
            })
        });

      this.getDetailsFromDB(target.id)
        .then(obj => {
          if (obj) {
            this.displayDetails(obj, target.id);
            clearTimeout(fallback);
            resolve(true);
          }
        })

    })
  }

  detailsXMLtoJSON(xml, id) {
    let statistics = {};
    let participants = null;
    let excellent = null;
    let good = null;
    let satisfactory = null;
    let sufficient = null;
    let unsatisfactory = null;
    let average = null;

    // Not each Element has to be in the XML-Document -> check if not null
    let participantsEl = xml.querySelector('Participants');
    if (participantsEl !== null) {
      participants = participantsEl.innerHTML;
    }

    let excellentEl = xml.querySelector('Excellent');
    if (excellentEl !== null) {
      excellent = excellentEl.innerHTML;
    }

    let goodEl = xml.querySelector('Good');
    if (goodEl !== null) {
      good = goodEl.innerHTML;
    }

    let satisfactoryEl = xml.querySelector('Satisfactory');
    if (satisfactoryEl !== null) {
      satisfactory = satisfactoryEl.innerHTML;
    }

    let sufficientEl = xml.querySelector('Sufficient');
    if (sufficientEl !== null) {
      sufficient = sufficientEl.innerHTML;
    }

    let unsatisfactoryEl = xml.querySelector('Unsatisfactory');
    if (unsatisfactoryEl !== null) {
      unsatisfactory = unsatisfactoryEl.innerHTML;
    }

    let averageEl = xml.querySelector('Average');
    if (averageEl !== null) {
      average = averageEl.innerHTML;
    }

    statistics[id] = {
      participants: participants,
      excellent: excellent,
      good: good,
      satisfactory: satisfactory,
      sufficient: sufficient,
      unsatisfactory: unsatisfactory,
      average: average
    };

    return statistics;
  }

  getDetailsFromWeb(id) {
    return this.settings.getUser()
      .then(values => {
        let username = values[0];
        let password = values[1];

        let params = `u=${username}&p=${password}&id=${id}&k=${cfg.key}`;
        return new Promise((resolve, reject) => {
          this.xhr.post('https://ws.fh-joanneum.at/getstatistics.php', params)
            .then(res => {
              let status = res.querySelector('Status');
              if (status.innerHTML != 'OK') {
                this._message.showMessage('Oops!', 'Something went wrong, either your user/pass is incorrect or the Server has a problem. Sorry :(')
                return;
              }

              let statistics = this.detailsXMLtoJSON(res, id);
              idbKeyval.set('markDetails' + id, statistics);

              resolve(statistics);
            })
            .catch(err => console.error(err));
        });


      })
  }

  getDetailsFromDB(id) {
    return idbKeyval.get('markDetails' + id)
      .catch(err => {
        console.log(err);
      })
  }
}