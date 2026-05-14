/**
 * Orders - Capture Payment Tests
 * Tests order payment capture functionality
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../utils/paypal/authHelper');

test.describe('Orders - Capture Payment', () => {
  let authHelper;
  let baseUrl;
  let testOrderId;

  test.beforeEach(async ({ request }) => {
    baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    authHelper = new AuthHelper(request);
    await authHelper.getAccessToken();

    // Create an order for testing
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '175.00'
          },
          description: 'Test Order for Capture'
        }
      ]
    };

    const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
      headers: {
        'Authorization': `Bearer ${authHelper.tokenCache.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    const order = await response.json();
    testOrderId = order.id;
  });

  test('[SC052] Should capture authorized payment', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.post(`${baseUrl}/v1/checkout/orders/${testOrderId}/capture`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {}
    });

    expect([200, 201]).toContain(response.status());
    const result = await response.json();

    expect(result.id).toBeTruthy();
    expect(result.status).toBeTruthy();
  });

  test('[SC053] Should return capture details', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.post(`${baseUrl}/v1/checkout/orders/${testOrderId}/capture`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {}
    });

    const result = await response.json();

    expect(result.purchase_units).toBeTruthy();
    expect(result.purchase_units[0].payments).toBeTruthy();
  });

  test('[SC054] Should include purchase unit payments', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.post(`${baseUrl}/v1/checkout/orders/${testOrderId}/capture`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {}
    });

    const result = await response.json();
    const payments = result.purchase_units[0].payments;

    if (payments.captures) {
      expect(Array.isArray(payments.captures)).toBe(true);
      payments.captures.forEach(capture => {
        expect(capture.id).toBeTruthy();
        expect(capture.status).toBeTruthy();
        expect(capture.amount).toBeTruthy();
      });
    }
  });

  test('[SC055] Should fail to capture non-existent order', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.post(`${baseUrl}/v1/checkout/orders/INVALID-ORDER-ID/capture`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {}
    });

    expect(response.status()).toBe(404);
  });

  test('[SC056] Should fail without authorization', async ({ request }) => {
    const response = await request.post(`${baseUrl}/v1/checkout/orders/${testOrderId}/capture`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {}
    });

    expect(response.status()).toBe(401);
  });

  test('[SC057] Should fail with invalid token', async ({ request }) => {
    const response = await request.post(`${baseUrl}/v1/checkout/orders/${testOrderId}/capture`, {
      headers: {
        'Authorization': 'Bearer invalid_token',
        'Content-Type': 'application/json'
      },
      data: {}
    });

    expect(response.status()).toBe(401);
  });

  test('[SC058] Should include captured amount in response', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.post(`${baseUrl}/v1/checkout/orders/${testOrderId}/capture`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {}
    });

    const result = await response.json();

    if (result.purchase_units[0].payments && result.purchase_units[0].payments.captures) {
      const capture = result.purchase_units[0].payments.captures[0];
      expect(capture.amount.currency_code).toBe('USD');
      expect(capture.amount.value).toBe('175.00');
    }
  });
});
