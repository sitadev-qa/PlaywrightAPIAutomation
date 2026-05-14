/**
 * Orders - Confirm Payment Source Tests
 * Tests payment source confirmation functionality
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../utils/paypal/authHelper');

test.describe('Orders - Confirm Payment Source', () => {
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
            value: '125.00'
          },
          description: 'Test Order for Payment Confirmation'
        }
      ],
      payment_source: {
        paypal: {}
      }
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

  test('[SC059] Should confirm payment source successfully', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      payment_source: {
        paypal: {}
      }
    };

    const response = await request.post(
      `${baseUrl}/v1/checkout/orders/${testOrderId}/confirm-payment-source`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      }
    );

    expect([200, 201]).toContain(response.status());
    const result = await response.json();
    expect(result.id).toBeTruthy();
  });

  test('[SC060] Should return order with payment details', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      payment_source: {
        paypal: {}
      }
    };

    const response = await request.post(
      `${baseUrl}/v1/checkout/orders/${testOrderId}/confirm-payment-source`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      }
    );

    const result = await response.json();

    expect(result.id).toBe(testOrderId);
    expect(result.status).toBeTruthy();
    expect(result.purchase_units).toBeTruthy();
  });

  test('[SC061] Should fail with invalid order ID', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      payment_source: {
        paypal: {}
      }
    };

    const response = await request.post(
      `${baseUrl}/v1/checkout/orders/INVALID-ORDER-ID/confirm-payment-source`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      }
    );

    expect(response.status()).toBe(404);
  });

  test('[SC062] Should fail without authorization', async ({ request }) => {
    const payload = {
      payment_source: {
        paypal: {}
      }
    };

    const response = await request.post(
      `${baseUrl}/v1/checkout/orders/${testOrderId}/confirm-payment-source`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        data: payload
      }
    );

    expect(response.status()).toBe(401);
  });

  test('[SC063] Should fail with invalid payment source', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      payment_source: {
        invalid_method: {}
      }
    };

    const response = await request.post(
      `${baseUrl}/v1/checkout/orders/${testOrderId}/confirm-payment-source`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      }
    );

    expect([400, 422]).toContain(response.status());
  });
});
