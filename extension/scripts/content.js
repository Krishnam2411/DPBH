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

const Regex = {
  timer: /^(\d{2}:){2}\d{2}(:\d{2}(:\d{2})?)?$/,
  timer2: /^(\d{1,2}h)?(\d{1,2}m)?\d{1,2}s$/,
};

async function initPatternHighlighter() {
  const activationState = await chrome.runtime.sendMessage({
    action: "getActivationState",
  });
  if (activationState.isEnabled === true) {
    console.log("Pattern highlighting started ... ");
    await detect();
    chrome.runtime.onMessage.addListener(function (
      message,
      sender,
      sendResponse
    ) {
      if (message.action === "remove") {
        remove();
        sendResponse({ removing: true });
      } else if (message.action === "highlightPatterns") {
        detect();
        sendResponse({ started: true });
      } else if (message.action === "report") {
        window.alert("Report sent.");
        sendResponse({ success: true });
      } else if (message.action === "takeScreenshot") {
        chrome.runtime.sendMessage({ action: "takeScreenshot" });
        sendResponse({ success: true });
      }
    });
  } else {
    console.log("Extension is disabled");
  }
}

initPatternHighlighter();

function calcScore(stats) {
  let score = 0;
  const weights = [2.7, 2.1, 1.8, 1.4, 1.2, 1.0, 0.8, 1.0];
  for (let i = 0; i < stats.length; ++i) {
    score += stats[i].count * weights[i];
  }
  return Math.max(100 - 7 * score, 0);
}

const showScore = (stats) => {
  let bgColor = "",
    score = calcScore(stats);
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

const FilterData = (text) => {
  const emptyLineSplit = text.split(/\s*\n\s*/);
  const filteredElements = emptyLineSplit.map((element) => element.trim());
  return filteredElements.filter((element) => {
    return element.split(/\s+/).length > 2;
  });
};

function remove() {
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
}

async function detect() {
  const text = scrapText();
  fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    body: JSON.stringify(text),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Credentials": "true",
    },
  })
    .then((response) => response.json())
    .then((json) => {
      highlightPatterns([...commonPatterns, ...json.response]);
    })
    .catch((error) => {
      console.log("Error :", error);
    });
}

function scrapText() {
  const textContent = document.body.innerText;
  const dataset = FilterData(textContent).reduce(
    (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
    []
  );
  return dataset;
}

function highlightPatterns(result) {
  console.log(result, typeof result);
  let results = {
    Total: 0,
    Count: 0,
    Stats: [],
  };
  const freqMap = {};
  const allElements = document.body.querySelectorAll("*");
  for (const darkPattern of result) {
    for (const element of allElements) {
      results.Total++;
      if (
        element.innerText?.replace(/\n/g, "").trim().toLowerCase() ===
        darkPattern.pattern.toLowerCase()
      ) {
        if (darkPattern.response !== "Not Dark Pattern") {
          freqMap[darkPattern.response] =
            (freqMap[darkPattern.response] || 0) + 1;
          results.Count++;
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
  for (const element of allElements) {
    if (
      element.innerText
        ?.replace(/[\n\s]/g, "")
        .trim()
        .toLowerCase()
        .match(Regex.timer) ||
      element.innerText
        ?.replace(/[\n\s]/g, "")
        .trim()
        .toLowerCase()
        .match(Regex.timer2)
    ) {
      freqMap["False Urgency"] = (freqMap["False Urgency"] || 0) + 1;
      results.Count++;
      element.classList.add("__dark_pattern");
      const dialogue = document.createElement("span");
      dialogue.classList.add("__message");
      dialogue.innerText = "False Urgency";
      element.appendChild(dialogue);
      break;
    }
  }
  results.Stats = Object.entries(freqMap).map(([response, count]) => ({
    response,
    count,
  }));
  showScore(results.Stats);
  sendResults(results);
  console.log(results);
}

function sendResults(results) {
  chrome.runtime.sendMessage({ results: results }, function (response) {});
}
