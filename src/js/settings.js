'use strict'

import { idbKeyval } from './external/idb-keyval/idb-keyval.js'
import { CryptoJS} from './external/cryptojslib/rollups/aes.js'


export class Settings {
  constructor() {
    // bind this to every function
    this.addEventListeners = this.addEventListeners.bind(this);
    this.loadSettings = this.loadSettings.bind(this);

    this.getUsername = this.getUsername.bind(this);
    this.getPassword = this.getPassword.bind(this);
    this.getDepartment = this.getDepartment.bind(this);
    this.getYear = this.getYear.bind(this);
    this.getGroup = this.getGroup.bind(this);
    this.getUser = this.getUser.bind(this);
}


  addEventListeners(){
    let _input_user = document.querySelector('#user');
    let _input_pass = document.querySelector('#pass');
    let _input_dep = document.querySelector('#dep');
    let _input_year = document.querySelector('#year');
    let _input_group = document.querySelector('#group');
    let _input_reset = document.querySelector('#reset');
    let _input_ok = document.querySelector('#ok');
    let _input_defpage = document.querySelector('#defpage');

    // sets saved username to input
    idbKeyval.get('username')
    .then(user=> {
      if(user!=undefined){
        _input_user.value = user;
      }
    })

    // sets saved password to input (encrypted)
    idbKeyval.get('password')
    .then(pass=> {
      if(pass!=undefined){
        _input_pass.value = pass;
      }
    })

    // sets saved department to input
    idbKeyval.get('department')
    .then(dep=> {
      if(dep!=undefined){
        _input_dep.value = dep;
      }
    })

    // sets saved year to input
    idbKeyval.get('year')
    .then(year=> {
      if(year!=undefined){
        _input_year.value = year;
      }
    })

    // sets saved group to input
    idbKeyval.get('group')
    .then(group=> {
      if(group!=undefined){
        _input_group.value = group;
      }
    })

    // sets saved defaultPage to input
    idbKeyval.get('defpage')
    .then(index => {
      if(index!=undefined){
        _input_defpage.selectedIndex = index;
      }
    })

    // saves username with every change
    _input_user.addEventListener('change', evt=>{
      idbKeyval.set('username', evt.target.value)
      .then(()=>{
        console.log('Username set')
      })
      .catch(err => {
        console.error('Username not set', err);
      })
    })

    // saves password with every change (encrypted) .. i know
    _input_pass.addEventListener('change', evt=>{
      let crypted = CryptoJS.AES.encrypt(evt.target.value, 'heliistanders');
      idbKeyval.set('password', crypted.toString())
      .then(()=>{
        console.log('Password set')
      })
      .catch(err => {
        console.error('Password not set', err);
      })
    })

    // saves department with every change
     _input_dep.addEventListener('change', evt=>{
      idbKeyval.set('department', evt.target.value)
      .then(()=>{
        console.log('department set')
      })
      .catch(err => {
        console.error('department not set', err);
      })
    })

    // saves year with every change
     _input_year.addEventListener('change', evt=>{
       if(!parseInt(evt.target.value)){
         return;
       }
       // change eg. 14 -> 2014
       if(evt.target.value.length===2){
         evt.target.value = '20' + evt.target.value;
       }
      idbKeyval.set('year', evt.target.value)
      .then(()=>{
        console.log('year set')
      })
      .catch(err => {
        console.error('year not set', err);
      })
    })

    // saves grou with every change
     _input_group.addEventListener('change', evt=>{
      idbKeyval.set('group', evt.target.value)
      .then(()=>{
        console.log('group set')
      })
      .catch(err => {
        console.error('group not set', err);
      })
    })

    // saves defaultPage with every change
    _input_defpage.addEventListener('change', evt => {
      console.log(evt.target.selectedIndex);
      idbKeyval.set('defpage', evt.target.selectedIndex)
      .then( () => {
        console.log('default page set')
      })
      .catch( err => {
        console.error('defpage not set', err);
      })
    })

    // empty all inputfields + deletes idbKeyVal-Store
    _input_reset.addEventListener('click', evt => {
      _input_user.value = '';
      _input_pass.value = '';
      _input_dep.value = '';
      _input_year.value = '';
      _input_group.value = '';
      idbKeyval.clear();
    })

    // show loader when "Save" gets clicked ... doesn't do anything else ;)
    _input_ok.addEventListener('click', evt => {
      let value = evt.target.innerHTML;
      evt.target.innerHTML = `<img src="img/load_white.svg" alt="loading">`;
      // remove loader after 2s
      setTimeout(()=>{
        evt.target.innerHTML = value;
      }, 2000);
    })
  }

  // load settings-template into DOM
  loadSettings(){
    let template = `<div id="settings">

      <div class="title">User Account:</div>

      <div id="account">
        <label for="user">Username:</label><input id="user" name="user" placeholder="username"></input>
        <label for="pass">Password:</label><input id="pass" name="pass" type="password" placeholder="password"></input>
      </div>


      <div class="title">Details:</div>

      <div id="details">
        <label for="dep">Department:</label><input id="dep" name="dep" placeholder="Department (ITM,IRM,ABA ..)"></input>
        <label for="year">Year:</label><input id="year" name="year" placeholder="Year"></input>
        <label for="group">Group:</label><input id="group" name="group" placeholder="Group"></input>
      </div>

      <div class="title">Default Page:</div>
      <div id="default_page">
        Which default Page should the App load?
        <form>
          <select id="defpage" aria-label="Choose the default page for this application">
            <option value="-">-</option>
            <option value="Schedule">Schedule</option>
            <option value="Schedule">Marks</option>
            <option value="Schedule">Exams</option>
          </select>
        </form>
      </div>

      <button id="ok">Save</button>
      <button id="reset">Reset</button>
  
    </div>`

    let wrapper = document.querySelector('#wrapper');
    wrapper.innerHTML = template;

    this.addEventListeners();
  }

  // returns Username as a promise
  getUsername(){
    return idbKeyval.get('username');
  }

  // returns password as a promise
  getPassword(){
    return idbKeyval.get('password')
    .then(crypted => {
      if(crypted){
        let bytes  = CryptoJS.AES.decrypt(crypted, 'heliistanders');
        return bytes.toString(CryptoJS.enc.Utf8)
      }
    });
  }

  // returns department as a promise
  getDepartment(){
    return idbKeyval.get('department');
  }

  // returns year as a promise
  getYear(){
    return idbKeyval.get('year');
  }

  // returns group as a promise
  getGroup(){
    return idbKeyval.get('group');
  }

  // returns all credetials as promise
  getUser(){
    let user = this.getUsername();
    let pass = this.getPassword();
    let dep = this.getDepartment();
    let year = this.getYear();
    let group = this.getGroup();

    return Promise.all([user,pass,dep,year,group])
  }

  // returns the defaultpage as a promise
  getDefaultPage(){
    let pages = [undefined, '/schedule', '/marks', '/exams']
    return idbKeyval.get('defpage')
    .then(index => {
      return pages[index];
    })
  }
}

