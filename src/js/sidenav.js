'use strict';

export class SideNav {
  constructor(){
    // needed html elements
    this._nav = document.querySelector('nav');
    this._checkbox = document.querySelector('#menu_toggle');
    this._menuBtns = document.querySelectorAll('.menu_btn');
    this._menuWrapper = document.querySelector('#menu_wrapper');

    // bind "this" to every function
    this.addEventListeners = this.addEventListeners.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.update = this.update.bind(this);
    this.blockClicks = this.blockClicks.bind(this);
    this.toggleSideNav = this.toggleSideNav.bind(this);

    // important init values
    this._startX = 0;
    this._currentX = 0;
    this._touchSideNav = false;
    this._visible = false;
    // if menue is hidden (=mobile) -> remove tab index
    Array.from(this._menuBtns).forEach(btn=>{
      // only change when on mobile-device
      if(getComputedStyle(this._checkbox, null).display != 'none'){
        btn.tabIndex = -1;
      }
    })
    // when intialized -> addEventListeners
    this.addEventListeners();
  }

  addEventListeners(){
    this._checkbox.addEventListener('change', this.toggleSideNav);
    this._menuWrapper.addEventListener('click', this.blockClicks);

    this._nav.addEventListener('touchstart', this.onTouchStart);
    this._nav.addEventListener('touchmove', this.onTouchMove);
    this._nav.addEventListener('touchend', this.onTouchEnd);
  }

   // when a touch event fires
  onTouchStart(evt){
    // if invisible -> ignore
    if(!this._visible){
      return;
    }

     // set startX and currentX to Point, where the touch happened
    this._startX = evt.touches[0].pageX;
    this._currentX = evt._startX;


    this._touchSideNav = true;
 
    requestAnimationFrame(this.update);
  }

  onTouchMove(evt){
    if(!this._touchSideNav){
      return;
    }
    // keep track of finger position
    this._currentX = evt.touches[0].pageX;
    
    // calculate traslateX for SideNav
    let translateX = Math.min(0, this._startX - this._currentX);
    // if SideNav gets dragged -> prevent Clicks
    if(translateX < 0){
      evt.preventDefault();
    }

  }

  onTouchEnd(evt){
    if(!this._touchSideNav){
      return;
    }


    this._touchSideNav = false;

    let translateX = (this._startX - this._currentX);
    
    this._nav.style.transform = '';

    console.log('oTE',translateX);
    // if SideNav gets moved by more than 100px -> hide SideNav
    if(translateX<-100){
      this.toggleSideNav();
    }


  }

  update(){
    if(!this._touchSideNav){
      return;
    }

    requestAnimationFrame(this.update);
    // animate SideNav
    let translateX = Math.min(0, this._startX - this._currentX);
    this._nav.style.transform = `translateX(${-translateX}px)`;

  }

  blockClicks(evt){
    evt.stopPropagation();
    document.querySelector('#logo').focus();
    this.toggleSideNav();
  }

  toggleSideNav(evt){
    // change Visible Status
    this._visible = !this._visible;
    // change Checked Status
    this._checkbox.checked = this._visible;

    // make Menu Btns (non)reachable via TAB
    Array.from(this._menuBtns).forEach(btn=>{
      // only change when on mobile-device
      if(getComputedStyle(this._checkbox, null).display != 'none'){
        btn.tabIndex = (this._visible ? 1 : -1);
      }
    })
    // if visible -> focus on first Menu-Entry for a11y (only on mobile device)
    if(this._visible && getComputedStyle(this._checkbox, null).display != 'none'){
      this._menuBtns[0].focus();
    }

  }

}
