const { test, expect } = require('@playwright/test');
const fs = require('fs');

function uniqueName(base) {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function getPayload(file) {
  const data = JSON.parse(fs.readFileSync(`./data/${file}`));
  // Inject unique names
  data.firstname = uniqueName(data.firstname || 'John');
  data.lastname = uniqueName(data.lastname || 'Doe');
  return data;
}

test.describe('Booking Endpoint', () => {
  test('should create a booking (positive)', async ({ request }) => {
    const payload = getPayload('createBooking.json');
    const response = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('bookingid');
    expect(body).toHaveProperty('booking');
  });

  test('should fail to create booking with invalid data (negative)', async ({ request }) => {
    const payload = JSON.parse(fs.readFileSync('./data/invalidBooking.json'));
    const response = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    expect(response.status()).toBe(500);
  });

  test('should get all bookings', async ({ request }) => {
    const response = await request.get('https://restful-booker.herokuapp.com/booking');
    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBeTruthy();
  });

  test('should get booking by id (positive)', async ({ request }) => {
    // Create a booking first
    const payload = getPayload('createBooking.json');
    const createRes = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    const { bookingid } = await createRes.json();
    const response = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingid}`);
    expect(response.status()).toBe(200);
    const booking = await response.json();
    expect(booking.firstname).toBeDefined();
  });

  test('should return 404 for non-existent booking id', async ({ request }) => {
    const response = await request.get('https://restful-booker.herokuapp.com/booking/9999999');
    expect(response.status()).toBe(404);
  });

  test('should update a booking (PUT)', async ({ request }) => {
    // Create a booking
    const payload = getPayload('createBooking.json');
    const createRes = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    const { bookingid } = await createRes.json();
    // Auth
    const authRes = await request.post('https://restful-booker.herokuapp.com/auth', { data: { username: 'admin', password: 'password123' } });
    const { token } = await authRes.json();
    // Update
    const updatePayload = getPayload('updateBooking.json');
    const response = await request.put(`https://restful-booker.herokuapp.com/booking/${bookingid}`, {
      data: updatePayload,
      headers: { Cookie: `token=${token}` }
    });
    expect(response.status()).toBe(200);
    const updated = await response.json();
    expect(updated.firstname).toBe(updatePayload.firstname);
  });

  test('should partially update a booking (PATCH)', async ({ request }) => {
    // Create a booking
    const payload = getPayload('createBooking.json');
    const createRes = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    const { bookingid } = await createRes.json();
    // Auth
    const authRes = await request.post('https://restful-booker.herokuapp.com/auth', { data: { username: 'admin', password: 'password123' } });
    const { token } = await authRes.json();
    // Patch
    const patchPayload = { firstname: uniqueName('Patch') };
    const response = await request.patch(`https://restful-booker.herokuapp.com/booking/${bookingid}`, {
      data: patchPayload,
      headers: { Cookie: `token=${token}` }
    });
    expect(response.status()).toBe(200);
    const patched = await response.json();
    expect(patched.firstname).toBe(patchPayload.firstname);
  });

  test('should delete a booking', async ({ request }) => {
    // Create a booking
    const payload = getPayload('createBooking.json');
    const createRes = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    const { bookingid } = await createRes.json();
    // Auth
    const authRes = await request.post('https://restful-booker.herokuapp.com/auth', { data: { username: 'admin', password: 'password123' } });
    const { token } = await authRes.json();
    // Delete
    const response = await request.delete(`https://restful-booker.herokuapp.com/booking/${bookingid}`, {
      headers: { Cookie: `token=${token}` }
    });
    expect([201, 200, 204]).toContain(response.status());
  });

  test('should not update booking without auth (negative)', async ({ request }) => {
    const payload = getPayload('createBooking.json');
    const createRes = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    const { bookingid } = await createRes.json();
    const updatePayload = getPayload('updateBooking.json');
    const response = await request.put(`https://restful-booker.herokuapp.com/booking/${bookingid}`, {
      data: updatePayload
    });
    expect(response.status()).toBe(403);
  });
});
