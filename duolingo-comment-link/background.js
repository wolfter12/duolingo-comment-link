"use strict";

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  console.log("updated");
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "update" });
  });
});