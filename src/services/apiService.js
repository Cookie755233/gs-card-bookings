import axios from 'axios';

// Replace these with your actual values
// https://docs.google.com/spreadsheets/d/1r0rSKgeAs-ohx6HJV8Efpyt2CSTHKSrnPkH18h8x1nQ/edit?gid=1207072783#gid=1207072783&fvid=339316176
const SHEET_ID = '1r0rSKgeAs-ohx6HJV8Efpyt2CSTHKSrnPkH18h8x1nQ';
const API_KEY = 'AIzaSyA7PExfaEGwEEeHJdWv1sTsL3PLdHy__e8';
const RANGE = '公務車預約使用表!A5:H'; // Updated range to include column H

const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

export const apiService = {
  getAllBookings: async () => {
    try {
      const response = await axios.get(`${SHEETS_API_URL}/${RANGE}`, {
        params: {
          key: API_KEY,
          valueRenderOption: 'FORMATTED_VALUE',
          dateTimeRenderOption: 'FORMATTED_STRING',
        },
      });

      // Transform the response data into our booking format
      const rows = response.data.values || [];
      return rows
        .filter(row =>
          // Filter out empty rows or rows without essential data
          row.length >= 7 &&
          row[2] && // rentDate
          row[3] && // returnDate
          row[5]    // carPlate
        )
        .map((row, index) => ({
          id: index.toString(),
          rentID: row[0],
          rentDate: row[1],
          returnDate: row[2],
          carLocation: row[3],
          carPlate: row[4],
          person: row[5],
          destination: row[6] || '',
          info: row[7] || ''
        }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // For write operations, you'll need to use Google Sheets API with OAuth2
  // These are placeholder implementations that you'll need to modify
  // based on your authentication setup
  createBooking: async (bookingData) => {
    try {
      // Implementation for creating a new row in Google Sheets
      // You'll need to use the sheets.spreadsheets.values.append endpoint
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  updateBooking: async (id, bookingData) => {
    try {
      // Implementation for updating a row in Google Sheets
      // You'll need to use the sheets.spreadsheets.values.update endpoint
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  deleteBooking: async (id) => {
    try {
      // Implementation for deleting a row in Google Sheets
      // You'll need to use the sheets.spreadsheets.values.clear endpoint
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
}; 