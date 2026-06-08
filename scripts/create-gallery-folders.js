const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = 'I:\\My Drive\\BRAS Backend Data\\BRAS_Master_Rankings.xlsx';
const TARGET_DIR = 'I:\\My Drive\\BRAS_Gallery';

function sanitizeFolderName(name) {
  // Replace invalid Windows filename characters
  return name.replace(/[<>:"/\\|?*]+/g, '-').trim();
}

try {
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert sheet to JSON array
  const data = xlsx.utils.sheet_to_json(worksheet);

  let createdCount = 0;

  // Assuming columns are roughly "Date" and "Pub" or similar.
  // We'll log the first row to see structure if unsure, but let's try to find Date/Pub keys.
  if (data.length > 0) {
    console.log("First row keys:", Object.keys(data[0]));
    
    // Attempt to identify the date and pub column keys
    const keys = Object.keys(data[0]);
    const dateKey = keys.find(k => k.toLowerCase().includes('date'));
    const pubKey = keys.find(k => k.toLowerCase().includes('pub') || k.toLowerCase().includes('venue') || k.toLowerCase().includes('name'));

    if (!dateKey || !pubKey) {
      console.error("Could not automatically determine Date and Pub columns.", keys);
      process.exit(1);
    }

    console.log(`Using Date column: '${dateKey}' and Pub column: '${pubKey}'`);

    data.forEach((row, index) => {
      let dateVal = row[dateKey];
      let pubVal = row[pubKey];

      if (!dateVal || !pubVal) return;

      // Handle Excel numeric dates if applicable
      let dateStr = String(dateVal);
      if (typeof dateVal === 'number') {
        const d = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
        dateStr = d.toISOString().split('T')[0];
      }

      const folderName = sanitizeFolderName(`${dateStr} - ${pubVal}`);
      const folderPath = path.join(TARGET_DIR, folderName);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        createdCount++;
      }
    });

    console.log(`Successfully created ${createdCount} new folders in ${TARGET_DIR}.`);
  } else {
    console.log("Excel file appears to be empty.");
  }
} catch (error) {
  console.error("Error reading excel file:", error);
}
