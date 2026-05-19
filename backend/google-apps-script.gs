// Google Apps Script web app for ComplainAboutOligos.
// Paste this into the Apps Script editor attached to your submissions Google Sheet,
// then deploy as: Web app, Execute as = Me, Who has access = Anyone.
//
// Spreadsheet must have two tabs:
//   "Submissions" with columns: Timestamp | Segment | Category | Details | UserAgent | Email
//   "Visits"      with columns: Timestamp | SessionID | Referrer | UserAgent | Screen

const SHEET_NAME = 'Submissions';
const VISITS_SHEET_NAME = 'Visits';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.type === 'visit') {
      return logVisit(data);
    }
    return logComplaint(data);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}

function logComplaint(data) {
  // Honeypot: bots fill the hidden "website" field; real users never see it.
  if (data.website) {
    return json({ ok: true });
  }

  const segment = String(data.segment || '').slice(0, 200);
  const category = String(data.category || '').slice(0, 200);
  const details = String(data.details || '').slice(0, 5000);
  const userAgent = String(data.userAgent || '').slice(0, 500);
  const email = String(data.email || '').slice(0, 200);

  if (!segment || !category || !details) {
    return json({ ok: false, error: 'Missing required fields' }, 400);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return json({ ok: false, error: 'Sheet tab not found' }, 500);
  }

  sheet.appendRow([new Date(), segment, category, details, userAgent, email]);
  return json({ ok: true });
}

function logVisit(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VISITS_SHEET_NAME);
  if (!sheet) {
    return json({ ok: false, error: 'Visits sheet tab not found' }, 500);
  }

  const sessionId = String(data.sessionId || '').slice(0, 32);
  const referrer = String(data.referrer || '').slice(0, 500);
  const userAgent = String(data.userAgent || '').slice(0, 500);
  const screen = String(data.screen || '').slice(0, 50);

  sheet.appendRow([new Date(), sessionId, referrer, userAgent, screen]);
  return json({ ok: true });
}

function doGet() {
  return json({ ok: true, message: 'ComplainAboutOligos submission endpoint' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
