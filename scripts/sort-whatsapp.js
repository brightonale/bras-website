const fs = require('fs');
const path = require('path');

const DUMP_DIR = 'I:\\My Drive\\WhatsApp_Dump';
const GALLERY_DIR = 'I:\\My Drive\\BRAS_Gallery';

// Ensure both directories exist
if (!fs.existsSync(DUMP_DIR)) {
  console.error(`Dump directory not found at ${DUMP_DIR}. Please create it and drop your photos in.`);
  process.exit(1);
}
if (!fs.existsSync(GALLERY_DIR)) {
  console.error(`Gallery directory not found at ${GALLERY_DIR}.`);
  process.exit(1);
}

// 1. Map out existing gallery folders by Thursday Date
const galleryFolders = fs.readdirSync(GALLERY_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// Map of 'YYYY-MM-DD' -> 'Full Folder Name'
const dateToFolderMap = {};

galleryFolders.forEach(folder => {
  // Extract 'YYYY-MM-DD' from the start of the folder name
  const match = folder.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    const dateStr = match[1];
    dateToFolderMap[dateStr] = folder;
  }
});

// Helper to get the Thursday date from a given JS Date object
function getTargetThursday(date) {
  const dayOfWeek = date.getDay(); // Sunday - Saturday : 0 - 6
  // We only care if the photo was taken Thursday (4) or Friday (5)
  if (dayOfWeek === 4) {
    // It's Thursday. Return today's date formatted.
    return date.toISOString().split('T')[0];
  } else if (dayOfWeek === 5) {
    // It's Friday. Return yesterday's date (Thursday).
    const thursdayDate = new Date(date);
    thursdayDate.setDate(thursdayDate.getDate() - 1);
    return thursdayDate.toISOString().split('T')[0];
  }
  return null;
}

let movedCount = 0;
let ignoredCount = 0;

// 2. Scan WhatsApp Dump
const files = fs.readdirSync(DUMP_DIR);

files.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.mp4'].includes(ext)) {
    ignoredCount++;
    return;
  }

  // Check if filename matches WhatsApp pattern IMG-YYYYMMDD-WAXXXX.jpg
  // Or VID-YYYYMMDD-WAXXXX.mp4
  const match = file.match(/^(IMG|VID)-(\d{4})(\d{2})(\d{2})-WA\d+\./i);
  if (match) {
    const year = match[2];
    const month = match[3];
    const day = match[4];
    
    // Create UTC Date object from string
    const photoDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    
    // Determine which Thursday this photo belongs to
    const targetThursdayStr = getTargetThursday(photoDate);

    if (targetThursdayStr && dateToFolderMap[targetThursdayStr]) {
      const targetFolder = dateToFolderMap[targetThursdayStr];
      const sourcePath = path.join(DUMP_DIR, file);
      const destPath = path.join(GALLERY_DIR, targetFolder, file);

      // Copy file over
      fs.copyFileSync(sourcePath, destPath);
      // Optional: Delete the original from the dump folder after copying
      fs.unlinkSync(sourcePath);

      console.log(`Sorted ${file} -> ${targetFolder}`);
      movedCount++;
    } else {
      // Photo is not from a Thursday/Friday, or we don't have a matching gallery folder
      ignoredCount++;
    }
  } else {
    ignoredCount++;
  }
});

console.log('--- Sorting Complete ---');
console.log(`Successfully moved ${movedCount} photos into the Gallery!`);
console.log(`Ignored ${ignoredCount} files (not from a Thursday/Friday social, or not a WhatsApp image).`);
