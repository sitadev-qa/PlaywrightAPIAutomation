/**
 * Authorization - Generate Access Token Tests
 * Tests OAuth2 token generation with valid and invalid credentials
 */
const { test, expect } = require('@playwright/test');
const AuthHelper = require('../../../utils/paypal/authHelper');
const Validators = require('../../../utils/paypal/validators');

test.describe('Authorization - Generate Access Token', () => {
  let authHelper;

  test.beforeAll(async ({ playwright }) => {
    // Initialize once for the suite
  });

  test.beforeEach(async ({ request }) => {
    authHelper = new AuthHelper(request);
  });

  test.afterEach(async () => {
    // Cleanup
    authHelper = null;
  });

  test('[SC001] Should generate access token with valid credentials', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    
    const token = await authHelper.getAccessToken();

    expect(token).toBeTruthy();
    expect(authHelper.validateTokenFormat(token)).toBe(true);
    expect(authHelper.isTokenValid(token)).toBe(true);
  });

  test('[SC002] Should return Bearer token type', async ({ request }) => {
    const response = await request.post(`${process.env.BASE_URL || 'https://api-m.sandbox.paypal.com'}/v1/oauth2/token`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US'
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const validation = Validators.validateTokenResponse(body);
    expect(validation.valid).toBe(true);
    expect(body.token_type).toBe('Bearer');
  });

  test('[SC003] Should include expires_in field', async ({ request }) => {
    const response = await request.post(`${process.env.BASE_URL || 'https://api.sandbox.paypal.com'}/v1/oauth2/token`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US'
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET
      }
    });

    const body = await response.json();
    
    expect(body.expires_in).toBeTruthy();
    expect(typeof body.expires_in).toBe('number');
    expect(body.expires_in).toBeGreaterThan(0);
  });

  test('[SC004] Should fail with invalid client credentials', async ({ request }) => {
    const response = await request.post(
      `${process.env.BASE_URL || 'https://api.sandbox.paypal.com'}/v1/oauth2/token`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US'
        },
        data: new URLSearchParams({
          grant_type: 'client_credentials'
        }),
        auth: {
          username: 'invalid_client_id',
          password: 'invalid_secret'
        }
      }
    );

    expect(response.status()).toBe(401);
    const body = await response.json();
    
    expect(body.error).toBeTruthy();
    expect(body.error_description).toBeTruthy();
  });

  test('[SC005] Should fail with missing credentials', async ({ request }) => {
    const response = await request.post(
      `${process.env.BASE_URL || 'https://api.sandbox.paypal.com'}/v1/oauth2/token`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US'
        },
        data: new URLSearchParams({
          grant_type: 'client_credentials'
        })
      }
    );

    expect([401, 400]).toContain(response.status());
  });

  test('[SC006] Token should be valid JWT format', async ({ request }) => {
    const response = await request.post(`${process.env.BASE_URL || 'https://api.sandbox.paypal.com'}/v1/oauth2/token`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US'
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET
      }
    });

    const body = await response.json();
    const token = body.access_token;

    // JWT format validation
    const jwtParts = token.split('.');
    expect(jwtParts.length).toBe(3);

    // Try to decode payload
    const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString('utf-8'));
    expect(payload.exp).toBeTruthy();
    expect(payload.scope).toBeTruthy();
  });

  test('[SC007] Should support multiple scope grants', async ({ request }) => {
    const response = await request.post(`${process.env.BASE_URL || 'https://api.sandbox.paypal.com'}/v1/oauth2/token`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US'
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Scope should be a space-separated string of permissions
    expect(body.scope).toBeTruthy();
    expect(typeof body.scope).toBe('string');
    expect(body.scope.includes('https')).toBe(true);
  });
});
