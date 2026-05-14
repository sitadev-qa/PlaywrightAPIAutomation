/**
 * Orders - Create Order Tests
 * Tests order creation with various payment sources and configurations
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../utils/paypal/authHelper');
const DataHelper = require('../../utils/paypal/dataHelper');
const Validators = require('../../utils/paypal/validators');

test.describe('Orders - Create Order', () => {
  let authHelper;
  let baseUrl;

  test.beforeEach(async ({ request }) => {
    baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    authHelper = new AuthHelper(request);
    await authHelper.getAccessToken();
  });

  test('[SC029] Should create order with minimal required fields', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    await authHelper.getAccessToken();

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
        'Authorization': `Bearer ${authHelper.tokenCache.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect(response.status()).toBe(201);
    const order = await response.json();
    
    const validation = Validators.validateOrderResponse(order);
    expect(validation.valid).toBe(true);
    expect(order.id).toBeTruthy();
    expect(order.status).toBe('CREATED');
  });

  test('[SC030] Should create order with PayPal payment source', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '150.00'
          },
          description: 'Test Order with PayPal'
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

    expect(response.status()).toBe(201);
    const order = await response.json();
    expect(order.id).toBeTruthy();
  });

  test('[SC031] Should include payer information in response', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = DataHelper.generateOrderPayload();

    const response = await request.post(`${baseUrl}/v1/checkout/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    const order = await response.json();
    expect(order.payer).toBeTruthy();
    expect(order.payer.email_address || order.payer.payer_id).toBeTruthy();
  });

  test('[SC032] Should support multiple purchase units', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '50.00'
          },
          description: 'Unit 1'
        },
        {
          amount: {
            currency_code: 'USD',
            value: '75.00'
          },
          description: 'Unit 2'
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

    expect(response.status()).toBe(201);
    const order = await response.json();
    expect(order.purchase_units.length).toBe(2);
  });

  test('[SC033] Should support AUTHORIZE intent', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '200.00'
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

    expect(response.status()).toBe(201);
    const order = await response.json();
    expect(order.id).toBeTruthy();
  });

  test('[SC034] Should include approval links in response', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '100.00'
          }
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

    const order = await response.json();
    expect(order.links).toBeTruthy();
    
    const approveLink = order.links.find(link => link.rel === 'approve');
    expect(approveLink).toBeTruthy();
    expect(approveLink.href).toMatch(/paypal\.com/);
  });

  test('[SC035] Should support various currency codes', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const currencies = ['EUR', 'GBP', 'JPY'];

    for (const currency of currencies) {
      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
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

      expect(response.status()).toBe(201);
      const order = await response.json();
      expect(order.purchase_units[0].amount.currency_code).toBe(currency);
    }
  });

  test('[SC036] Should fail with missing intent', async ({ request }) => {
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
    const error = await response.json();
    expect(error.name || error.error).toBeTruthy();
  });

  test('[SC037] Should fail with missing amount', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
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
  });
});
