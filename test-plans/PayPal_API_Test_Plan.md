# PayPal APIs - Playwright Test Plan

## Document Overview
This document outlines the comprehensive test strategy for PayPal APIs using Playwright with JavaScript as the automation framework.

---

## 1. Test Scope

### In Scope
- Authorization API (Token generation, user info, client token)
- Orders API (Create, confirm, update, show order details)
- Payment Source Confirmation
- Sandbox environment testing

### Out of Scope
- Production environment testing
- UI testing (API-only testing)
- Third-party integrations beyond PayPal APIs

---

## 2. API Categories & Endpoints

### 2.1 Authorization Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/oauth2/token` | POST | Generate access token |
| `/v1/oauth2/token/terminate` | POST | Terminate access token |
| `/v1/identity/oauth2/userinfo` | GET | Get user profile information |
| `/v1/identity/generate-token` | POST | Generate client token |

### 2.2 Orders Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/checkout/orders` | POST | Create order |
| `/v1/checkout/orders/{id}/confirm-payment-source` | POST | Confirm payment source |
| `/v1/checkout/orders/{id}` | GET | Get order details |
| `/v1/checkout/orders/{id}` | PATCH | Update order |
| `/v1/checkout/orders/{id}/capture` | POST | Capture payment |

---

## 3. Test Strategy

### 3.1 Test Levels

#### Smoke Testing
- Verify all API endpoints are accessible
- Validate basic authentication flow
- Test happy path scenarios

#### Functional Testing
- Complete order creation workflow
- Payment confirmation
- Order retrieval and updates
- Token generation and expiration

#### Negative Testing
- Invalid credentials
- Missing required parameters
- Invalid token scenarios
- Rate limiting (429 errors)

#### Performance Testing
- Response time validation
- Concurrent request handling
- Rate limit enforcement

---

## 4. Data-Driven Testing Strategy

### 4.1 Test Data Structure (CSV Format)
```csv
scenario,firstname,lastname,totalprice,depositpaid,checkin,checkout,additionalneeds
standard_booking,John,Doe,150,true,2026-05-20,2026-05-25,Breakfast
long_stay,Jane,Smith,500,true,2026-06-01,2026-06-30,None
minimum_booking,Alice,Brown,50,false,2026-07-10,2026-07-11,None
max_price,Bob,White,9999.99,true,2026-08-01,2026-08-31,Special requests
special_chars,José,García,200,true,2026-09-01,2026-09-05,Extra pillow
```

### 4.2 CSV Test Parameters for PayPal Orders
- Customer details (name, email)
- Order amounts (USD, EUR, etc.)
- Payment methods (PayPal, Card)
- Shipping addresses
- Intent types (CAPTURE, AUTHORIZE)

---

## 5. Test Scenarios

### 5.1 Authorization Flow
**Scenario 1: Generate Access Token (Positive)**
- Input: Valid client_id, client_secret
- Expected: 200 status, access_token returned
- Validations: Token format, expiry time

**Scenario 2: Invalid Credentials (Negative)**
- Input: Invalid client credentials
- Expected: 401 status with error description
- Validations: Error message validation

**Scenario 3: Generate Client Token**
- Input: Valid authorization token, optional customer_id
- Expected: 200 status, client_token returned
- Validations: Token structure, expiry

### 5.2 Orders Flow
**Scenario 4: Create Order (Positive)**
- Input: Valid order payload (amount, currency, items)
- Expected: 201 status, order_id returned
- Validations: Order structure, approval links

**Scenario 5: Create Order with PayPal Payment Source**
- Input: PayPal payment source details
- Expected: 201 status with approve link
- Validations: Payment source validation

**Scenario 6: Confirm Payment Source (Positive)**
- Input: Valid order_id, payment source confirmation
- Expected: 200 status
- Validations: Confirmation response

**Scenario 7: Capture Order Payment**
- Input: Valid order_id
- Expected: 201 status with capture details
- Validations: Amount, status, transaction ID

**Scenario 8: Get Order Details**
- Input: Valid order_id
- Expected: 200 status with complete order details
- Validations: Order structure, payment status

**Scenario 9: Update Order**
- Input: Valid order_id, update payload
- Expected: 204 status (No Content)
- Validations: Update confirmation

### 5.3 Error Scenarios
**Scenario 10: Order Not Found**
- Input: Invalid order_id
- Expected: 404 status
- Validations: Error message

**Scenario 11: Missing Required Parameters**
- Input: Order payload missing required fields
- Expected: 400 status
- Validations: Error details

**Scenario 12: Rate Limiting**
- Input: Multiple rapid requests
- Expected: 429 status
- Validations: Rate limit headers

---

## 6. Test Execution Framework

### 6.1 Folder Structure
```
tests/
├── paypal/
│   ├── authorization/
│   │   ├── generateToken.spec.js
│   │   ├── terminateToken.spec.js
│   │   ├── userInfo.spec.js
│   │   └── clientToken.spec.js
│   │
│   ├── orders/
│   │   ├── createOrder.spec.js
│   │   ├── confirmPayment.spec.js
│   │   ├── captureOrder.spec.js
│   │   ├── getOrderDetails.spec.js
│   │   ├── updateOrder.spec.js
│   │   └── orderErrors.spec.js
│   │
│   └── data-driven/
│       ├── ordersCsvDriven.spec.js
│       ├── paymentVariations.spec.js
│       └── negativeScenarios.spec.js
│
data/
├── paypalOrders.csv
├── paymentMethods.csv
├── errorScenarios.csv
└── currencies.csv

utils/
├── paypalClient.js
├── authHelper.js
├── dataHelper.js
└── validators.js
```

### 6.2 Test Utilities

#### API Client (paypalClient.js)
- Initialize request context
- Handle authentication
- Manage tokens and sessions

#### Auth Helper (authHelper.js)
- Token generation and refresh
- Token validation
- Session management

#### Data Helper (dataHelper.js)
- CSV parsing
- Test data transformation
- Dynamic payload generation

---

## 7. Validation Criteria

### 7.1 Response Validations
- HTTP Status codes (200, 201, 400, 401, 404, 422, 429)
- Response body structure
- Required fields presence
- Data type validation

### 7.2 Business Logic Validations
- Order amount calculations
- Tax and shipping calculations
- Payment status transitions
- Token expiration

### 7.3 Security Validations
- Token signature verification
- Authorization checks
- Rate limiting enforcement
- Sensitive data redaction

---

## 8. Reporting & Metrics

### 8.1 Test Reports
- Allure Report integration
- Test execution summary
- Pass/Fail statistics
- Failure details and logs

### 8.2 Coverage Metrics
- API endpoint coverage
- Scenario coverage
- Error code coverage
- Data variation coverage

### 8.3 Performance Metrics
- Average response time
- 95th percentile response time
- Error rate
- Throughput (requests/sec)

---

## 9. Test Data Management

### 9.1 Sandbox Credentials
- Environment: Sandbox (api.sandbox.paypal.com)
- Authentication: OAuth 2.0 (client_credentials)
- Stored in: `.env` file

### 9.2 Test Accounts
- Merchant Account: Sandbox business account
- Payer Account: Sandbox personal account
- Test Cards: PayPal provided sandbox card numbers

### 9.3 Data Cleanup
- Delete test orders after verification
- Clear temporary tokens
- Maintain data isolation between test runs

---

## 10. CI/CD Integration

### 10.1 Pre-requisites
- Node.js 14+
- Playwright 1.40+
- csv-parse or papaparse package
- Environment variables configured

### 10.2 Execution Flow
1. Install dependencies
2. Load environment variables
3. Initialize Playwright browsers
4. Execute test suites
5. Generate Allure reports
6. Publish results

### 10.3 Schedule
- Smoke tests: Every 1 hour
- Functional tests: Daily (8 AM UTC)
- Full suite: Weekly (Sunday midnight UTC)

---

## 11. Known Issues & Limitations

### 11.1 API Limitations
- Rate limit: 100 requests/minute
- Token expiration: 9 hours
- Order ID retention: 3 hours
- Currency support: Limited to PayPal supported currencies

### 11.2 Testing Limitations
- Sandbox environment may have data reset
- Some payment methods unavailable in sandbox
- Limited webhook testing capabilities

---

## 12. Reference Documentation

- **PayPal Orders API**: https://developer.paypal.com/docs/api/orders/v2/
- **PayPal Authentication**: https://developer.paypal.com/docs/api/authentication/
- **Playwright Documentation**: https://playwright.dev/
- **Postman Collection**: `resources/PayPal APIs.postman_collection.json`

---

## 13. Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |

---

## 14. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-14 | AI Assistant | Initial test plan creation |
| | | | |

---

**Document Classification**: Internal - Test Planning
**Last Updated**: 2026-05-14
**Next Review Date**: 2026-06-14
