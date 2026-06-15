import React from 'react';
import GalleryGrid from '@/components/GalleryGrid';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gallery - Brighton Real Ale Society',
  description: 'A collection of cover photos from Brighton Real Ale Society socials.',
};

export default async function GalleryPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('bras_user_role')?.value;
  const isMember = role === 'member' || role === 'committee';

  // Fetch socials with cover photos from the database
  let galleryItems: { id: string; pubName: string; date: string; coverPhotoUrl: string; beerName: string | null; breweryName: string | null }[] = [];

  try {
    const socials = await prisma.social.findMany({
      where: { coverPhotoUrl: { not: null } },
      select: {
        id: true,
        pubName: true,
        date: true,
        coverPhotoUrl: true,
        beerName: true,
        breweryName: true
      }
    });

    // Sort reverse-chronologically by date string
    galleryItems = socials
      .filter((s): s is typeof s & { coverPhotoUrl: string } => s.coverPhotoUrl !== null)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (e) {
    console.error('Failed to load gallery data', e);
  }

  return (
    <div className="page-container animate-fade-in" style={{ padding: '40px 20px' }}>
      <div className="page-header">
        <span className="page-header__eyebrow">Memories</span>
        <h1 className="page-header__title">Photo Gallery</h1>
        <p className="page-header__subtitle">
          A collection of memories from our various pub crawls and events around Brighton.
        </p>
      </div>

      {galleryItems.length === 0 ? (
        <div className="notice" style={{ marginTop: '32px' }}>
          No gallery photos have been uploaded yet. Committee members can add cover photos from the dashboard.
        </div>
      ) : (
        <GalleryGrid data={galleryItems} isMember={isMember} />
      )}
    </div>
  );
}
