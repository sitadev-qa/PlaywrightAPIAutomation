/**
 * PayPal API Client
 * Handles all HTTP interactions with PayPal APIs
 */
require('dotenv').config();

class PayPalClient {
  constructor(request) {
    this.request = request;
    this.baseUrl = process.env.BASE_URL || 'https://api.sandbox.paypal.com';
    this.accessToken = null;
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  }

  /**
   * Generate OAuth2 access token
   * @returns {Promise<string>} Access token
   */
  async generateAccessToken() {
    const response = await this.request.post(`${this.baseUrl}/v1/oauth2/token`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US'
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      auth: {
        username: this.clientId,
        password: this.clientSecret
      }
    });

    if (!response.ok()) {
      throw new Error(`Failed to generate token: ${response.status()}`);
    }

    const body = await response.json();
    this.accessToken = body.access_token;
    return this.accessToken;
  }

  /**
   * Get authorization headers
   * @returns {Object} Headers object with authorization
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json'
    };
  }

  /**
   * POST request to PayPal API
   * @param {string} endpoint API endpoint
   * @param {Object} payload Request body
   * @returns {Promise<Response>}
   */
  async post(endpoint, payload = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request.post(url, {
      headers: this.getHeaders(),
      data: payload
    });
  }

  /**
   * GET request to PayPal API
   * @param {string} endpoint API endpoint
   * @returns {Promise<Response>}
   */
  async get(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request.get(url, {
      headers: this.getHeaders()
    });
  }

  /**
   * PATCH request to PayPal API
   * @param {string} endpoint API endpoint
   * @param {Object} payload Request body
   * @returns {Promise<Response>}
   */
  async patch(endpoint, payload = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request.patch(url, {
      headers: this.getHeaders(),
      data: payload
    });
  }

  /**
   * Terminate access token
   * @returns {Promise<Response>}
   */
  async terminateToken() {
    if (!this.accessToken) {
      throw new Error('No access token to terminate');
    }

    const response = await this.request.post(`${this.baseUrl}/v1/oauth2/token/terminate`, {
      headers: this.getHeaders(),
      data: new URLSearchParams({
        token: this.accessToken,
        token_type_hint: 'ACCESS_TOKEN'
      })
    });

    this.accessToken = null;
    return response;
  }
}

module.exports = PayPalClient;
