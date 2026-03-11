// ========================================
// Kitabh Tip Survey — Google Apps Script
// Paste this in Extensions → Apps Script
// Then Deploy → New deployment → Web app
// ========================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Handle single event or batch
    var events = Array.isArray(data) ? data : [data];

    events.forEach(function(event) {
      sheet.appendRow([
        event.timestamp || new Date().toISOString(),
        event.visitorId || '',
        event.authorId || '',
        event.authorName || '',
        event.action || '',
        event.selectedAmount || '',
        event.isCustomAmount ? 'Yes' : 'No',
        event.drinkType || ''
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', count: events.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Kitabh Tip Survey webhook is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}
