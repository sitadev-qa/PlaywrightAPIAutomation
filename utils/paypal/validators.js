/**
 * API Response Validators
 * Validates API responses against expected formats
 */

class Validators {
  /**
   * Validate OAuth token response
   * @param {Object} response Token response object
   * @returns {Object} Validation result
   */
  static validateTokenResponse(response) {
    const errors = [];

    if (!response.access_token) {
      errors.push('Missing access_token');
    }
    if (!response.token_type) {
      errors.push('Missing token_type');
    }
    if (!response.expires_in) {
      errors.push('Missing expires_in');
    }
    if (response.token_type !== 'Bearer') {
      errors.push(`Invalid token_type: ${response.token_type}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate order response
   * @param {Object} order Order object
   * @returns {Object} Validation result
   */
  static validateOrderResponse(order) {
    const errors = [];

    if (!order.id) {
      errors.push('Missing order id');
    }
    if (!order.status) {
      errors.push('Missing order status');
    }
    if (!order.payer) {
      errors.push('Missing payer information');
    }

    const validStatuses = ['CREATED', 'SAVED', 'APPROVED', 'VOIDED', 'COMPLETED', 'PAYER_ACTION_REQUIRED'];
    if (order.status && !validStatuses.includes(order.status)) {
      errors.push(`Invalid status: ${order.status}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate error response
   * @param {Object} error Error response object
   * @returns {Object} Validation result
   */
  static validateErrorResponse(error) {
    const errors = [];

    if (!error.name && !error.error) {
      errors.push('Missing error identifier');
    }
    if (!error.message && !error.error_description) {
      errors.push('Missing error message');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate HTTP status code
   * @param {number} status Status code
   * @param {number[]} expectedStatuses Expected status codes
   * @returns {boolean}
   */
  static validateStatus(status, expectedStatuses = []) {
    if (expectedStatuses.length === 0) {
      return status >= 200 && status < 300;
    }
    return expectedStatuses.includes(status);
  }

  /**
   * Validate amount format
   * @param {number} amount Amount value
   * @returns {boolean}
   */
  static validateAmount(amount) {
    return typeof amount === 'number' && amount > 0 && amount <= 9999999.99;
  }

  /**
   * Validate currency code
   * @param {string} currency Currency code
   * @returns {boolean}
   */
  static validateCurrency(currency) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN'];
    return validCurrencies.includes(currency.toUpperCase());
  }

  /**
   * Validate email format
   * @param {string} email Email address
   * @returns {boolean}
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate required fields in object
   * @param {Object} obj Object to validate
   * @param {string[]} requiredFields List of required field names
   * @returns {Object} Validation result
   */
  static validateRequiredFields(obj, requiredFields = []) {
    const errors = [];

    requiredFields.forEach(field => {
      if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;
