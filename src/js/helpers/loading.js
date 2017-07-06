'use strict'

export class Loading{
  constructor(){
    // parentnode in DOM
    this.content = document.querySelector('#wrapper');
    // create Loading-Spinner
    this.wrapper = document.createElement('div');
    this.wrapper.id = 'loading';
    this.wrapper.style.display = "flex";
    this.wrapper.style.justifyContent = 'center';
    this.wrapper.innerHTML = `<img src="img/load.svg" alt="loading">`;
    // bind context
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
  }
  // display loading-spinner
  showLoading(){
    this.content.innerHTML = '';
    this.content.appendChild(this.wrapper);
  }
  // hide loading spinner
  hideLoading(){
    let loading = document.querySelector('#loading')
    if(loading){
      loading.remove();
    }
  }
}
