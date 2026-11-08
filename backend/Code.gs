// ELEVATE 5.0 form backend. Bound to a Google Sheet (Extensions > Apps Script).
// Run setup() once, then Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.

// The server's own price list. The browser's prices are never trusted. Keep in step with content.js.
const FEE = 7500;
const PRICES = {
  tee: { price: 2500, sizes: ['S', 'M', 'L', 'XL'] },
  hoodie: { price: 5500, sizes: ['S', 'M', 'L', 'XL'] },
  book: { price: 1500 },
  pin: { price: 600, sizes: ['Lumen', 'Forge', 'Meridian', 'Kindle'] },
  flask: { price: 2800 },
  tote: { price: 1200 },
};
const HOUSES = ['', 'lumen', 'forge', 'meridian', 'kindle'];
const MAX_SLIP_BYTES = 5 * 1024 * 1024;
const COLUMNS = {
  Registrations: ['Status', 'Reference', 'Submitted', 'Name', 'Email', 'Phone', 'University', 'Degree and year', 'Why', 'Dietary', 'House', 'Amount', 'Slip', 'Submission ID'],
  Merch: ['Status', 'Reference', 'Submitted', 'Name', 'Email', 'Phone', 'Items', 'Amount', 'Slip', 'Submission ID'],
};

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(COLUMNS).forEach(function (name) {
    const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    sheet.getRange(1, 1, 1, COLUMNS[name].length).setValues([COLUMNS[name]]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  });
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SLIP_FOLDER')) {
    props.setProperty('SLIP_FOLDER', DriveApp.createFolder('ELEVATE 5.0 payment slips').getId()); // private by default
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return reply({ ok: true, reference: 'E5-OK' }); // ponytail: honeypot only. Add a captcha if real bot traffic shows up in the Sheet.
    lock.waitLock(20000);
    return reply(save(d));
  } catch (err) {
    if (err instanceof BadInput) return reply({ ok: false, error: err.message });
    console.error(err);
    return reply({ ok: false, error: 'Something went wrong on our side. Please try again.' });
  } finally {
    lock.releaseLock();
  }
}

function save(d) {
  const isMerch = d.kind === 'merch';
  if (!isMerch && d.kind !== 'registration') throw new BadInput('Unknown form.');
  const sheet = SpreadsheetApp.getActive().getSheetByName(isMerch ? 'Merch' : 'Registrations');

  const submissionId = text(d.submissionId, 'Submission', 64);
  const seen = sheet.createTextFinder(submissionId).matchEntireCell(true).findNext();
  if (seen) return { ok: true, reference: sheet.getRange(seen.getRow(), 2).getValue() }; // retry of a saved form

  const name = text(d.name, 'Name', 120);
  const email = text(d.email, 'Email', 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BadInput('Please enter a valid email address.');
  const phone = text(d.phone, 'Phone', 30);
  const slip = decodeSlip(d.slip);

  const reference = 'E5-' + (isMerch ? 'M-' : 'R-') + Utilities.getUuid().slice(0, 6).toUpperCase();
  const folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('SLIP_FOLDER'));
  const file = folder.createFile(Utilities.newBlob(slip.bytes, slip.mime, reference + '.' + slip.ext));
  const now = new Date();

  let row;
  if (isMerch) {
    const order = computeOrder(d.items);
    row = ['Pending', reference, now, name, email, phone, order.summary, order.total, file.getUrl(), submissionId];
  } else {
    if (HOUSES.indexOf(d.house || '') < 0) throw new BadInput('Unknown house.');
    row = ['Pending', reference, now, name, email, phone, text(d.university, 'University', 160), text(d.degree, 'Degree and year', 160),
      text(d.why, 'Your answer', 1500), String(d.dietary || '').slice(0, 300), d.house || '', FEE, file.getUrl(), submissionId];
  }
  sheet.appendRow(row.map(safeCell));
  return { ok: true, reference: reference };
}

// Prices come from PRICES only. Anything the browser sends beyond id, size and qty is ignored.
function computeOrder(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) throw new BadInput('Your satchel is empty.');
  let total = 0;
  const parts = items.map(function (it) {
    const product = Object.prototype.hasOwnProperty.call(PRICES, it.id) ? PRICES[it.id] : null;
    if (!product) throw new BadInput('An item in your satchel is no longer available.');
    if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > 10) throw new BadInput('Please choose between 1 and 10 of each item.');
    if (product.sizes && product.sizes.indexOf(it.size) < 0) throw new BadInput('Please choose a size for each item.');
    total += product.price * it.qty;
    return it.qty + ' x ' + it.id + (product.sizes ? ' (' + it.size + ')' : '');
  });
  return { total: total, summary: parts.join(', ') };
}

// The file type is read from the file's first bytes, not from what the browser claims.
function sniffSlip(bytes) {
  const b = function (i) { return bytes[i] & 255; };
  if (b(0) === 0xFF && b(1) === 0xD8 && b(2) === 0xFF) return { mime: 'image/jpeg', ext: 'jpg' };
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4E && b(3) === 0x47) return { mime: 'image/png', ext: 'png' };
  if (b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46) return { mime: 'application/pdf', ext: 'pdf' };
  return null;
}

function decodeSlip(slip) {
  if (!slip || typeof slip.data !== 'string') throw new BadInput('Please attach your payment slip.');
  const bytes = Utilities.base64Decode(slip.data);
  if (bytes.length > MAX_SLIP_BYTES) throw new BadInput('The slip must be 5 MB or smaller.');
  const type = sniffSlip(bytes);
  if (!type) throw new BadInput('The slip must be a JPG, PNG or PDF.');
  return { bytes: bytes, mime: type.mime, ext: type.ext };
}

function text(value, label, max) {
  const s = String(value == null ? '' : value).trim();
  if (!s) throw new BadInput(label + ' is required.');
  if (s.length > max) throw new BadInput(label + ' is too long.');
  return s;
}

// Stops typed values like =IMPORTXML(...) from running as spreadsheet formulas.
function safeCell(v) {
  return typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function BadInput(message) { this.message = message; }

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
