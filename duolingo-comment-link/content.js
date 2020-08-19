"use strict";

let animation = true;
let iconName = "classic";
let iconSize = "20";

chrome.storage.local.get(["animation", "iconName", "iconSize"], (data) => {
  animation = data.animation;
  iconName = data.iconName;
  iconSize = data.iconSize;
});

const ICONS_SRC = {
  "horizontal": "./icons/link_2_128.png",
  "classic": "./icons/link_1_128.png",
  "copy": "./icons/copy_128.png"
};

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
          }
          if (node.firstElementChild) {
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
  $link.style.fontSize = `${iconSize}px`;

  const imgSrc = chrome.extension.getURL(ICONS_SRC[iconName]);
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
  const commentID = children.find((element) => element.id).id;
  let commentLink;

  if (commentID) {
    commentLink = `${baseUrl}?comment_id=${commentID}`;
  }

  return commentLink || baseUrl;
}

function highlight(element) {
  if (element.classList.contains("highlight-comment")) return;
  element.classList.add("highlight-comment");
  setTimeout(() => {
    element.classList.remove("highlight-comment");
  }, 1000);
}

function commentLinkHandler(event) {
  if (event.target.classList.contains("link-icon")) {
    const link = createLink(event.target);
    const comment = event.target.closest(COMMENT_SELECTOR);
    const commentWithoutMargin = [...comment.children].find(element => element.id);
    navigator.clipboard.writeText(link);
    if (animation) {
      highlight(commentWithoutMargin || comment);
    }
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