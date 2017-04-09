"use strict";

export class Message {
  constructor() {
    this.body = document.querySelector("body");

    this.visible = false;

    this.showMessage = this.showMessage.bind(this);
    this.setMessage = this.setMessage.bind(this);
    this.hideMessage = this.hideMessage.bind(this);

    window.addEventListener("keydown", this.hideMessage);
  }

  showMessage(title) {
    if (this.visible) {
      return;
    }

    let wrapper = document.createElement("div");
    wrapper.id = "message_wrapper";
    wrapper.innerHTML = `<div id="message" aria-live="assertive">
                            <h2 id="message_title">${title}</h2>
                            <img src="img/load.svg" alt="loading" id="message_loader">
                            <div id="message_text"></div>
                        </div>`;
    wrapper.addEventListener("click", this.hideMessage);

    this.visible = true;
    this.body.appendChild(wrapper);
  }

  setMessage(title, msg) {
    let messageTitle = document.querySelector("#message_title");
    let messageText = document.querySelector("#message_text");
    let messageLoader = document.querySelector("#message_loader");

    messageLoader.style.display = "none";
    if (title) {
      messageTitle.innerHTML = title;
    }
    messageText.innerHTML = msg;
  }

  hideMessage(evt) {
    if (!this.visible) {
      return;
    }

    if (
      evt.keyCode != 13 &&
      evt.keyCode != 32 &&
      evt.keyCode != undefined &&
      evt.keyCode != 0
    ) {
      return;
    }
    evt.preventDefault();

    document.querySelector("#message_wrapper").remove();
    this.visible = false;
  }

  hideAllMessages() {
    let msg = document.querySelector("#message_wrapper");
    if (msg) {
      msg.remove();
    }
  }
}
