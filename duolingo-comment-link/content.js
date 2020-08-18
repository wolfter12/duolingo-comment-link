"use strict";

const COMMENTS_PARENT_SELECTOR = "div.L3O-V";
const COMMENT_SELECTOR = ".uMmEI";
const COMMENT_CLASS = "uMmEI";

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

    function complete(element) {
      observer.disconnect();
      resolve(element);
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.matches && node.matches(selector)) {
            return complete(node);
          } else if (node.firstElementChild) {
            const target = node.querySelector(selector);
            if (target) {
              return complete(target);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, observerOptions);
  });
}

function addLink(element) {
  if (!element) return;

  const $link = document.createElement("div");
  $link.className = "comment-link";

  const imgSrc = chrome.extension.getURL("./icons/link_1_128.png");
  const icon = `<img alt="&#x1F517;" class="link-icon" src=${imgSrc}>`;
  $link.innerHTML = icon;

  element.insertAdjacentElement("afterBegin", $link);
  element.dataset.commentLinked = true;
}

function notContainsCommentLink(element) {
  return !element.dataset.commentLinked;
}

function findComments(element) {
  if (!element) return [];
  const comments = [...element.querySelectorAll(COMMENT_SELECTOR)];
  if (comments.length) {
    const commentsWithoutLink = comments.filter(notContainsCommentLink);
    if (commentsWithoutLink.length) {
      return commentsWithoutLink;
    }
  }
  return [];
}

function onMutation(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.tagName === "DIV" && node.classList.contains(COMMENT_CLASS) && notContainsCommentLink(node)) {
        addLink(node);
      } else if (node.firstElementChild) {
        findComments(node).forEach(addLink);
      }
    });
  });
}

function createLink(target) {
  const currentUrl = document.URL;
  const baseUrl = currentUrl.split("?")[0];
  const parent = target.closest(COMMENT_SELECTOR);
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


function update() {
  observer.disconnect();
  document.removeEventListener("click", commentLinkHandler);

  waitForElement(COMMENTS_PARENT_SELECTOR).then((element) => {
    findComments(document).forEach(addLink);
    observer.observe(element, observerOptions);
    document.addEventListener("click", commentLinkHandler);
  });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "update") update();
  return true;
});

update();