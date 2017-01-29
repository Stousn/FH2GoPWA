export class Toast {
  constructor(){
    this.showToast = this.showToast.bind(this);
  }

  showToast(txt){
    let target = document.querySelector('#wrapper');

    let toast = document.createElement('div');
    toast.id = 'toast';
    toast.innerHTML = `<div aria-live="assertive">${txt}</div>`;
    target.appendChild(toast);

    setTimeout(()=>{
      target.removeChild(toast);
    }, 3000);
  }
}