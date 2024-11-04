import testData from '../data.json';

export async function fetchSheetData() {
  // Return mock data for testing
  return Promise.resolve(testData);
} 