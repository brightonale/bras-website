import React from 'react';
import fs from 'fs';
import path from 'path';
import GalleryGrid from '@/components/GalleryGrid';

export const metadata = {
  title: 'Gallery - Brighton Real Ale Society',
  description: 'A collection of photos from Brighton Real Ale Society socials.',
};

import { cookies } from 'next/headers';

type GalleryFolder = {
  name: string;
  images: string[];
};

export default async function GalleryPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('bras_user_role')?.value;
  const isMember = role === 'member' || role === 'committee';

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
        <GalleryGrid data={galleryData} isMember={isMember} />
      )}
    </div>
  );
}
