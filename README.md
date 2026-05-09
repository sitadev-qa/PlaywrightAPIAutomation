# Restful-Booker API Test Suite

This project contains automated API tests for the [Restful Booker API](https://restful-booker.herokuapp.com/apidoc/index.html) using Playwright and JavaScript best practices.

## Structure

- `tests/restful-booker/`  
  Contains all test cases for each API endpoint (auth, booking, ping, etc.).
- `data/`  
  Contains independent JSON payloads for test data. Each test reads and injects unique values for every run.

## Test Coverage

- **Auth**: Token creation (positive/negative)
- **Ping**: Health check
- **Booking**: Create, read, update, partial update, delete, and negative scenarios

## How to Run

1. Install dependencies:
   ```
   npm install
   ```

2. Run all tests:
   ```
   npx playwright test
   ```

3. View reports:
   ```
   npx playwright show-report
   ```

## Best Practices

- Test data is unique for each run (using timestamps/random values).
- Payloads are managed in the `data/` folder for easy maintenance.
- Both positive and negative flows are covered for each endpoint.

## Extending

- Add new payloads to `data/`.
- Add new test files or cases under `tests/restful-booker/`.

---
