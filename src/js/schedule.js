'use strict';

import { XHR } from './xhr.js';
import { Settings } from './settings.js';
import { Message } from './message.js';
import { Loading } from './loading.js';
import { cfg } from './config.js';

export class Schedule {
  constructor(){
    this.xhr = new XHR();
    this.settings = new Settings();
    this.message = new Message();
    this.loading = new Loading();

    this.loadSchedule = this.loadSchedule.bind(this);
    this.getSchedule = this.getSchedule.bind(this);
  }

  loadSchedule(){
    this.message.visible = false;
    this.loading.showLoading();

     // add Zero to Numbers < 10
    function addZero(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }

    let today = new Date();
    let target = document.querySelector('#wrapper');
    let dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


    return this.getSchedule()
    .then(schedule => {
      if(window.location.pathname!=='/schedule'){
        return false;
      }
      this.loading.hideLoading();
      if(!schedule){
        return;
      }
        let tempDay = -1;
        // for each entry
        for (let i in schedule) {
          // get start & end Date
          let start = new Date(parseInt(schedule[i].start) * 1000);
          let end = new Date(parseInt(schedule[i].end) * 1000);

          // if course is in the past -> skip
          if (start.getDate() < today.getDate() && start.getMonth() < today.getMonth() && start.getFullYear() <= today.getFullYear()) {
            console.log(start.getDate(),today.getDate(),start.getMonth(),today.getMonth())
            console.log('skip')
            continue;
          }

          let dayforAriaLabel = '';
          // insert once per Day
          if (tempDay == -1 || tempDay != start.getDate()) {
            if(start.getDay() == today.getDay() && start.getMonth() == today.getMonth() && start.getFullYear() == today.getFullYear()){
              target.innerHTML += `
                                    <div class="schedule_day">TODAY!</div>
                                  `
              dayforAriaLabel = "Today";
                          
            } else {
              target.innerHTML += `
                                        <div class="schedule_day">${start.getDate()}.${start.getMonth()+1} - ${dayNames[start.getDay()]}</div>
                                      `

              dayforAriaLabel = `${dayNames[start.getDay()]} the ${start.getDate()}.${start.getMonth()+1}`
            }

            
            tempDay = start.getDate();
          }

          // Template
          target.innerHTML += `<div class="entry" aria-label="${dayforAriaLabel}, ${schedule[i].title} in Room ${schedule[i].location} with ${schedule[i].lecturer} from  ${addZero(start.getHours())}:${addZero(start.getMinutes())} to ${addZero(end.getHours())}:${addZero(end.getMinutes())}">
                              <div class="time">
                                ${addZero(start.getHours())}:${addZero(start.getMinutes())} - ${addZero(end.getHours())}:${addZero(end.getMinutes())}
                              </div>
                              <div class="detail">
                                ${schedule[i].title} / ${schedule[i].type} /  ${schedule[i].lecturer} / ${schedule[i].location}
                              </div>
                            </div>
                            `;
        }
        
        return true;
      })
      .catch(err => {
        console.log('Error-Test', err)
      })
  }

  getSchedule(){
    return this.settings.getUser()
    .then(values => {
      let dep = values[2];
      let year = values[3];
      let group = values[4];

      if(!dep || !year){
        this.message.showMessage('Sorry');
        this.message.setMessage('Sorry', 'You have to enter at least your department and year in the settings');
        return;
      }

      console.log('Group', group);

      let url = `https://ws.fh-joanneum.at/getschedule.php?c=${dep}&y=${year}&k=${cfg.key}`;
      return new Promise((resolve, reject) => {
        this.xhr.get(url)
          .then(res => {
            // console.log(res);
            let status = res.querySelector('Status');
            if(status.innerHTML!='OK'){
              this.message.showMessage();
              this.message.setMessage('Oops!', 'Something went wrong, either your user/pass is incorrect or the Server has a problem. Sorry :(')
              return;
            }


            let events = res.querySelectorAll('Event');
            let i = 0;
            let schedule = {};
            Array.from(events).forEach(event => {
              let eventTitle = event.querySelector('Title').innerHTML;
              let eventLecturer = event.querySelector('Lecturer').innerHTML;
              let eventLocation = event.querySelector('Location').innerHTML;
              let eventType = event.querySelector('Type').innerHTML;
              let eventStart = event.querySelector('Start').innerHTML;
              let eventEnd = event.querySelector('End').innerHTML;

              if(group && eventType.startsWith('G') && eventType != group.toUpperCase()){
                return;
              }

              schedule[i] = {
                title: eventTitle,
                lecturer: eventLecturer,
                location: eventLocation,
                type: eventType,
                start: eventStart,
                end: eventEnd
              };
              i++;
            });
            console.log(schedule);
            resolve(schedule);
          })
          .catch(err => console.error('Test', err));
      });
    })
  }

}