const Switch = document.getElementById("switch");
const result = document.getElementById("result");
const stats = document.getElementById("stats");
const report = document.getElementById("report");

function displayResult() {
  chrome.storage.local.get(["Status"], (res) => {
    console.log(res.Status);
    document.querySelector("ul")?.remove();
    if (Number(res.Status?.Count || "0") > 0 ) {
      result.innerText = `${res.Status.Count} dark patterns found.`;
      const ul = document.createElement("ul");
      res.Status.Result?.forEach((item) => {
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

chrome.storage.local.get(["switchState"], (res) => {
  Switch.checked = Boolean(res.switchState) ? true : false;
  console.log(Switch.checked);
  if (Switch.checked) {
    displayResult();
  } else {
    result.innerText = "OFF";
  }
  console.log("Retrieved name: " + res.switchState);
});

document.getElementById("toggler").addEventListener("click", () => {
  chrome.storage.local.set({ switchState: !Switch.checked }, () => {
    console.log("Stored name: " + Switch.checked);
    if (Switch.checked) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "detect" },
          function (response) {
            console.log(response);
            chrome.extension.getViews({ type: "popup" })[0].close();
          }
        );
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "remove" },
          function (response) {
            console.log(response);
            chrome.extension.getViews({ type: "popup" })[0].close();
          }
        );
      });
    }
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
