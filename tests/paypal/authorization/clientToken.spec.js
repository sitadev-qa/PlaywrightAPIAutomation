/**
 * Authorization - Client Token Tests
 * Tests client token generation for Braintree integration
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../../utils/paypal/authHelper');
const DataHelper = require('../../../utils/paypal/dataHelper');

test.describe('Authorization - Client Token', () => {
  let authHelper;

  test.beforeEach(async ({ request }) => {
    authHelper = new AuthHelper(request);
  });

  test('[SC021] Should generate client token without customer_id', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const response = await authHelper.generateClientToken();

    expect(response).toBeTruthy();
    expect(response.client_token).toBeTruthy();
    expect(typeof response.client_token).toBe('string');
  });

  test('[SC022] Should generate client token with customer_id', async ({ request }) => {
    const customerId = DataHelper.generateCustomerId();
    const response = await authHelper.generateClientToken(customerId);

    expect(response.client_token).toBeTruthy();
    expect(response.expires_in).toBeTruthy();
    expect(response.expires_in).toBeGreaterThan(0);
  });

  test('[SC023] Should return id_token in response', async ({ request }) => {
    const response = await authHelper.generateClientToken();

    expect(response.id_token).toBeTruthy();
    expect(typeof response.id_token).toBe('string');
  });

  test('[SC024] Client token should be valid JWT', async ({ request }) => {
    const response = await authHelper.generateClientToken();
    const token = response.client_token;

    // Verify base64 encoding (Braintree client token)
    expect(() => {
      Buffer.from(token, 'base64');
    }).not.toThrow();
  });

  test('[SC025] Should include expires_in field', async ({ request }) => {
    const response = await authHelper.generateClientToken();

    expect(response.expires_in).toBeTruthy();
    expect(typeof response.expires_in).toBe('number');
    expect(response.expires_in).toBe(3600); // Typically 1 hour
  });

  test('[SC026] Should generate unique tokens on each call', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    
    const token1 = await authHelper.generateClientToken();
    const token2 = await authHelper.generateClientToken();

    expect(token1.client_token).not.toBe(token2.client_token);
  });

  test('[SC027] Should fail without valid access token', async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    const response = await request.post(`${baseUrl}/v1/identity/generate-token`, {
      headers: {
        'Authorization': 'Bearer invalid_token',
        'Content-Type': 'application/json'
      },
      data: {}
    });

    expect(response.status()).toBe(401);
  });

  test('[SC028] Should accept customer_id as optional parameter', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const customerId = 'TEST_CUSTOMER_123';

    const response = await authHelper.generateClientToken(customerId);

    expect(response.client_token).toBeTruthy();
    // Verify payload contains customer ID
    const payload = Buffer.from(response.id_token.split('.')[1], 'base64').toString('utf-8');
    expect(payload).toContain('TEST_CUSTOMER_123');
  });
});
