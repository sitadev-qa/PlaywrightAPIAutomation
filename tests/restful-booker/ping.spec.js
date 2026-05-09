const { test, expect } = require('@playwright/test');

test.describe('Ping Endpoint', () => {
  test('should return Created for ping', async ({ request }) => {
    const response = await request.get('https://restful-booker.herokuapp.com/ping');
    expect(response.status()).toBe(201);
    expect(await response.text()).toBe('Created');
  });
});
