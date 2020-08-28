import {
  ICONS_SRC,
  ICON_SIZE,
} from "./constants";

const animation = document.querySelector("#animation");
const iconName = document.querySelector("#icon-name");
const iconSize = document.querySelector("#icon-size");
const icon = document.querySelector("#icon");
const saveButton = document.querySelector("#save-settings");

function iconChange() {
  icon.src = ICONS_SRC[iconName.value];
  icon.style.width = `${ICON_SIZE[iconSize.value]}px`;
  icon.style.height = `${ICON_SIZE[iconSize.value]}px`;
}

function highlight(element) {
  if (!animation.checked) return;
  if (element.classList.contains("highlight-block")) return;
  element.classList.add("highlight-block");
  setTimeout(() => {
    element.classList.remove("highlight-block");
  }, 1000);
}

chrome.storage.local.get(["animation", "iconName", "iconSize"], (data) => {
  animation.checked = data.animation;
  iconName.value = data.iconName;
  iconSize.value = data.iconSize;
  icon.src = ICONS_SRC[data.iconName];
  icon.style.width = `${ICON_SIZE[data.iconSize]}px`;
  icon.style.height = `${ICON_SIZE[data.iconSize]}px`;
});

icon.addEventListener("click", () => {
  highlight(document.body);
});
iconName.addEventListener("change", iconChange);
iconSize.addEventListener("change", iconChange);

saveButton.addEventListener("click", () => {
  chrome.storage.local.set({
    animation: animation.checked,
    iconName: iconName.value,
    iconSize: iconSize.value,
  });
});
