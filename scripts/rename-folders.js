const fs = require('fs');
const path = require('path');

const GALLERY_DIR = 'I:\\My Drive\\BRAS_Gallery';
const months = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
};

const folders = fs.readdirSync(GALLERY_DIR);
let renamed = 0;

folders.forEach(folder => {
  const match = folder.match(/^(\d{2}) ([A-Z][a-z]{2}) (\d{4}) - (.*)$/);
  if (match) {
    const day = match[1];
    const monthStr = match[2];
    const year = match[3];
    const rest = match[4];
    
    const month = months[monthStr];
    if (month) {
      const newName = `${year}-${month}-${day} - ${rest}`;
      fs.renameSync(
        path.join(GALLERY_DIR, folder),
        path.join(GALLERY_DIR, newName)
      );
      renamed++;
      console.log(`Renamed: '${folder}' -> '${newName}'`);
    }
  }
});

console.log(`Renamed ${renamed} folders to strict YYYY-MM-DD ISO format.`);
