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

export class Marks {
  constructor() {
    this.xhr = new XHR();
    this.settings = new Settings();
    this.loading = new Loading();
    this.message = new Message();

    this.loadMarks = this.loadMarks.bind(this);
    this.getMarks = this.getMarks.bind(this);

    this.loadDetails = this.loadDetails.bind(this);
    this.getDetails = this.getDetails.bind(this);

  }

  loadMarks() {
    this.message.visible = false;
    this.loading.showLoading();
    let marks_div = document.querySelector('#wrapper');
    return this.getMarks()
      .then(terms => {
        if(window.location.pathname!=='/marks'){
          return false;
        }
        this.loading.hideLoading();
        console.log(terms);
        if(!terms){
          return;
        }
        for (let termName in terms) {
          if (terms.hasOwnProperty(termName)) {

            //add Term title
            let container = document.createElement('div');
            container.innerHTML = '';
            container.innerHTML += `<div class="marks_semester">
                                    ${termName}
                                  </div>`


            // add element for every course per Term
            for (let markId in terms[termName]) {
              if (terms[termName].hasOwnProperty(markId)) {
                // console.log(markId, terms[termName][markId])


                container.innerHTML += `
                            <button class="marks_course" id="${markId}">
                              <span><div class="courseName">${terms[termName][markId].title}</div> <div class="grade" aria-label="Grade ${terms[termName][markId].grade}. Click for detailed statistics">${terms[termName][markId].grade} <small> ></small></div></span>
                            </button>
                            `
              }
            }
            // container.addEventListener('click', this.displayDetails);
            marks_div.appendChild(container);
          }
        }
        return true;
      })
      .then( success => {
        if(!success){
          return;
        }
        console.log('Marks EventListeners');
        let btns = document.querySelectorAll('.marks_course');

        Array.from(btns).forEach(btn => {
          btn.addEventListener('click', this.loadDetails);
        })
      })
      .catch(err => console.error(err))
  }

  getMarks() {
    return this.settings.getUser()
      .then(values => {
        let username = values[0];
        let password = values[1];

        if(!username || !password){
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


              let terms = res.getElementsByTagName('Term');

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
                // retun JSON object
              resolve(marks);
            })
            .catch(err => console.error(err));
        });
      })
  }

  loadDetails(evt) {
    evt.stopPropagation();
    // find parentNode with the course-Id as ID
    let target = evt.target;
    while (target.id === '') {
      target = target.parentNode;
    }

    console.log(target);
    let message_name = target.querySelector('.courseName').innerHTML;
    console.log(message_name);
    //check if id is a number (should be!)
    if (isNaN(parseInt(target.id))) {
      return;
    }

    this.message.showMessage(message_name);

    // if web + IDB return nothing, display error after 10seconds
    let fallback = setTimeout(() => {
      this.message.setMessage('Error', 'Something went wrong, sorry :(')
    }, 10000);

    this.getDetails(target.id)
      .then(obj => {
        let msg = `
              <div class="mark_details">
              <div class="mark_detail"><span>Participants:</span> ${obj[target.id].participants || 0}</div>
              <div class="mark_detail"><span>Excellent:</span> ${obj[target.id].excellent || 0}</div>
              <div class="mark_detail"><span>Good:</span> ${obj[target.id].good || 0}</div>
              <div class="mark_detail"><span>Satisfactory:</span> ${obj[target.id].satisfactory || 0}</div>
              <div class="mark_detail"><span>Sufficient:</span> ${obj[target.id].sufficient || 0}</div>
              <div class="mark_detail"><span>Unsatisfactory:</span> ${obj[target.id].unsatisfactory || 0}</div>
              <div class="mark_detail"><span>Average:</span> ${obj[target.id].average}</div>
              </div>
              `
        this.message.setMessage(message_name, msg);

        // clear fallback error msg
        clearTimeout(fallback);
      });
  }

  getDetails(id) {
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

              let statistics = {};
              let participants = null;
              let excellent = null;
              let good = null;
              let satisfactory = null;
              let sufficient = null;
              let unsatisfactory = null;
              let average = null;

              // Not each Element has to be in the XML-Document -> check if not null
              let participantsEl = res.querySelector('Participants');
              if (participantsEl !== null) {
                participants = participantsEl.innerHTML;
              }

              let excellentEl = res.querySelector('Excellent');
              if (excellentEl !== null) {
                excellent = excellentEl.innerHTML;
              }

              let goodEl = res.querySelector('Good');
              if (goodEl !== null) {
                good = goodEl.innerHTML;
              }

              let satisfactoryEl = res.querySelector('Satisfactory');
              if (satisfactoryEl !== null) {
                satisfactory = satisfactoryEl.innerHTML;
              }

              let sufficientEl = res.querySelector('Sufficient');
              if (sufficientEl !== null) {
                sufficient = sufficientEl.innerHTML;
              }

              let unsatisfactoryEl = res.querySelector('Unsatisfactory');
              if (unsatisfactoryEl !== null) {
                unsatisfactory = unsatisfactoryEl.innerHTML;
              }

              let averageEl = res.querySelector('Average');
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

              resolve(statistics);
            })
            .catch(err => console.error(err));
        });


      })
  }
}