const storage = chrome.storage.session
  ? chrome.storage.session
  : chrome.storage.local;

const download = (dataurl, filename) => {
  const link = document.createElement("a");
  link.href = dataurl;
  link.download = filename;
  link.click();
};

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
  } else if (message.action === "takeScreenshot") {
    console.log("Starting ss");
    chrome.tabs.captureVisibleTab(async (dataUrl) => {
      await chrome.scripting.executeScript({
        func: download,
        target: { tabId: sender.tab.id },
        args: [dataUrl, "report.png"],
      });
    });
  } else if (message.action === "saveScreenshot") {
    console.log("Saving ss");
    chrome.tabs.captureVisibleTab(async (dataUrl) => {
      // Convert the base64 data URL to a Blob
      const blobData = await fetch(dataUrl).then((response) => response.blob());

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", blobData, "screenshot.png");

      // Send the HTTP request to the FastAPI server's /upload/ endpoint
      fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Screenshot saved:", data);
        })
        .catch((error) => {
          console.error("Error saving screenshot:", error);
        });
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
