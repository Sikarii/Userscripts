// ==UserScript==
// @name         YouTube Autoplay Fix
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @namespace    https://github.com/Sikarii/Userscripts
// @description  Fixes YouTube autoplay not working for playlists past 400 entries
// @version      1.0.1
// @match        https://www.youtube.com/watch*&list=*
// @grant        none
// ==/UserScript==

const hookPlayer = () => {
  const playerEl = document.querySelector("video.html5-main-video");
  if (!playerEl) {
    return;
  }

  // This leaks, but should not be an issue since there will be a page refresh
  playerEl.addEventListener("ended", () => {
    playerEl.paused && queueSwitch();
  });
};

const queueSwitch = () => {
  const currentEl = document.querySelector("ytd-player .ytp-time-current");
  const durationEl = document.querySelector("ytd-player .ytp-time-duration");

  if (!currentEl || !durationEl) {
    return;
  }

  currentEl.textContent = "-";
  durationEl.textContent = "Switching...";

  setTimeout(switchToNextVideo, 2500);
};

const switchToNextVideo = () => {
  const panelEls = [
    ...document.querySelectorAll("ytd-playlist-panel-video-renderer"),
  ];

  const selectedIdx = panelEls.findIndex((x) => x.hasAttribute("selected"));

  const nextElement = panelEls[selectedIdx + 1];
  if (!nextElement) {
    return;
  }

  const thumbnailEl = nextElement.querySelector("#thumbnail");
  return thumbnailEl?.click();
};

(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);

  const inPlaylist = params.has("list");
  const playListIndex = parseInt(params.get("index"));

  // Playlists break past 400 videos, so we better fix it
  return inPlaylist && playListIndex >= 400 && hookPlayer();
})();
