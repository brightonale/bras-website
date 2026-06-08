"use client";

import Image from 'next/image';

interface GalleryFolder {
  name: string;
  images: string[];
}

interface GalleryGridProps {
  data: GalleryFolder[];
  isMember: boolean;
}

export default function GalleryGrid({ data, isMember }: GalleryGridProps) {
  // If no environment variable is set, fallback to the placeholder
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
      {data.map((folder, folderIndex) => {
        // We only use the very first photo as the cover image
        const coverPhoto = folder.images.length > 0 ? encodeURI(folder.images[0]) : null;

        return (
          <div 
            key={folderIndex} 
            className="section-card section-card--hoverable" 
            style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} 
            onClick={handlePhotoClick}
          >
            <div style={{ 
              aspectRatio: '1 / 1', 
              position: 'relative', 
              background: 'var(--background)' 
            }}>
              {coverPhoto ? (
                <>
                  <Image
                    src={coverPhoto}
                    alt={`Cover photo for ${folder.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="gallery-image"
                  />
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
                </>
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  No cover photo yet.
                </div>
              )}
            </div>
            
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.2rem', 
                margin: 0
              }}>
                {folder.name}
              </h2>
              {/* Lock icon for non-members */}
              {!isMember && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              )}
              {/* External link icon for members */}
              {isMember && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
