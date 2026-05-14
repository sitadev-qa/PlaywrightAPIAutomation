/**
 * Orders - Update Order Tests
 * Tests order updates and modifications
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../utils/paypal/authHelper');

test.describe('Orders - Update Order', () => {
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
            value: '150.00'
          },
          description: 'Test Order for Updates'
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

  test('[SC046] Should add invoice number to order', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = [
      {
        op: 'add',
        path: '/purchase_units/@reference_id==default/invoice_id',
        value: 'INV-2026-001'
      }
    ];

    const response = await request.patch(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect([200, 204]).toContain(response.status());
  });

  test('[SC047] Should add shipping address to order', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = [
      {
        op: 'add',
        path: '/purchase_units/@reference_id==default/shipping/address',
        value: {
          address_line_1: '123 Main Street',
          admin_area_2: 'San Jose',
          admin_area_1: 'CA',
          postal_code: '95131',
          country_code: 'US'
        }
      }
    ];

    const response = await request.patch(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect([200, 204]).toContain(response.status());
  });

  test('[SC048] Should update order with custom amount', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = [
      {
        op: 'replace',
        path: '/purchase_units/@reference_id==default/amount',
        value: {
          currency_code: 'USD',
          value: '200.00'
        }
      }
    ];

    const response = await request.patch(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect([200, 204]).toContain(response.status());
  });

  test('[SC049] Should fail to update non-existent order', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = [
      {
        op: 'add',
        path: '/purchase_units/@reference_id==default/invoice_id',
        value: 'INV-2026-001'
      }
    ];

    const response = await request.patch(`${baseUrl}/v1/checkout/orders/INVALID-ORDER-ID`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect(response.status()).toBe(404);
  });

  test('[SC050] Should fail without authorization', async ({ request }) => {
    const payload = [
      {
        op: 'add',
        path: '/purchase_units/@reference_id==default/invoice_id',
        value: 'INV-2026-001'
      }
    ];

    const response = await request.patch(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect(response.status()).toBe(401);
  });

  test('[SC051] Should support multiple patch operations', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = [
      {
        op: 'add',
        path: '/purchase_units/@reference_id==default/invoice_id',
        value: 'INV-2026-002'
      },
      {
        op: 'add',
        path: '/purchase_units/@reference_id==default/description',
        value: 'Updated order description'
      }
    ];

    const response = await request.patch(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect([200, 204]).toContain(response.status());
  });
});
