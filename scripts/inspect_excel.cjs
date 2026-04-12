const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'DrivexVehicles (1).xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

if (data.length > 0) {
  console.log("Found columns:", Object.keys(data[0]));
  console.log("Sample row:", data[0]);
} else {
  console.log("Excel file is empty.");
}
