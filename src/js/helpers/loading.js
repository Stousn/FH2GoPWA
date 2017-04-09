'use strict'

export class Loading{
  constructor(){
    this.content = document.querySelector('#wrapper');

    this.wrapper = document.createElement('div');
    this.wrapper.id = 'loading';
    this.wrapper.style.display = "flex";
    this.wrapper.style.justifyContent = 'center';
    this.wrapper.innerHTML = `<img src="img/load.svg" alt="loading">`;

    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
  }

  showLoading(){
    this.content.innerHTML = '';
    this.content.appendChild(this.wrapper);
  }

  hideLoading(){
    let loading = document.querySelector('#loading')
    if(loading){
      loading.remove();
    }
  }
}