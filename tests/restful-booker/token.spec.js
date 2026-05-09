//import {test, expect, request} from '@playwright/test';
const {test, expect, request} = require('@playwright/test');
const BASE_URL = 'https://restful-booker.herokuapp.com';

test.describe("Generate Token for Authentication", ()=>{

    test("Generate Token with valid credentials", async ({request}) => {
        const response = await request.post(`${BASE_URL}/auth`, {
            data: {
                username: 'admin',
                password: 'password123'
            },
            headers: {'Content-Type': 'application/json'}
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.token).toBeTruthy();
    });
});