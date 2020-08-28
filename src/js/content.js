import {
  COMMENTS_PARENT_SELECTOR,
  COMMENT_SELECTOR,
  COMMENT_CLASS,
  ICONS_SRC,
  ICON_SIZE,
  OBSERVER_OPTIONS,
  EXTENSION_OPTIONS,
} from "./constants";

chrome.storage.local.get(["animation", "iconName", "iconSize"], (data) => {
  EXTENSION_OPTIONS.animation = data.animation || true;
  EXTENSION_OPTIONS.iconName = data.iconName || "classic";
  EXTENSION_OPTIONS.iconSize = data.iconSize || "small";
});

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
          }
          if (node.firstElementChild) {
            const target = node.querySelector(selector);
            if (target) {
              observer.disconnect();
              resolve(target);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, OBSERVER_OPTIONS);
  });
}

function addLink(element) {
  if (!element) return;

  const $link = document.createElement("div");
  $link.className = "comment-link";
  $link.style.fontSize = `${ICON_SIZE[EXTENSION_OPTIONS.iconSize]}px`;

  const imgSrc = chrome.extension.getURL(ICONS_SRC[EXTENSION_OPTIONS.iconName]);
  const icon = `<img alt="&#x1F517;" class="link-icon" src=${imgSrc}>`;
  $link.innerHTML = icon;

  element.insertAdjacentElement("afterBegin", $link);
  // eslint-disable-next-line no-param-reassign
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

function newCommentHandler(mutations) {
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
    const commentWithoutMargin = [...comment.children].find((element) => element.id);
    navigator.clipboard.writeText(link);
    if (EXTENSION_OPTIONS.animation) {
      highlight(commentWithoutMargin || comment);
    }
  }
}

const commentObserver = new MutationObserver(newCommentHandler);

function update() {
  commentObserver.disconnect();
  document.removeEventListener("click", commentLinkHandler);

  waitForElement(COMMENTS_PARENT_SELECTOR).then((element) => {
    findComments(document).forEach(addLink);
    commentObserver.observe(element, OBSERVER_OPTIONS);
    document.addEventListener("click", commentLinkHandler);
  });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "update") update();
  return true;
});

update();
