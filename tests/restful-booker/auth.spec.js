const { test, expect } = require('@playwright/test');
const fs = require('fs');

function uniqueUsername() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

test.describe('Auth Endpoint', () => {
  test('should create token with valid credentials', async ({ request }) => {
    const response = await request.post('https://restful-booker.herokuapp.com/auth', {
      data: { username: 'admin', password: 'password123' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
  });

  test('should fail with invalid credentials', async ({ request }) => {
    const response = await request.post('https://restful-booker.herokuapp.com/auth', {
      data: { username: uniqueUsername(), password: 'wrongpass' }
    });
    expect(response.status()).toBe(200); // API returns 200 with error message
    const body = await response.json();
    expect(body).toHaveProperty('reason');
  });
});
