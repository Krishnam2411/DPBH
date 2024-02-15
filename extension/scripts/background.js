chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "setBadge") {
    chrome.action.setBadgeBackgroundColor({ color: "yellow" });
    chrome.action.setBadgeText({ text: `${message.count}` });
  }
  if (message.action === "removeBadge") {
    chrome.action.setBadgeText({ text: "" });
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.storage.local.get(["switchState"], (res) => {
    if (Boolean(res.switchState)) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs[0]) {
          const activeTab = tabs[0];
          chrome.tabs.reload(activeTab.id);
          chrome.action.setBadgeText({ text: "" });
          console.log("Active tab ID:", activeTab.id);
          chrome.webNavigation.onCompleted.addListener((details) => {
            if (details.frameId === 0 && details.tabId === activeInfo.tabId) {
              console.log("DOM loaded. Sending 'detect' message.");
              chrome.tabs.sendMessage(
                activeTab.id,
                { action: "detect" },
                function (response) {
                  if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                  } else {
                    console.log("Message response:", response);
                  }
                }
              );
            }
          });
        } else {
          console.error("No active tab found.");
        }
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs[0]) {
          const activeTab = tabs[0];
          console.log("Active tab ID:", activeTab.id);
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: "remove" },
            function (response) {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
              } else {
                console.log("Message response:", response);
              }
            }
          );
        } else {
          console.error("No active tab found.");
        }
      });
    }
  });
});
