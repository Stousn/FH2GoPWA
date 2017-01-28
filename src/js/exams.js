'use strict';

import {
  XHR
} from './xhr.js';
import {
  Settings
} from './settings.js';
import {
  Loading
} from './loading.js';
import {
  Message
} from './message.js';
import {
  cfg
} from './config.js';

export class Exams {
  constructor() {
    this.xhr = new XHR();
    this.settings = new Settings();
    this.loading = new Loading();
    this.message = new Message();

    this.loadExams = this.loadExams.bind(this);
    this.getExams = this.getExams.bind(this);
  }

  loadExams() {
    this.message.visible = false;
    this.loading.showLoading();
    let target = document.querySelector('#wrapper');
    return this.getExams()
    .then( exams => {
      if(window.location.pathname!=='/exams'){
        return false;
      }
      this.loading.hideLoading();

      if(!exams){
        return;
      }
      for(let key in exams){
        if(exams.hasOwnProperty(key)){
          target.innerHTML += `<div class="schedule_day">${key}</div>`;

          for(let key2 in exams[key]){
            if(exams[key].hasOwnProperty(key2)){
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
                              `
              target.innerHTML += template;
            }
          }
        }
      }
      return true;
    })
    .then( success => {
      if(!success){
        return;
      }
      let btns = document.querySelectorAll('button');
      Array.from(btns).forEach(btn => {
        if(btn.id.startsWith('exam')){
          btn.addEventListener('click', this.displayExamsDetails);
        }
      })
    })
    .catch(err => console.log(err));

  }

  getExams() {
    return this.settings.getUser()
      .then(values => {
        let username = values[0];
        let password = values[1];

        if(!username || !password){
          this.message.showMessage('Sorry');
          this.message.setMessage('Sorry', 'You have to enter at least your username and password in the settings');
          return;
        }

        let all_exams = {};
        // url and parameters
        let url = `https://ws.fh-joanneum.at/getexams.php?`;
        let params = `u=${username}&p=${password}&k=${cfg.key}`;

        return new Promise((resolve, reject) => {
          this.xhr.post(url, params)
          .then(res => {
            console.log(res);
            // res = document
            // get needed Information and parse to JSON
            let terms = res.querySelectorAll('Term');
            let status = res.querySelector('Status');

            if (status.innerHTML != 'OK') {
              this.message.showMessage();
              this.message.setMessage('Oops!', 'Something went wrong, either your user/pass is incorrect or the Server has a problem. Sorry :(')
              this.loading.hideLoading();
              return;
            }

            Array.from(terms).forEach(term => {
              let termName = term.getAttribute('name')
              let exams = term.querySelectorAll('Exam');
              all_exams[termName] = {};
              Array.from(exams).forEach(exam => {
                let examId = exam.querySelector('Id').innerHTML;
                let examTitle = exam.querySelector('Title').innerHTML;
                let examType = exam.querySelector('Type').innerHTML;
                let examMode = exam.querySelector('Mode').innerHTML;
                let examDate = exam.querySelector('DateUnix').innerHTML;
                let examRegUntil = exam.querySelector('RegistrationEndUnix').innerHTML;
                let examState = exam.querySelector('ExamStatus').innerHTML;
                let examDateStr = exam.querySelector('Date').innerHTML;
                let examRegUntilStr = exam.querySelector('RegistrationEnd').innerHTML;

                all_exams[termName][examTitle+examDate] = {
                  title: examTitle,
                  type: examType,
                  mode: examMode,
                  date: examDate,
                  regUntil: examRegUntil,
                  state: examState,
                  dateStr: examDateStr,
                  regUntilStr: examRegUntilStr
                };
              });
            });

            resolve(all_exams);
          })
          .catch(err => console.log(err));
      });
      })
  }


}