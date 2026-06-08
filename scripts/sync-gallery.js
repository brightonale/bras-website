const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'I:\\My Drive\\BRAS_Gallery';
const DEST_DIR = path.join(__dirname, '..', 'public', 'assets', 'gallery');
const DATA_FILE = path.join(DEST_DIR, 'data.json');

function copyRecursiveSync(src, dest, galleryData) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Only add to galleryData if it's a subfolder inside BRAS_Gallery (not the root itself)
    const folderName = path.basename(src);
    const isRoot = src === SOURCE_DIR;
    let currentFolderData = null;
    
    if (!isRoot) {
      currentFolderData = {
        name: folderName,
        images: []
      };
      galleryData.push(currentFolderData);
    }

    let children = fs.readdirSync(src);

    // If we are in a subfolder, we only want the FIRST valid image.
    if (!isRoot) {
      children = children.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      });
      if (children.length > 0) {
        children = children.slice(0, 1);
      }
    }

    children.forEach(function(childItemName) {
      const childSrc = path.join(src, childItemName);
      const childDest = path.join(dest, childItemName);
      copyRecursiveSync(childSrc, childDest, currentFolderData ? currentFolderData.images : galleryData);
    });
  } else {
    // It's a file. Copy it, and add to the array.
    const ext = path.extname(src).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      fs.copyFileSync(src, dest);
      
      // The galleryData passed here is the `images` array of the parent folder
      if (Array.isArray(galleryData)) {
        // Calculate the public URL path
        const relativeDest = dest.split('public')[1].replace(/\\/g, '/');
        galleryData.push(relativeDest);
      }
    }
  }
}

async function run() {
  console.log(`Starting sync from ${SOURCE_DIR}...`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    console.error(`Please ensure your Google Drive is mapped to the I: drive and the folder exists.`);
    process.exit(1);
  }

  // Clear existing gallery destination
  if (fs.existsSync(DEST_DIR)) {
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DEST_DIR, { recursive: true });

  const galleryData = [];

  // Copy files and build JSON structure
  copyRecursiveSync(SOURCE_DIR, DEST_DIR, galleryData);

  // Write the JSON metadata
  fs.writeFileSync(DATA_FILE, JSON.stringify(galleryData, null, 2));

  console.log(`Successfully synced ${galleryData.length} folders!`);
  console.log(`Gallery data written to ${DATA_FILE}`);
}

run();
