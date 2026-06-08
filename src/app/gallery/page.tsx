import React from 'react';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Gallery - Brighton Real Ale Society',
  description: 'A collection of photos from Brighton Real Ale Society socials.',
};

type GalleryFolder = {
  name: string;
  images: string[];
};

export default async function GalleryPage() {
  let galleryData: GalleryFolder[] = [];
  
  try {
    const dataPath = path.join(process.cwd(), 'public', 'assets', 'gallery', 'data.json');
    if (fs.existsSync(dataPath)) {
      const fileContents = fs.readFileSync(dataPath, 'utf8');
      galleryData = JSON.parse(fileContents);
    }
  } catch (e) {
    console.error('Failed to load gallery data', e);
  }

  // Sort folders in reverse chronological order (assuming week 2 comes after week 1, etc. or sort alphabetically descending)
  galleryData.sort((a, b) => b.name.localeCompare(a.name));

  return (
    <div className="page-container animate-fade-in" style={{ padding: '40px 20px' }}>
      <div className="page-header">
        <span className="page-header__eyebrow">Memories</span>
        <h1 className="page-header__title">Photo Gallery</h1>
        <p className="page-header__subtitle">
          A collection of memories from our various pub crawls and events around Brighton.
        </p>
      </div>

      {galleryData.length === 0 ? (
        <div className="notice" style={{ marginTop: '32px' }}>
          No photos found. Drop folders into your I:/My Drive/BRAS_Gallery folder and run npm run sync-gallery!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginTop: '32px' }}>
          {galleryData.map((folder, folderIndex) => (
            <div key={folderIndex}>
              <h2 style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.5rem', 
                marginBottom: '16px',
                borderBottom: '2px solid var(--border)',
                paddingBottom: '8px'
              }}>
                {folder.name}
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}>
                {folder.images.map((imgSrc, imgIndex) => (
                  <div 
                    key={imgIndex} 
                    className="section-card section-card--hoverable"
                    style={{ 
                      padding: '0', 
                      overflow: 'hidden',
                      aspectRatio: '1 / 1',
                      position: 'relative'
                    }}
                  >
                    <Image
                      src={encodeURI(imgSrc)}
                      alt={`BRAS Social Photo from ${folder.name} - ${imgIndex + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      className="gallery-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
