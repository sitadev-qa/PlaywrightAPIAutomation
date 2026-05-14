# PayPal API Automation Tests

Comprehensive Playwright-based API automation test suite for PayPal REST APIs (Orders and Authorization endpoints).

## Project Structure

```
tests/paypal/
├── authorization/          # Authorization API tests
│   ├── generateToken.spec.js       (SC001-SC007)
│   ├── terminateToken.spec.js      (SC008-SC013)
│   ├── userInfo.spec.js            (SC014-SC020)
│   └── clientToken.spec.js         (SC021-SC028)
│
├── orders/                 # Orders API tests
│   ├── createOrder.spec.js         (SC029-SC037)
│   ├── getOrderDetails.spec.js     (SC038-SC045)
│   ├── updateOrder.spec.js         (SC046-SC051)
│   ├── captureOrder.spec.js        (SC052-SC058)
│   ├── confirmPayment.spec.js      (SC059-SC063)
│   └── orderErrors.spec.js         (SC064-SC072)
│
└── data-driven/            # CSV-driven tests
    ├── ordersCsvDriven.spec.js     (CSV-ORD-1 to n)
    ├── paymentVariations.spec.js   (CSV-PAY-1 to n)
    └── negativeScenarios.spec.js   (NEG-001 to NEG-CSV-n)

utils/paypal/
├── paypalClient.js         # API client for HTTP requests
├── authHelper.js           # Authentication utilities
├── validators.js           # Response validators
└── dataHelper.js          # Test data generation and parsing

data/paypal/
├── orders.csv             # Test data for orders
├── paymentVariations.csv  # Payment method variations
└── errorScenarios.csv     # Error scenario mappings
```

## Setup Instructions

### Prerequisites
- Node.js 14+ 
- npm or yarn
- PayPal Developer Account (https://developer.paypal.com)

### Installation

1. **Install dependencies** (if not already done):
```bash
npm install
npm install papaparse dotenv --save-dev
```

2. **Configure PayPal credentials** in `.env`:
```bash
PAYPAL_CLIENT_ID=<your_client_id>
PAYPAL_CLIENT_SECRET=<your_client_secret>
PAYPAL_BASE_URL=https://api.sandbox.paypal.com
PAYPAL_MODE=sandbox
```

Obtain credentials from:
- Go to https://developer.paypal.com/dashboard
- Navigate to Apps & Credentials
- Create or use existing app
- Copy Client ID and Secret

3. **Verify setup**:
```bash
npm test -- tests/paypal/authorization/generateToken.spec.js
```

## Running Tests

### Run all PayPal tests:
```bash
npx playwright test tests/paypal/
```

### Run by category:

**Authorization tests:**
```bash
npx playwright test tests/paypal/authorization/
```

**Orders tests:**
```bash
npx playwright test tests/paypal/orders/
```

**Data-driven tests:**
```bash
npx playwright test tests/paypal/data-driven/
```

### Run specific test file:
```bash
npx playwright test tests/paypal/authorization/generateToken.spec.js
```

### Run with specific browser:
```bash
npx playwright test tests/paypal/ --project=chromium
npx playwright test tests/paypal/ --project=firefox
npx playwright test tests/paypal/ --project=webkit
```

### Run in debug mode:
```bash
npx playwright test tests/paypal/ --debug
```

### Run with UI mode:
```bash
npx playwright test tests/paypal/ --ui
```

### Run with detailed output:
```bash
npx playwright test tests/paypal/ --reporter=list
```

## Test Coverage

### Authorization Tests (28 test cases)
- ✅ Token generation with valid/invalid credentials
- ✅ Token format and expiration validation
- ✅ Token termination
- ✅ User information retrieval
- ✅ Client token generation
- ✅ Error scenarios

### Orders Tests (44 test cases)
- ✅ Create orders (minimal, with PayPal source, multiple units, various intents)
- ✅ Get order details
- ✅ Update orders (invoice, shipping, amount)
- ✅ Capture payments
- ✅ Confirm payment sources
- ✅ Error handling (404, 400, 401, 422)

### Data-Driven Tests (18+ test cases)
- ✅ CSV-driven order creation with multiple scenarios
- ✅ Payment method variations
- ✅ Negative scenarios and error cases

**Total: 90+ automated test cases**

## Utility Classes

### PayPalClient
Handles HTTP communication with PayPal APIs.

```javascript
const PayPalClient = require('./utils/paypal/paypalClient');

const client = new PayPalClient(request);
const token = await client.generateAccessToken();
const response = await client.post('/v1/checkout/orders', payload);
```

### AuthHelper
Manages authentication and token operations.

```javascript
const AuthHelper = require('./utils/paypal/authHelper');

const auth = new AuthHelper(request);
const token = await auth.getAccessToken();
const userInfo = await auth.getUserInfo();
```

### Validators
Validates API responses.

```javascript
const Validators = require('./utils/paypal/validators');

const result = Validators.validateTokenResponse(response);
const result = Validators.validateOrderResponse(order);
const result = Validators.validateRequiredFields(obj, ['id', 'status']);
```

### DataHelper
Generates and parses test data.

```javascript
const DataHelper = require('./utils/paypal/dataHelper');

const payload = DataHelper.generateOrderPayload();
const testData = DataHelper.loadTestData('orders.csv');
const email = DataHelper.generateRandomEmail();
```

## API Endpoints Covered

### Authorization
- `POST /v1/oauth2/token` - Generate access token
- `POST /v1/oauth2/token/terminate` - Terminate token
- `GET /v1/identity/oauth2/userinfo` - Get user information
- `POST /v1/identity/generate-token` - Generate client token

### Orders
- `POST /v1/checkout/orders` - Create order
- `GET /v1/checkout/orders/{id}` - Get order details
- `PATCH /v1/checkout/orders/{id}` - Update order
- `POST /v1/checkout/orders/{id}/capture` - Capture payment
- `POST /v1/checkout/orders/{id}/confirm-payment-source` - Confirm payment source

## Test Data

### orders.csv
Test data for order creation with various amounts and currencies:
- Standard orders (USD)
- International orders (EUR, GBP)
- Edge cases (minimum, maximum amounts)

### paymentVariations.csv
Payment method variations:
- Standard, premium, international orders
- Different currencies and amounts

### errorScenarios.csv
Error handling scenarios:
- Invalid order IDs
- Missing required fields
- Invalid currencies
- Unauthorized access

## Best Practices Implemented

✅ **Modular Architecture**
- Reusable helper classes
- Separation of concerns
- Clean code patterns

✅ **Test Organization**
- Grouped by API endpoint
- Clear naming conventions (SC### for scenarios)
- Comprehensive descriptions

✅ **Error Handling**
- Proper HTTP status validation
- Error response structure validation
- Graceful failure handling

✅ **Data Management**
- CSV-driven testing
- Random data generation
- Test data isolation

✅ **Security**
- Credentials stored in .env
- No hardcoded sensitive data
- Token lifecycle management

✅ **Maintainability**
- Descriptive test names
- Clear assertions
- Reusable test utilities

## Troubleshooting

### 401 Unauthorized Error
**Issue:** Tests failing with 401 status
**Solution:** 
1. Verify PayPal credentials in `.env`
2. Check that client_id and client_secret are correct
3. Ensure you're using sandbox environment

### 429 Rate Limit Error
**Issue:** Too many requests error
**Solution:**
1. Add delays between test runs
2. Run tests sequentially instead of parallel
3. Contact PayPal support for increased limits

### Test Data Issues
**Issue:** CSV file not found or parsing errors
**Solution:**
1. Verify CSV files exist in `data/paypal/`
2. Check CSV format (UTF-8, proper headers)
3. Ensure papaparse package is installed

### Token Expiration
**Issue:** Tests fail midway through
**Solution:**
1. Check token generation before each test
2. Implement token refresh in beforeEach hooks
3. Increase token lifetime in beforeAll setup

## Reporting

### Generate HTML Report:
```bash
npx playwright test tests/paypal/
npx playwright show-report
```

### Allure Report Integration:
```bash
npm install @playwright/test allure-playwright --save-dev
npx playwright test tests/paypal/
npx allure generate --clean -o allure-report
npx allure open allure-report
```

## CI/CD Integration

### GitHub Actions Example:
```yaml
- name: Run PayPal API Tests
  run: |
    npx playwright test tests/paypal/
    
- name: Upload Report
  if: always()
  uses: actions/upload-artifact@v2
  with:
    name: playwright-report
    path: playwright-report/
```

## Performance Baseline

Expected response times (Sandbox):
- Token generation: < 1 second
- Order creation: < 2 seconds
- Order retrieval: < 1 second
- Payment capture: < 2 seconds

## Support & Documentation

- **PayPal Orders API**: https://developer.paypal.com/docs/api/orders/v2/
- **PayPal Authentication**: https://developer.paypal.com/docs/api/authentication/
- **Playwright Docs**: https://playwright.dev/
- **Test Plan**: See `/test-plans/PayPal_API_Test_Plan.md`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-14 | Initial test suite creation |

## License

Internal Use Only

---

For questions or issues, refer to the main test plan document and utility class documentation.
