"use strict";

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "update" });
  });
});