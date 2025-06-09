// ==UserScript==
// @name         Stop Twitch front page autoplay
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @namespace    https://github.com/Sikarii/Userscripts
// @description  Stops Twitch from autoplaying featured streams
// @version      1.0.0
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

"use script";

const observerOptions = {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
};

const getElement = (selector, el) => {
  const parent = el ?? document.documentElement;

  return new Promise((resolve) => {
     // Return immediately if found
     const el = parent.querySelector(selector);
     if (el) {
       return resolve(el);
     }

    const callback = (_, observer) => {
      const el = parent.querySelector(selector);

      if (el) {
        observer.disconnect();
        return resolve(el);
      }
    };

    const observer = new MutationObserver(callback);

    observer.observe(parent, observerOptions);
  });
};

const onLocationChange = (userCb) => {
  let currentUrl = window.location.href;

  const callback = () => {
    if (currentUrl !== document.location.href) {
       currentUrl = document.location.href;
       userCb();
    }
  };

  const observer = new MutationObserver(callback);

  observer.observe(document.documentElement, observerOptions);
};

const preventAutoplay = async () => {
  const selector = window.location.pathname.startsWith("/directory/category/")
    ? ".video-player video"
    : ".featured-content-carousel video";

  const frontVideoEl = await getElement(selector);
  if (!frontVideoEl) {
    return;
  }

  if (!frontVideoEl.paused) {
    return frontVideoEl.pause();
  }

  const pauseCb = () => {
    frontVideoEl.pause();
    frontVideoEl.removeEventListener("playing", pauseCb);
  };

  frontVideoEl.addEventListener("playing", pauseCb);
};

(function() {
  preventAutoplay();

  onLocationChange(preventAutoplay);
})();
