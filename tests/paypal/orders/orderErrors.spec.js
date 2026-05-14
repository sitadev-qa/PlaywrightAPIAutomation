/**
 * Orders - Error Scenarios Tests
 * Tests error handling and edge cases
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../utils/paypal/authHelper');
const Validators = require('../../utils/paypal/validators');

test.describe('Orders - Error Scenarios', () => {
  let authHelper;
  let baseUrl;

  test.beforeEach(async ({ request }) => {
    baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    authHelper = new AuthHelper(request);
    await authHelper.getAccessToken();
  });

  test('[SC064] Should return 404 for non-existent order', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/checkout/orders/NONEXISTENT-ID`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(404);
    const error = await response.json();
    expect(error.name || error.error).toBeTruthy();
  });

  test('[SC065] Should return 400 for missing required fields', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      purchase_units: [{}]
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
    
    const validation = Validators.validateErrorResponse(error);
    expect(validation.valid).toBe(true);
  });

  test('[SC066] Should validate currency code format', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'INVALID',
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

  test('[SC067] Should validate amount format', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: 'INVALID'
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

  test('[SC068] Should reject malformed JSON', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: '{ invalid json'
    });

    expect(response.status()).toBe(400);
  });

  test('[SC069] Should return 401 for invalid token', async ({ request }) => {
    const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
      headers: {
        'Authorization': 'Bearer invalid_token',
        'Content-Type': 'application/json'
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: '100.00'
            }
          }
        ]
      }
    });

    expect(response.status()).toBe(401);
  });

  test('[SC070] Should return 401 when missing authorization header', async ({ request }) => {
    const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: '100.00'
            }
          }
        ]
      }
    });

    expect(response.status()).toBe(401);
  });

  test('[SC071] Should reject zero or negative amounts', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '-50.00'
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

  test('[SC072] Should validate amount maximum value', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '99999999.99'
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
});
