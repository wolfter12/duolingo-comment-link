"use strict";

const observer = new MutationObserver(onMutation);
const observerOptions = {
  childList: true,
  subtree: true,
};

function waitForElement(selector) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);

    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.matches && node.matches(selector)) {
            observer.disconnect();
            resolve(node);
            return;
          } else if (node.firstElementChild) {
            const target = node.querySelector(selector);
            if (target) {
              observer.disconnect();
              resolve(target);
              return;
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, observerOptions);
  });
}

function addLink(element) {
  const $link = document.createElement("div");
  $link.classList.add("comment-link");
  const imgSrc = chrome.extension.getURL("./icons/link_1_128.png");
  const icon = `<img alt="&#x1F517;" class="link-icon" src=${imgSrc}>`;
  $link.innerHTML = icon;
  $link.addEventListener
  element.insertAdjacentElement("afterBegin", $link);
  element.dataset.commentLinked = true;
}

function render(element) {
  const targetBlocks = [...element.querySelectorAll(".uMmEI")];
  if (targetBlocks.length) {
    const filtred = targetBlocks.filter(checkCommentLinkDoesNotExist);
    if (filtred.length) {
      filtred.forEach(addLink);
    }
  }
}

function onMutation(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.tagName === "DIV" && node.classList.contains("uMmEI") && !node.dataset.commentLinked) {
        addLink(node);
      } else if (node.firstElementChild) {
        render(node);
      }
    });
  });
}

function createLink(target) {
  const currentUrl = document.URL;
  const baseUrl = currentUrl.split("?")[0];
  const parent = target.closest(".uMmEI");
  const children = [...parent.children];
  let commentID = children.find(element => element.id).id;
  let commentLink;

  if (commentID) {
    commentLink = `${baseUrl}?comment_id=${commentID}`;
  }

  return commentLink || baseUrl;
}

function commentLinkHandler(event) {
  if (event.target.classList.contains("link-icon")) {
    const link = createLink(event.target);
    navigator.clipboard.writeText(link);
  }
}

function checkCommentLinkDoesNotExist(element) {
  return !element.dataset.commentLinked;
}

function update() {
  observer.disconnect();
  document.removeEventListener("click", commentLinkHandler);

  waitForElement("div.L3O-V ").then((element) => {
    render(document);
    observer.observe(element, observerOptions);
    document.addEventListener("click", commentLinkHandler);
  });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "update") update();
  return true;
});

update();