/**
 * Data Helper
 * Manages test data generation and transformation
 */
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

class DataHelper {
  /**
   * Parse CSV file
   * @param {string} filePath Path to CSV file
   * @returns {Array} Parsed CSV data
   */
  static parseCSV(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    const csvData = fs.readFileSync(filePath, 'utf8');
    const { data } = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    return data;
  }

  /**
   * Generate random email
   * @returns {string} Random email address
   */
  static generateRandomEmail() {
    return `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@paypaltest.com`;
  }

  /**
   * Generate random customer ID
   * @returns {string} Random customer ID
   */
  static generateCustomerId() {
    return `CUST_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  /**
   * Generate sample order payload
   * @param {Object} overrides Optional field overrides
   * @returns {Object} Order payload
   */
  static generateOrderPayload(overrides = {}) {
    const defaultPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '100.00'
          },
          description: 'Test Order'
        }
      ],
      payment_source: {
        paypal: {}
      }
    };

    return { ...defaultPayload, ...overrides };
  }

  /**
   * Generate sample payer info
   * @returns {Object} Payer information
   */
  static generatePayerInfo() {
    return {
      email_address: this.generateRandomEmail(),
      name: {
        given_name: 'Test',
        surname: 'Payer'
      },
      address: {
        address_line_1: '123 Main Street',
        admin_area_2: 'San Jose',
        admin_area_1: 'CA',
        postal_code: '95131',
        country_code: 'US'
      }
    };
  }

  /**
   * Generate sample item
   * @param {Object} overrides Optional field overrides
   * @returns {Object} Item object
   */
  static generateItem(overrides = {}) {
    const defaultItem = {
      name: 'Test Item',
      description: 'Test Product Description',
      sku: `SKU_${Date.now()}`,
      unit_amount: {
        currency_code: 'USD',
        value: '50.00'
      },
      quantity: '1',
      category: 'PHYSICAL_GOODS'
    };

    return { ...defaultItem, ...overrides };
  }

  /**
   * Generate sample shipping address
   * @returns {Object} Shipping address
   */
  static generateShippingAddress() {
    return {
      name: {
        full_name: 'Test Recipient'
      },
      address: {
        address_line_1: '456 Oak Avenue',
        admin_area_2: 'Los Angeles',
        admin_area_1: 'CA',
        postal_code: '90001',
        country_code: 'US'
      }
    };
  }

  /**
   * Parse currency from amount string
   * @param {string} amountStr Amount string (e.g., "100.00")
   * @returns {number} Parsed amount
   */
  static parseAmount(amountStr) {
    return parseFloat(amountStr);
  }

  /**
   * Format amount for API
   * @param {number} amount Amount value
   * @returns {string} Formatted amount (e.g., "100.00")
   */
  static formatAmount(amount) {
    return amount.toFixed(2);
  }

  /**
   * Get test data directory
   * @returns {string} Path to data directory
   */
  static getDataDir() {
    return path.join(__dirname, '../../data/paypal');
  }

  /**
   * Load test data set from CSV
   * @param {string} filename CSV filename
   * @returns {Array} Test data
   */
  static loadTestData(filename) {
    const filePath = path.join(this.getDataDir(), filename);
    return this.parseCSV(filePath);
  }
}

module.exports = DataHelper;
