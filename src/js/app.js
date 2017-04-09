"use strict";
import { SideNav } from "./sidenav.js";
import { Exams } from "./exams.js";
import { Schedule } from "./schedule.js";
import { Settings } from "./settings.js";
import { Message } from "./helpers/message.js";
import { Marks } from "./marks.js";

class App {
  constructor() {
    this.sideNav = new SideNav();
    this.exams = new Exams();
    this.settings = new Settings();
    this.message = new Message();
    this.schedule = new Schedule();
    this.marks = new Marks();

    this.addEventListeners = this.addEventListeners.bind(this);
    this.route = this.route.bind(this);
    this.loadContent = this.loadContent.bind(this);

    this.isLoadingNewContent = false;

    this.welcome_msg = `<div class="welcome_msg">
        <h1 tabindex="0">Welcome!</h1>
        <p tabindex="0">Thank you for using the FH2Go Progressive Web App</p>
        <br>
        <h3 tabindex="0">How to Use:</h3>
        <ol>
          <li tabindex="0">Enter your FH-Credentials in the Settings</li>
          <li tabindex="0">Add this Site to your Homescreen :)</li>
        </ol>
        <pre>
          now with offline support
        </pre>
      </div>`;
  }

  addEventListeners() {
    window.addEventListener("load", this.route);
    window.addEventListener("popstate", this.route);

    let menu_btns = document.querySelectorAll(".menu_btn");
    Array.from(menu_btns).forEach(btn => {
      btn.addEventListener("click", this.loadContent);
    });
  }

  route(evt) {
    this.message.hideAllMessages();

    if (window.location.pathname === "/" || window.location.pathname == "") {
      this.settings.getDefaultPage().then(page => {
        if (page) {
          let link = document.createElement("a");
          link.href = page;
          link.addEventListener("click", this.loadContent);
          link.click();
          link.removeEventListener("click", this.loadContent);
        } else {
          let target = document.querySelector("#wrapper");
          target.innerHTML = this.welcome_msg;
        }
      });
    }
    if (window.location.pathname === "/schedule") {
      let wrapper = document.querySelector("#wrapper");
      this.isLoadingNewContent = true;
      this.schedule.loadSchedule().then(_ => {
        this.isLoadingNewContent = false;
      });
    }
    if (window.location.pathname === "/marks") {
      let wrapper = document.querySelector("#wrapper");
      this.isLoadingNewContent = true;
      this.marks.loadMarks().then(_ => {
        this.isLoadingNewContent = false;
      });
    }
    if (window.location.pathname === "/exams") {
      let wrapper = document.querySelector("#wrapper");
      this.isLoadingNewContent = true;
      this.exams.loadExams().then(_ => {
        this.isLoadingNewContent = false;
      });
    }
    if (window.location.pathname === "/settings") {
      this.isLoadingNewContent = true;
      this.settings.loadSettings();
      this.isLoadingNewContent = false;
    }
  }

  loadContent(evt) {
    evt.preventDefault();
    console.log(evt);
    // if(this.isLoadingNewContent){
    //   return;
    // }
    let url = new URL(evt.target.href);
    history.pushState(null, null, url.pathname);
    this.route();
  }
}

let app = new App();
window.onload = app.addEventListeners();
