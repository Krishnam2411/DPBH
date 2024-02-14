var Result = [],
  Count = 0,
  Total = 0;

const commonPatterns = [
  {
    pattern: "Get 63% off NordVPN + 3 months free for a friend",
    response: "False Urgency",
  },
  {
    pattern: "Get 67% off NordVPN + 3 months free for a friend",
    response: "False Urgency",
  },
];

const showScore = () => {
  let bgColor = "",
    score = 100 - ((Count * 500) / Total + 1);
  if (score < 50) bgColor = "rgba(255, 0, 0, 0.75)";
  else if (score >= 75) bgColor = "rgba(0, 215, 0, 0.75)";
  else bgColor = "rgba(255, 191, 0, 0.75)";
  score = Number(score.toPrecision(2)).toString();
  // Creating Score element to inject
  const TrustScore = document.createElement("div");
  TrustScore.classList.add("__trust_score");
  TrustScore.innerText = score + "%";
  TrustScore.style.backgroundColor = bgColor;
  document.body.appendChild(TrustScore);
};

const ScrapData = () => {
  const textContent = document.body.innerText;
  const dataset = FilterData(textContent).reduce(
    (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
    []
  );
  return dataset;
};

const DetectPatterns = (scrapedData, commonPatterns) => {
  // let patterns;
  fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    body: JSON.stringify(scrapedData),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Credentials": "true",
    },
  })
    .then((response) => response.json())
    .then((json) => {
      HighlightPatterns([...commonPatterns, ...json.response]);
    })
    .catch((error) => {
      console.log("Error :", error);
    });
};

const HighlightPatterns = (result) => {
  Count = 0;
  Total = 0;
  Result = [];
  const freqMap = {};
  const allElements = document.body.querySelectorAll("*");
  console.log(result, typeof result);
  for (const darkPattern of result) {
    for (const element of allElements) {
      Total++;
      if (
        element.innerText?.replace(/\n/g, "").trim().toLowerCase() ===
        darkPattern.pattern.toLowerCase()
      ) {
        if (darkPattern.response !== "Not Dark Pattern") {
          freqMap[darkPattern.response] = (freqMap[darkPattern.response] || 0) + 1;
          Count++;
          element.classList.add("__dark_pattern");
          const dialogue = document.createElement("span");
          dialogue.classList.add("__message");
          dialogue.innerText = darkPattern.response;
          element.appendChild(dialogue);
        }
        break;
      }
    }
  }
  Result = Object.entries(freqMap).map(([response, count]) => ({
    response,
    count,
  }));
  const TrustScore = document.querySelectorAll(".__trust_score");
  for (const element of TrustScore) {
    element.remove();
  }
  showScore();
  chrome.storage.local.set({ Status: { Count: Count, Result: Result } }, () => {
    console.log("status submitted", { Count, Result });
    chrome.runtime.sendMessage({ action: "setBadge", count: Count })
  });
};

// Removes all highlighted dark patterns
const removePatterns = () => {
  Count = 0;
  Total = 0;
  Result = [];
  chrome.storage.local.set({ Status: { Count: Count, Result: Result } }, () => {
    const darkPatterns = document.querySelectorAll(".__dark_pattern");
    const messages = document.querySelectorAll(".__message");
    const TrustScore = document.querySelectorAll(".__trust_score");
    for (const element of messages) {
      element.remove();
    }
    for (const element of darkPatterns) {
      element.classList.remove("__dark_pattern");
    }
    for (const element of TrustScore) {
      element.remove();
    }
    console.log("status submitted", { Count, Result });
  });
  chrome.runtime.sendMessage({ action: "removeBadge" });
};

const FilterData = (text) => {
  const emptyLineSplit = text.split(/\s*\n\s*/);
  const filteredElements = emptyLineSplit.map((element) => element.trim());
  return filteredElements.filter((element) => {
    return element.split(/\s+/).length > 2;
  });
};

const Detect = () => {
  const patterns = ScrapData();
  DetectPatterns(patterns, commonPatterns);
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "report") {
    window.alert("Report sent.");
    sendResponse({ response: "done" });
  } else if (request.action === "detect") {
    Detect();
    sendResponse({ response: "Highlighted Patterns." });
  } else if (request.action === "remove") {
    removePatterns();
    sendResponse({ response: "Removed Patterns." });
  }
});
