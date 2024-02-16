const storage = chrome.storage.session
  ? chrome.storage.session
  : chrome.storage.local;

const Switch = document.getElementById("switch");
const result = document.getElementById("result");
const stats = document.getElementById("stats");
const report = document.getElementById("report");

async function getResults(tabId) {
  return Object.values(await storage.get(`_results_${tabId}`))[0];
}

function displayResult(tabId) {
  console.log("displaying...");
  document.querySelector("ul")?.remove();
  getResults(tabId).then((res) => {
    console.log(res);
    if (Number(res.Count) > 0) {
      result.innerText = `${res.Count} dark patterns found.`;
      const ul = document.createElement("ul");
      res.Stats?.forEach((item) => {
        const li1 = document.createElement("li");
        li1.textContent = `${item.count}`;
        ul.appendChild(li1);
        const li2 = document.createElement("li");
        li2.textContent = `${item.response}`;
        ul.appendChild(li2);
      });
      stats.appendChild(ul);
    } else {
      result.innerText = "No dark patterns found.";
    }
  });
}

async function initPopup() {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      const activationState = await chrome.runtime.sendMessage({
        action: "getActivationState",
        tabId: tabs[0].id,
      });
      console.log(activationState);
      if (activationState.isEnabled === true) {
        Switch.checked = true;
        displayResult(tabs[0].id);
      } else {
        Switch.checked = false;
        result.innerText = "OFF";
      }
    }
  );
  document.getElementById("toggler").addEventListener("click", () => {
    console.log("Stored name: " + !Switch.checked);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage(
        { enableExtension: Switch.checked, tabId: tabs[0].id },
        function (response) {
          if (Switch.checked === true) {
            chrome.runtime.sendMessage(
              { action: "highlightPatterns" },
              function (response) {
                console.log(response);
              }
            );
          }
          console.log(response);
          chrome.extension.getViews({ type: "popup" })[0].close();
        }
      );
    });
  });
  report.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "report" },
        function (response) {
          console.log(response);
        }
      );
    });
  });
}

initPopup();
