/**
 * Authorization - Terminate Token Tests
 * Tests token termination and session cleanup
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../utils/paypal/authHelper');

test.describe('Authorization - Terminate Access Token', () => {
  let authHelper;

  test.beforeEach(async ({ request }) => {
    authHelper = new AuthHelper(request);
  });

  test('[SC008] Should terminate valid access token successfully', async ({ request }) => {
    // First generate a token
    const token = await authHelper.getAccessToken();
    expect(token).toBeTruthy();

    // Then terminate it
    const response = await authHelper.terminateSession();
    
    expect(response.status()).toBe(200);
    expect(authHelper.tokenCache.accessToken).toBeUndefined();
  });

  test('[SC009] Should return 204 or 200 for token termination', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    const baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    const response = await request.post(`${baseUrl}/v1/oauth2/token/terminate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: new URLSearchParams({
        token: token,
        token_type_hint: 'ACCESS_TOKEN'
      })
    });

    expect([200, 204]).toContain(response.status());
  });

  test('[SC010] Should fail to terminate invalid token', async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    const response = await request.post(`${baseUrl}/v1/oauth2/token/terminate`, {
      headers: {
        'Accept': 'application/json'
      },
      data: new URLSearchParams({
        token: 'invalid_token_xyz',
        token_type_hint: 'ACCESS_TOKEN'
      })
    });

    expect([400, 401]).toContain(response.status());
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('[SC011] Should fail to terminate missing token', async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    const response = await request.post(`${baseUrl}/v1/oauth2/token/terminate`, {
      headers: {
        'Accept': 'application/json'
      },
      data: new URLSearchParams({
        token_type_hint: 'ACCESS_TOKEN'
      })
    });

    expect([400, 401]).toContain(response.status());
  });

  test('[SC012] Should clear cached token after termination', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    
    // Generate and cache token
    const token = await authHelper.getAccessToken();
    expect(authHelper.tokenCache.accessToken).toBe(token);

    // Terminate session
    await authHelper.terminateSession();
    
    // Token cache should be cleared
    expect(authHelper.tokenCache.accessToken).toBeUndefined();
  });

  test('[SC013] Should not allow reuse of terminated token', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const token = await authHelper.getAccessToken();

    // Terminate the token
    await authHelper.terminateSession();

    // Try to use the terminated token
    const baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    const response = await request.get(`${baseUrl}/v1/identity/oauth2/userinfo?schema=paypalv1.1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(401);
  });
});
