# Kerry Tracking Lookup (Mobile Number -> Tracking Numbers)

This project lets users enter a mobile number on a web page and see all related Kerry tracking numbers.

## Tech Stack

- Frontend: Vanilla JavaScript (`index.html`, `style.css`, `app.js`)
- Backend: Google Apps Script (`Code.gs`)
- Database: Google Sheet
- Hosting (static + serverless API): GitHub Pages + Google Apps Script Web App

## 1) Prepare Google Sheet (Database)

Create a Google Sheet with sheet name: `tracking_data`

Use this header row:

- Column A: `mobile_number`
- Column B: `tracking_number`

Example data:

| mobile_number | tracking_number |
| --- | --- |
| 0812345678 | TH1234567890 |
| 0812345678 | TH9988776655 |
| 0899990000 | TH1122334455 |

## 2) Deploy Google Apps Script Backend

1. Open the Google Sheet.
2. Go to **Extensions -> Apps Script**.
3. Replace default script with content from `Code.gs`.
4. Save the project.
5. Deploy:
   - Click **Deploy -> New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** and copy the Web App URL.

## 3) Configure Frontend

Open `app.js` and set your Apps Script URL:

```js
const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
```

## 4) Publish on GitHub Pages

1. Push this repo to GitHub.
2. In GitHub repo settings, open **Pages**.
3. Set source to deploy from `main` branch (root folder).
4. Save and wait for deployment.
5. Open your GitHub Pages URL and test by entering a mobile number.

## Notes

- If you update `Code.gs`, redeploy a new version in Apps Script.
- Make sure your sheet name exactly matches `tracking_data`.
- Mobile matching is exact string matching.
