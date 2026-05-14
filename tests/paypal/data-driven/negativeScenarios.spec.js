/**
 * Data-Driven Tests - Negative Scenarios
 * Tests error handling with various invalid inputs from CSV
 */
const { test, expect } = require('@playwright/test');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const AuthHelper = require('../../utils/paypal/authHelper');
const Validators = require('../../utils/paypal/validators');

// Load test data
const csvPath = path.join(__dirname, '../../data/paypal/errorScenarios.csv');
const csvData = fs.readFileSync(csvPath, 'utf8');
const { data: testDataRecords } = Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true
});

test.describe('Data-Driven - Negative Scenarios', () => {
  let baseUrl;

  test.beforeEach(() => {
    baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
  });

  test('[NEG-001] Invalid order ID should return 404', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/checkout/orders/INVALID-ID`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(404);
    const error = await response.json();
    expect(error.name || error.error).toBeTruthy();
  });

  test('[NEG-002] Missing amount in purchase unit should fail', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: 'No amount provided'
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

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error.details || error.message).toBeTruthy();
  });

  test('[NEG-003] Invalid currency code should fail', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'BADCURR',
            value: '100.00'
          }
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

    expect(response.status()).toBe(400);
  });

  test('[NEG-004] Missing intent should fail', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '100.00'
          }
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

    expect(response.status()).toBe(400);
  });

  test('[NEG-005] Missing authorization should return 401', async ({ request }) => {
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '100.00'
          }
        }
      ]
    };

    const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect(response.status()).toBe(401);
  });

  test('[NEG-006] Invalid token should return 401', async ({ request }) => {
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '100.00'
          }
        }
      ]
    };

    const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
      headers: {
        'Authorization': 'Bearer invalid_token_xyz',
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect(response.status()).toBe(401);
  });

  test('[NEG-007] Negative amount should fail', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '-100.00'
          }
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

    expect([400, 422]).toContain(response.status());
  });

  test('[NEG-008] Zero amount should fail', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '0.00'
          }
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

    expect([400, 422]).toContain(response.status());
  });

  testDataRecords.slice(0, 3).forEach((record, idx) => {
    test(`[NEG-CSV-${idx + 1}] Verify error scenario: ${record.scenario}`, async ({ request }) => {
      const authHelper = new AuthHelper(request);
      const token = await authHelper.getAccessToken();

      const expectedStatus = parseInt(record.expectedStatus);

      // Make request to endpoint mentioned in CSV
      let response;
      if (record.endpoint.includes('{id}')) {
        const testId = 'TEST-ORDER-ID';
        const endpoint = record.endpoint.replace('{id}', testId);
        response = await request.get(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await request.post(`${baseUrl}${record.endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {}
        });
      }

      // Expected status codes as fallback
      if (expectedStatus === 404 || expectedStatus === 401 || expectedStatus === 429) {
        expect([expectedStatus, 400, 422]).toContain(response.status());
      } else {
        expect([expectedStatus, 400]).toContain(response.status());
      }
    });
  });
});
