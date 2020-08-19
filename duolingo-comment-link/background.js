"use strict";

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({
    animation: true,
    iconName: "classic",
    iconSize: "20"
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: "forum.duolingo.com" },
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "update" });
  });
});

chrome.storage.onChanged.addListener(() => {
  const message = "You need to refresh the page to apply the new settings.";
  alert(message);
});
