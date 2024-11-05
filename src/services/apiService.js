import axios from 'axios';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const RANGE = '公務車預約使用表!A5:H';

const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

let tokenClient;
let tokenInitialized = false;

const initializeGoogleAuth = () => {
  if (tokenInitialized) return Promise.resolve();

  return new Promise((resolve) => {
    const initializeGsi = () => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: API_SCOPE,
        callback: (response) => {
          if (response.error !== undefined) {
            throw response;
          }
          resolve(response.access_token);
        },
      });
      tokenInitialized = true;
    };

    if (window.google) {
      initializeGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = initializeGsi;
      document.head.appendChild(script);
    }
  });
};

// Initialize auth when the module loads
initializeGoogleAuth();

const getAccessToken = async () => {
  if (!tokenInitialized) {
    await initializeGoogleAuth();
  }

  return new Promise((resolve) => {
    tokenClient.callback = (response) => {
      if (response.error !== undefined) {
        throw response;
      }
      resolve(response.access_token);
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

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

      // Find the last row where columns B and C are not empty
      let lastRow = 4; // Starting from A5 (index 4)
      rows.forEach((row, index) => {
        if (row[1] && row[2]) { // Check if columns B and C have values
          lastRow = 4 + index + 1; // Add 1 to get the next row
        }
      });

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
            info: row[7] || '',
            row: lastRow
          });
        }
        return acc;
      }, []);

    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      // Get the access token first - this will now trigger the prompt immediately
      const token = await getAccessToken();

      // Then proceed with the rest of the booking creation
      const response = await axios.get(
        `${SHEETS_API_URL}/公務車預約使用表!A5:C`,
        {
          params: {
            key: API_KEY,
            valueRenderOption: 'FORMATTED_VALUE',
            dateTimeRenderOption: 'FORMATTED_STRING',
          },
        }
      );

      const rows = response.data.values || [];

      // Find the first empty row by looking for the first row where both B and C are empty
      let nextRow = 5; // Start from row 5
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[1] || !row[2]) { // If row is undefined or B or C is empty
          nextRow = i + 5; // Add 5 because we started from A5
          break;
        }
        nextRow = i + 6; // If no empty row found, use the next row after the last one
      }

      console.log('Next available row:', nextRow); // Debug log

      // Get the value of column A for the next row
      const aColumnResponse = await axios.get(
        `${SHEETS_API_URL}/公務車預約使用表!A${nextRow}`,
        {
          params: {
            key: API_KEY,
            valueRenderOption: 'FORMATTED_VALUE',
          },
        }
      );

      // Format dates with day of week in Traditional Chinese
      const formatDateWithDay = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dayOfWeek = new Intl.DateTimeFormat('zh-TW', { weekday: 'short' }).format(date);
        return `${year}/${month}/${day} (${dayOfWeek})`;
      };

      // Use the update endpoint
      const updateResponse = await axios.put(
        `${SHEETS_API_URL}/公務車預約使用表!A${nextRow}:H${nextRow}`,
        {
          values: [[
            aColumnResponse.data.values?.[0]?.[0] || '', // Keep existing value in column A
            formatDateWithDay(bookingData.rentDate),
            formatDateWithDay(bookingData.returnDate),
            bookingData.carLocation,
            bookingData.carPlate,
            bookingData.person,
            bookingData.destination,
            bookingData.info || ''
          ]]
        },
        {
          params: {
            key: API_KEY,
            valueInputOption: 'RAW',
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        id: String(nextRow),
        rentID: aColumnResponse.data.values?.[0]?.[0] || '',
        ...bookingData,
        rentDate: formatDateWithDay(bookingData.rentDate),
        returnDate: formatDateWithDay(bookingData.returnDate),
        row: nextRow
      };
    } catch (error) {
      console.error('Error in createBooking:', error);
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