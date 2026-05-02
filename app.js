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

function renderResults(trackingNumbers) {
  clearResults();
  trackingNumbers.forEach((trackingNumber) => {
    const li = document.createElement("li");
    li.className = "result-item";

    const trackingText = document.createElement("span");
    trackingText.className = "tracking-number";
    trackingText.textContent = trackingNumber;

    const kexLink = document.createElement("a");
    kexLink.className = "track-btn";
    kexLink.href = `${KEX_TRACK_BASE_URL}${encodeURIComponent(trackingNumber)}`;
    kexLink.target = "_blank";
    kexLink.rel = "noopener noreferrer";
    kexLink.textContent = "Track on KEX";

    li.appendChild(trackingText);
    li.appendChild(kexLink);
    resultList.appendChild(li);
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

    if (!data.trackingNumbers || data.trackingNumbers.length === 0) {
      setStatus("No tracking numbers found for this mobile number.", "error");
      return;
    }

    renderResults(data.trackingNumbers);
    setStatus(`Found ${data.trackingNumbers.length} tracking number(s).`, "success");
  } catch (error) {
    setStatus(`Error: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
  }
});
