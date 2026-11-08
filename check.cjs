// Run: node check.cjs
// Checks the money path: server totals, tampering, slip sniffing, and that site prices match server prices.
const fs = require('fs'), vm = require('vm'), assert = require('assert');

const ctx = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(__dirname + '/content.js', 'utf8'), ctx);
const s = vm.runInContext(fs.readFileSync(__dirname + '/backend/Code.gs', 'utf8') + ';({computeOrder, sniffSlip, safeCell, PRICES, FEE})', ctx);
const site = ctx.window.ELEVATE;
const rejects = (items, why) => assert.throws(() => s.computeOrder(items), () => true, why);

// totals
const o = s.computeOrder([{ id: 'tee', size: 'M', qty: 2 }, { id: 'book', qty: 1 }]);
assert.strictEqual(o.total, s.PRICES.tee.price * 2 + s.PRICES.book.price);

// a browser-sent price is ignored
assert.strictEqual(s.computeOrder([{ id: 'book', qty: 1, price: 1 }]).total, s.PRICES.book.price);

// bad orders
rejects([], 'empty');
rejects([{ id: 'nope', qty: 1 }], 'unknown id');
rejects([{ id: 'constructor', qty: 1 }], 'prototype key');
rejects([{ id: 'book', qty: 0 }], 'zero qty');
rejects([{ id: 'book', qty: -1 }], 'negative qty');
rejects([{ id: 'book', qty: 1.5 }], 'fractional qty');
rejects([{ id: 'book', qty: 11 }], 'over limit');
rejects([{ id: 'tee', qty: 1 }], 'missing size');
rejects([{ id: 'tee', size: 'XXXL', qty: 1 }], 'bad size');

// slip types come from the bytes (Apps Script bytes are signed)
assert.strictEqual(s.sniffSlip([-1, -40, -1, -32]).ext, 'jpg');
assert.strictEqual(s.sniffSlip([-119, 80, 78, 71]).ext, 'png');
assert.strictEqual(s.sniffSlip([37, 80, 68, 70]).ext, 'pdf');
assert.strictEqual(s.sniffSlip([60, 115, 99, 114]), null);

// formulas are neutralised
assert.strictEqual(s.safeCell('=HYPERLINK("x")'), '\'=HYPERLINK("x")');
assert.strictEqual(s.safeCell('+94771234567'), "'+94771234567");
assert.strictEqual(s.safeCell('Amara'), 'Amara');

// the site and server agree
assert.strictEqual(site.fee, s.FEE, 'fee differs between content.js and Code.gs');
assert.strictEqual(site.merch.length, Object.keys(s.PRICES).length, 'merch list differs');
site.merch.forEach(m => {
  assert.ok(s.PRICES[m.id], m.id + ' missing from Code.gs');
  assert.strictEqual(m.price, s.PRICES[m.id].price, m.id + ' price differs');
  assert.deepStrictEqual([...(m.sizes || [])], [...(s.PRICES[m.id].sizes || [])], m.id + ' sizes differ');
});

console.log('All checks passed.');
