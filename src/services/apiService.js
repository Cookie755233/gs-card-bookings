import axios from 'axios';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const RANGE = '公務車預約使用表!A5:H';

const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

export const apiService = {
  getAllBookings: async () => {
    try {
      const response = await axios.get(`${SHEETS_API_URL}/${RANGE}`, {
        params: {
          key: API_KEY,
          valueRenderOption: 'FORMATTED_VALUE',
          dateTimeRenderOption: 'FORMATTED_STRING',
          fields: 'values',
        },
      });

      const rows = response.data.values || [];

      return rows.reduce((acc, row) => {
        if (row.length >= 7 && row[2] && row[3] && row[5]) {
          acc.push({
            id: acc.length.toString(),
            rentID: row[0],
            rentDate: row[1],
            returnDate: row[2],
            carLocation: row[3],
            carPlate: row[4],
            person: row[5],
            destination: row[6] || '',
            info: row[7] || ''
          });
        }
        return acc;
      }, []);

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