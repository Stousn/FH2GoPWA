export class Toast {
  constructor() {}

  // shows a toast-message at the bottom of the screen
  static showToast(txt) {
    // show toast-msg
    let target = document.querySelector("#wrapper");
    let toast = document.createElement("div");
    toast.id = "toast";
    toast.innerHTML = `<div aria-live="assertive">${txt}</div>`;
    target.appendChild(toast);
    // remove toast-msg after 3s
    setTimeout(
      () => {
        target.removeChild(toast);
      },
      3000
    );
  }
}
