/**
 * Authorization - User Info Tests
 * Tests user profile information retrieval
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../utils/paypal/authHelper');

test.describe('Authorization - User Info', () => {
  let authHelper;

  test.beforeEach(async ({ request }) => {
    authHelper = new AuthHelper(request);
  });

  test('[SC014] Should retrieve user profile information', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const userInfo = await authHelper.getUserInfo();

    expect(userInfo).toBeTruthy();
    expect(userInfo.user_id || userInfo.sub).toBeTruthy();
  });

  test('[SC015] Should return user_id in response', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const userInfo = await authHelper.getUserInfo();

    expect(userInfo.user_id).toBeTruthy();
    expect(typeof userInfo.user_id).toBe('string');
  });

  test('[SC016] Should return sub claim in JWT response', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    const userInfo = await authHelper.getUserInfo();

    expect(userInfo.sub).toBeTruthy();
    expect(userInfo.sub).toBe(userInfo.user_id);
  });

  test('[SC017] Should fail without valid token', async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    const response = await request.get(`${baseUrl}/v1/identity/oauth2/userinfo?schema=paypalv1.1`, {
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('[SC018] Should fail without schema parameter', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    await authHelper.getAccessToken();

    const baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    const token = authHelper.tokenCache.accessToken;

    const response = await request.get(`${baseUrl}/v1/identity/oauth2/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(400);
  });

  test('[SC019] Should use paypalv1.1 schema', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    
    const baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    const token = await authHelper.getAccessToken();

    const response = await request.get(`${baseUrl}/v1/identity/oauth2/userinfo?schema=paypalv1.1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.user_id).toBeTruthy();
  });

  test('[SC020] Should return PayPal URI format for user_id', async ({ request }) => {
    const userInfo = await authHelper.getUserInfo();

    // PayPal user IDs typically follow this format
    expect(userInfo.user_id).toMatch(/https:\/\/www\.paypal\.com\/webapps\/auth\/identity\/user\//);
  });
});
