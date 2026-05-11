const { test, expect } = require('@playwright/test');
const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

// Read CSV and parse
const csvFilePath = path.join(__dirname, '../data/createBooking.csv');
const csvData = fs.readFileSync(csvFilePath, 'utf8');
const { data: records } = Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true
});

test.describe('CSV Driven Create Booking API', () => {
  records.forEach((record, idx) => {
    test(`Create booking for ${record.firstname} ${record.lastname} [Row ${idx + 1}]`, async ({ request }) => {
      const bookingPayload = {
        firstname: record.firstname,
        lastname: record.lastname,
        totalprice: Number(record.totalprice),
        depositpaid: record.depositpaid === 'true',
        bookingdates: {
          checkin: record.checkin,
          checkout: record.checkout
        },
        additionalneeds: record.additionalneeds !== 'None' ? record.additionalneeds : undefined
      };
      const response = await request.post('https://restful-booker.herokuapp.com/booking', {
        data: bookingPayload
      });
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      console.log(responseBody);
      expect(responseBody.booking).toMatchObject({
        firstname: bookingPayload.firstname,
        lastname: bookingPayload.lastname
      });
    });
  });
});
