import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotals,
  validateCheckoutForm,
  getNextOrderStatus,
  calculateAverageRating,
  formatCurrency,
  parseTableFromQR,
  type CartItem
} from './orderRules.ts';

test('calculateOrderTotals correctly computes subtotal, tax and total', () => {
  const sampleItems: CartItem[] = [
    { id: '1', name: 'Chole Bhature', price: 120, quantity: 2, isVeg: true },
    { id: '2', name: 'Mango Lassi', price: 70, quantity: 1, isVeg: true },
  ];

  const totals = calculateOrderTotals(sampleItems, 0.05);
  // subtotal: 120*2 + 70*1 = 310
  // tax (5% of 310) = 15.5 -> rounded to 16
  // total = 310 + 16 = 326
  assert.equal(totals.itemCount, 3);
  assert.equal(totals.subtotal, 310);
  assert.equal(totals.tax, 16);
  assert.equal(totals.total, 326);
});

test('calculateOrderTotals returns zeros for empty cart', () => {
  const totals = calculateOrderTotals([]);
  assert.equal(totals.itemCount, 0);
  assert.equal(totals.subtotal, 0);
  assert.equal(totals.tax, 0);
  assert.equal(totals.total, 0);
});

test('validateCheckoutForm accepts valid customer details', () => {
  const result = validateCheckoutForm({
    customerName: 'Aarav Patel',
    whatsappNumber: '+91 98765 43210',
    tableNumber: 'Table 04',
  });

  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('validateCheckoutForm flags short names and invalid phone numbers', () => {
  const result = validateCheckoutForm({
    customerName: ' ',
    whatsappNumber: '123',
    tableNumber: '',
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.customerName);
  assert.ok(result.errors.whatsappNumber);
  assert.ok(result.errors.tableNumber);
});

test('getNextOrderStatus advances through the order lifecycle', () => {
  assert.equal(getNextOrderStatus('received'), 'accepted');
  assert.equal(getNextOrderStatus('accepted'), 'preparing');
  assert.equal(getNextOrderStatus('preparing'), 'ready');
  assert.equal(getNextOrderStatus('ready'), 'served');
  assert.equal(getNextOrderStatus('served'), null);
  assert.equal(getNextOrderStatus('rejected'), null);
});

test('calculateAverageRating produces accurate average', () => {
  assert.equal(calculateAverageRating([5, 5, 4, 5, 4]), 4.6);
  assert.equal(calculateAverageRating([]), 4.9);
});

test('formatCurrency outputs INR symbol with numbers', () => {
  assert.equal(formatCurrency(150), '₹150');
  assert.equal(formatCurrency(1250), '₹1,250');
});

test('parseTableFromQR extracts table numbers accurately from diverse formats', () => {
  assert.equal(parseTableFromQR('https://cozybite.cafe/menu/cozybite-cafe?table=05'), 'Table 05');
  assert.equal(parseTableFromQR('http://localhost:3000/?table=table-02'), 'Table 02');
  assert.equal(parseTableFromQR('table-04'), 'Table 04');
  assert.equal(parseTableFromQR('Table 7'), 'Table 07');
  assert.equal(parseTableFromQR('08'), 'Table 08');
  assert.equal(parseTableFromQR('random-invalid-qr'), null);
});
