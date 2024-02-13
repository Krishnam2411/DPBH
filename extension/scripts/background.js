chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "setBadge") {
    chrome.action.setBadgeBackgroundColor({ color: "yellow" });
    chrome.action.setBadgeText({ text: `${message.count}` });
  }
  if (message.action === "removeBadge") {
    chrome.action.setBadgeText({ text: "" });
  }
});
