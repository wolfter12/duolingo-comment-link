const animation = document.querySelector("#animation");
const iconName = document.querySelector("#iconName");
const iconSize = document.querySelector("#icon-size");
const saveButton = document.querySelector("#save-settings");

chrome.storage.local.get(["animation", "iconName", "iconSize"], (data) => {
  animation.checked = data.animation;
  iconName.value = data.iconName;
  iconSize.value = data.iconSize;
});

saveButton.addEventListener("click", () => {
  chrome.storage.local.set({
    animation: animation.checked,
    iconName: iconName.value,
    iconSize: iconSize.value
  });
});
