const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'DrivexVehicles_with_prices.xlsx');
try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  if (data.length > 0) {
    console.log('Headers:', Object.keys(data[0]));
    console.log('Sample Data:', data[0]);
  } else {
    console.log('No data found in sheet.');
  }
} catch (error) {
  console.error('Error reading excel:', error.message);
}
