const storage = chrome.storage.session
  ? chrome.storage.session
  : chrome.storage.local;

async function getActivation(tabId) {
  return Object.values(await storage.get(`_id_${tabId}`))[0];
}

async function setActivation(tabId, activation) {
  return await storage.set({ [`_id_${tabId}`]: activation });
}

async function removeActivation(tabId) {
  return await storage.remove(`_id_${tabId}`);
}

async function getResults(tabId) {
  return Object.values(await storage.get(`_results_${tabId}`))[0];
}

async function getActivationOrSetDefault(tabId) {
  let activation = await getActivation(tabId);
  if (activation === undefined) {
    activation = true;
    await setActivation(tabId, activation);
  }
  return activation;
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if ("results" in message) {
    getActivation(sender.tab.id).then((activation) => {
      if (activation === true) {
        saveResults(message.results, sender.tab.id);
        displayBadge(message.results.Count, sender.tab.id);
      }
      sendResponse({ success: true });
    });
  } else if ("enableExtension" in message && "tabId" in message) {
    setActivation(message.tabId, message.enableExtension).then(() => {
      if (message.enableExtension === false) {
        displayBadge("", message.tabId);
        chrome.tabs.sendMessage(
          message.tabId,
          { action: "remove" },
          function (response) {
            console.log(response);
          }
        );
      } else
        chrome.tabs.sendMessage(
          message.tabId,
          { action: "highlightPatterns" },
          function (response) {
            console.log(response);
          }
        );
      console.log(message);
      sendResponse({ success: true });
    });
  } else if ("action" in message && message.action == "getActivationState") {
    let tabId;
    if ("tabId" in message) {
      tabId = message.tabId;
    } else {
      tabId = sender.tab.id;
    }
    getActivationOrSetDefault(tabId).then((activation) => {
      sendResponse({ isEnabled: activation });
    });
  } else {
    sendResponse({ success: false });
  }
  return true;
});

chrome.tabs.onReplaced.addListener(async function (addedTabId, removedTabId) {
  await setActivation(addedTabId, await getActivation(removedTabId));
  await removeActivation(removedTabId);
});

chrome.tabs.onRemoved.addListener(async function (tabId, removeInfo) {
  await removeActivation(tabId);
});

async function saveResults(results, tabId) {
  return await storage.set({ [`_results_${tabId}`]: results });
}

function displayBadge(count, tabId) {
  chrome.action.setBadgeText({
    tabId: tabId,
    text: "" + count,
  });
  let bgColor = "yellow";
  chrome.action.setBadgeBackgroundColor({
    tabId: tabId,
    color: bgColor,
  });
}