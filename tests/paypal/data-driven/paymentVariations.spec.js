/**
 * Data-Driven Tests - Payment Variations
 * Tests orders with various payment method and amount combinations
 */
const { test, expect } = require('@playwright/test');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const AuthHelper = require('../../utils/paypal/authHelper');
const DataHelper = require('../../utils/paypal/dataHelper');

// Load test data
const csvPath = path.join(__dirname, '../../data/paypal/paymentVariations.csv');
const csvData = fs.readFileSync(csvPath, 'utf8');
const { data: testDataRecords } = Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true
});

test.describe('Data-Driven - Payment Variations', () => {
  let baseUrl;

  test.beforeEach(() => {
    baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
  });

  testDataRecords.forEach((record, idx) => {
    test(`[CSV-PAY-${idx + 1}] Create order with ${record.scenario} payment variation`, async ({ request }) => {
      const authHelper = new AuthHelper(request);
      const token = await authHelper.getAccessToken();

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: record.currency || 'USD',
              value: DataHelper.formatAmount(parseFloat(record.amount))
            },
            description: `Payment Test - ${record.scenario}`
          }
        ],
        payment_source: {
          paypal: {}
        }
      };

      const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      if (response.status() === 201) {
        const order = await response.json();

        expect(order.id).toBeTruthy();
        expect(order.status).toBe(record.status || 'CREATED');
        expect(order.payer).toBeTruthy();
        expect(order.links).toBeTruthy();

        // Verify payment source in payer
        if (order.payer.email_address) {
          expect(DataHelper.validateEmail(order.payer.email_address)).toBe(true);
        }
      } else {
        expect([400, 422, 429]).toContain(response.status());
      }
    });
  });
});
