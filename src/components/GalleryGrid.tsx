"use client";

import React from 'react';

interface GalleryItem {
  id: string;
  pubName: string;
  date: string;
  coverPhotoUrl: string;
  beerName: string | null;
  breweryName: string | null;
}

interface GalleryGridProps {
  data: GalleryItem[];
  isMember: boolean;
}

export default function GalleryGrid({ data, isMember }: GalleryGridProps) {
  // Link to the full Google Drive gallery folder
  const GOOGLE_DRIVE_LINK = process.env.NEXT_PUBLIC_GALLERY_LINK || "https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE";

  const handlePhotoClick = () => {
    if (isMember) {
      window.open(GOOGLE_DRIVE_LINK, '_blank');
    } else {
      window.location.href = '/non-member';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '32px' }}>
      {data.map((item) => (
        <div
          key={item.id}
          className="section-card section-card--hoverable"
          style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          onClick={handlePhotoClick}
        >
          {/* Cover Photo */}
          <div style={{
            aspectRatio: '1 / 1',
            position: 'relative',
            background: 'var(--background)',
            overflow: 'hidden'
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.coverPhotoUrl}
              alt={`Cover photo for ${item.pubName} - ${item.date}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease'
              }}
              className="gallery-image"
              onError={(e) => {
                // Fallback if the image fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                  parent.innerHTML = '<span style="color: var(--text-muted); font-style: italic; padding: 24px; text-align: center;">Photo unavailable — check the Google Drive link</span>';
                }
              }}
            />

            {/* Hover overlay */}
            <div className="gallery-overlay" style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {isMember ? "Open Gallery" : "Members Only"}
              </span>
            </div>
          </div>

          {/* Card footer — pub name, beer, date */}
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                margin: '0 0 4px 0'
              }}>
                {item.pubName}
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {item.beerName && <>{item.beerName} · </>}{item.date}
              </p>
            </div>
            {/* Lock icon for non-members */}
            {!isMember && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            )}
            {/* External link icon for members */}
            {isMember && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
