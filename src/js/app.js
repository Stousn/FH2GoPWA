"use strict";
import { SideNav } from "./sidenav.js";
import { Router } from "./helpers/router.js";

class App {
  constructor() {
    this.sideNav = new SideNav();
    this.router = new Router();

    this.init = this.init.bind(this);

    this.init();
  }

  init() {
    this.router.addEventListeners();
  }
}

let app = new App();
