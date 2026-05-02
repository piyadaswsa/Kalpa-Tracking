/**
 * Google Apps Script backend for Kerry tracking lookup.
 *
 * Sheet format:
 * Column A: mobile_number
 * Column B: tracking_number
 * Row 1: headers
 */

const SHEET_NAME = "tracking_data";

function doGet(e) {
  try {
    const mobile = (e.parameter.mobile || "").trim();
    if (!mobile) {
      return jsonOutput({
        success: false,
        message: "Missing required query parameter: mobile",
      });
    }

    const trackingNumbers = getTrackingNumbersByMobile(mobile);

    return jsonOutput({
      success: true,
      mobile,
      trackingNumbers,
    });
  } catch (error) {
    return jsonOutput({
      success: false,
      message: error.message,
    });
  }
}

function getTrackingNumbersByMobile(mobile) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" not found.`);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const results = [];

  values.forEach((row) => {
    const mobileInSheet = String(row[0]).trim();
    const trackingInSheet = String(row[1]).trim();

    if (mobileInSheet === mobile && trackingInSheet) {
      results.push(trackingInSheet);
    }
  });

  return results;
}

function jsonOutput(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
