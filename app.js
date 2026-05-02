const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw_TaHEwkAPaaQz3-WAh7oNABuYF7jtxKDRQK6TLbn2_QMZkUdZvUWLwpqq3cDspIrg/exec";

const form = document.getElementById("lookup-form");
const mobileInput = document.getElementById("mobile-number");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const resultSection = document.getElementById("result-section");
const resultList = document.getElementById("result-list");
const KEX_TRACK_BASE_URL = "https://th.kex-express.com/th/track/?track=";

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

function clearResults() {
  resultList.innerHTML = "";
  resultSection.classList.add("hidden");
}

function normalizeRecords(data) {
  if (Array.isArray(data.trackingItems)) {
    return data.trackingItems.map((item) => ({
      trackingNumber: String(item.trackingNumber || "").trim(),
      timestamp: item.timestamp || "",
    }));
  }

  if (Array.isArray(data.trackingNumbers)) {
    return data.trackingNumbers.map((trackingNumber) => ({
      trackingNumber: String(trackingNumber || "").trim(),
      timestamp: "",
    }));
  }

  return [];
}

function formatTimestamp(timestampValue) {
  if (!timestampValue) return "No timestamp";
  const date = new Date(timestampValue);
  if (Number.isNaN(date.getTime())) return String(timestampValue);
  return date.toLocaleString();
}

function groupRecordsByTime(records) {
  const groups = new Map();
  records.forEach((record) => {
    const timeLabel = formatTimestamp(record.timestamp);
    if (!groups.has(timeLabel)) {
      groups.set(timeLabel, []);
    }
    groups.get(timeLabel).push(record);
  });
  return groups;
}

function renderResults(records) {
  clearResults();
  const grouped = groupRecordsByTime(records);

  grouped.forEach((groupItems, timeLabel) => {
    const groupLi = document.createElement("li");
    groupLi.className = "time-group";

    const groupTitle = document.createElement("h3");
    groupTitle.className = "time-group-title";
    groupTitle.textContent = timeLabel;
    groupLi.appendChild(groupTitle);

    const groupList = document.createElement("ul");
    groupList.className = "group-list";

    groupItems.forEach((record) => {
      const row = document.createElement("li");
      row.className = "result-item";

      const textWrap = document.createElement("div");
      textWrap.className = "item-text";

      const trackingText = document.createElement("div");
      trackingText.className = "tracking-number";
      trackingText.textContent = record.trackingNumber;

      const timeText = document.createElement("div");
      timeText.className = "tracking-time";
      timeText.textContent = `Time: ${formatTimestamp(record.timestamp)}`;

      const kexLink = document.createElement("a");
      kexLink.className = "track-btn";
      kexLink.href = `${KEX_TRACK_BASE_URL}${encodeURIComponent(record.trackingNumber)}`;
      kexLink.target = "_blank";
      kexLink.rel = "noopener noreferrer";
      kexLink.textContent = "Track on KEX";

      textWrap.appendChild(trackingText);
      textWrap.appendChild(timeText);
      row.appendChild(textWrap);
      row.appendChild(kexLink);
      groupList.appendChild(row);
    });

    groupLi.appendChild(groupList);
    resultList.appendChild(groupLi);
  });

  resultSection.classList.remove("hidden");
}

async function fetchTrackingByMobile(mobileNumber) {
  const url = `${APPS_SCRIPT_WEB_APP_URL}?mobile=${encodeURIComponent(mobileNumber)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearResults();

  const mobileNumber = mobileInput.value.trim();
  if (!mobileNumber) {
    setStatus("Please enter a mobile number.", "error");
    return;
  }

  if (APPS_SCRIPT_WEB_APP_URL.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
    setStatus("Please configure your Apps Script web app URL in app.js first.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Searching...", "");

  try {
    const data = await fetchTrackingByMobile(mobileNumber);
    if (!data.success) {
      throw new Error(data.message || "Unknown error from server.");
    }

    const records = normalizeRecords(data).filter((item) => item.trackingNumber);
    if (records.length === 0) {
      setStatus("No tracking numbers found for this mobile number.", "error");
      return;
    }

    renderResults(records);
    const hasTimestamp = records.some((item) => item.timestamp);
    if (!hasTimestamp) {
      setStatus(
        `Found ${records.length} tracking number(s), but no timestamp was returned by API.`,
        "error"
      );
      return;
    }

    setStatus(`Found ${records.length} tracking number(s).`, "success");
  } catch (error) {
    setStatus(`Error: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
  }
});
