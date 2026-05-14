/**
 * Authorization Helper
 * Manages authentication flows and token operations
 */
const PayPalClient = require('./paypalClient');

class AuthHelper {
  constructor(request) {
    this.client = new PayPalClient(request);
    this.tokenCache = {};
  }

  /**
   * Get or generate access token
   * @returns {Promise<string>}
   */
  async getAccessToken() {
    if (this.tokenCache.accessToken) {
      return this.tokenCache.accessToken;
    }

    const token = await this.client.generateAccessToken();
    this.tokenCache.accessToken = token;
    return token;
  }

  /**
   * Generate client token
   * @param {string} customerId Optional customer ID
   * @returns {Promise<Object>}
   */
  async generateClientToken(customerId = null) {
    const payload = customerId ? { customer_id: customerId } : {};
    const response = await this.client.post('/v1/identity/generate-token', payload);

    if (!response.ok()) {
      throw new Error(`Failed to generate client token: ${response.status()}`);
    }

    return await response.json();
  }

  /**
   * Get user information
   * @returns {Promise<Object>}
   */
  async getUserInfo() {
    const response = await this.client.get('/v1/identity/oauth2/userinfo?schema=paypalv1.1');

    if (!response.ok()) {
      throw new Error(`Failed to retrieve user info: ${response.status()}`);
    }

    return await response.json();
  }

  /**
   * Terminate current session
   * @returns {Promise<Response>}
   */
  async terminateSession() {
    const response = await this.client.terminateToken();
    this.tokenCache = {};
    return response;
  }

  /**
   * Validate token format
   * @param {string} token Token to validate
   * @returns {boolean}
   */
  validateTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }
    // JWT format: xxx.yyy.zzz
    return token.split('.').length === 3;
  }

  /**
   * Check token expiration (basic check from JWT)
   * @param {string} token JWT token
   * @returns {boolean} True if token is valid
   */
  isTokenValid(token) {
    try {
      if (!this.validateTokenFormat(token)) {
        return false;
      }

      // Decode JWT payload
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }
}

module.exports = AuthHelper;
