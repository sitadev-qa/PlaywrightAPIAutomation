/**
 * Data-Driven Tests - Orders CSV Driven
 * Tests order creation with multiple data variations
 */
const { test, expect } = require('@playwright/test');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const AuthHelper = require('../../utils/paypal/authHelper');
const DataHelper = require('../../utils/paypal/dataHelper');

// Load test data
const csvPath = path.join(__dirname, '../../data/paypal/orders.csv');
const csvData = fs.readFileSync(csvPath, 'utf8');
const { data: testDataRecords } = Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true
});

test.describe('Data-Driven - Orders CSV', () => {
  let baseUrl;

  test.beforeEach(() => {
    baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
  });

  testDataRecords.forEach((record, idx) => {
    test(`[CSV-ORD-${idx + 1}] Create order with ${record.scenario} data`, async ({ request }) => {
      const authHelper = new AuthHelper(request);
      const token = await authHelper.getAccessToken();

      expect(token).toBeTruthy();

      // Validate test data
      expect(record.amount).toBeTruthy();
      expect(record.currency).toBeTruthy();
      expect(DataHelper.validateAmount(parseFloat(record.amount))).toBe(true);
      expect(DataHelper.validateCurrency(record.currency)).toBe(true);

      // Create order payload from CSV data
      const payload = {
        intent: record.intent || 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: record.currency,
              value: DataHelper.formatAmount(parseFloat(record.amount))
            },
            description: record.description || `Test Order - ${record.scenario}`
          }
        ]
      };

      const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      // Assertions
      expect(response.status()).toBe(201);
      const order = await response.json();

      expect(order.id).toBeTruthy();
      expect(order.status).toBe(record.status || 'CREATED');
      expect(order.purchase_units[0].amount.value).toBe(DataHelper.formatAmount(parseFloat(record.amount)));
      expect(order.purchase_units[0].amount.currency_code).toBe(record.currency);
    });
  });
});
