/**
 * Orders - Get Order Details Tests
 * Tests order retrieval and information validation
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../utils/paypal/authHelper');

test.describe('Orders - Get Order Details', () => {
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
            value: '100.00'
          },
          description: 'Test Order for Details'
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

  test('[SC038] Should retrieve order details successfully', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    const order = await response.json();
    
    expect(order.id).toBe(testOrderId);
    expect(order.status).toBeTruthy();
    expect(order.purchase_units).toBeTruthy();
  });

  test('[SC039] Should include complete order structure', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const order = await response.json();

    expect(order.id).toBeTruthy();
    expect(order.status).toBeTruthy();
    expect(order.payer).toBeTruthy();
    expect(order.purchase_units).toBeTruthy();
    expect(order.links).toBeTruthy();
    expect(order.create_time).toBeTruthy();
    expect(order.update_time).toBeTruthy();
  });

  test('[SC040] Should include payer information', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const order = await response.json();
    
    expect(order.payer).toBeTruthy();
    expect(order.payer.email_address || order.payer.payer_id).toBeTruthy();
  });

  test('[SC041] Should include purchase unit details', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const order = await response.json();
    const unit = order.purchase_units[0];

    expect(unit.amount).toBeTruthy();
    expect(unit.amount.currency_code).toBe('USD');
    expect(unit.amount.value).toBe('100.00');
  });

  test('[SC042] Should fail with invalid order ID', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/checkout/orders/INVALID-ORDER-ID`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(404);
    const error = await response.json();
    expect(error.name || error.error).toBeTruthy();
  });

  test('[SC043] Should fail without authorization', async ({ request }) => {
    const response = await request.get(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('[SC044] Should fail with invalid token', async ({ request }) => {
    const response = await request.get(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': 'Bearer invalid_token',
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('[SC045] Should include HATEOAS links', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/checkout/orders/${testOrderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const order = await response.json();

    expect(order.links).toBeTruthy();
    expect(Array.isArray(order.links)).toBe(true);
    
    // Should have standard links
    const linkRels = order.links.map(link => link.rel);
    expect(linkRels).toContain('self');
  });
});
