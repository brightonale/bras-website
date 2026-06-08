const fs = require('fs');
const path = require('path');

const GALLERY_DIR = 'I:\\My Drive\\BRAS_Gallery';

const folders = fs.readdirSync(GALLERY_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let deletedCount = 0;

folders.forEach(folder => {
  const match = folder.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);
    
    // Parse the date in local or UTC. 
    // Since we just want to know day of week, we can use UTC.
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    
    if (dateObj.getUTCDay() !== 4) {
      console.log(`Folder '${folder}' is not a Thursday. Deleting...`);
      
      const folderPath = path.join(GALLERY_DIR, folder);
      
      // Before deleting, check if there's anything inside we need to salvage
      const contents = fs.readdirSync(folderPath);
      if (contents.length > 0) {
        console.warn(`WARNING: Folder '${folder}' has ${contents.length} items. Cannot safely delete without migrating files!`);
      } else {
        // Safe to delete empty non-Thursday folder
        fs.rmdirSync(folderPath);
        deletedCount++;
        console.log(`Deleted empty duplicate: ${folder}`);
      }
    }
  }
});

console.log(`Cleanup complete. Removed ${deletedCount} non-Thursday folders.`);
