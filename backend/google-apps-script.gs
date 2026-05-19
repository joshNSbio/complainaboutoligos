// Google Apps Script web app for ComplainAboutOligos.
// Paste this into the Apps Script editor attached to your submissions Google Sheet,
// then deploy as: Web app, Execute as = Me, Who has access = Anyone.
//
// Sheet must have a tab named "Submissions" with these header columns in row 1:
//   A: Timestamp | B: Segment | C: Category | D: Details | E: UserAgent | F: Email

const SHEET_NAME = 'Submissions';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

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
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}

function doGet() {
  return json({ ok: true, message: 'ComplainAboutOligos submission endpoint' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
