"use client";

import React, { useState } from 'react';
import Image from 'next/image';

type GalleryFolder = {
  name: string;
  images: string[];
};

export default function GalleryGrid({ data }: { data: GalleryFolder[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Close lightbox on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginTop: '32px' }}>
        {data.map((folder, folderIndex) => (
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
            
            {folder.images.length === 0 ? (
              <div style={{
                padding: '24px',
                border: '1px dashed var(--border)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
              }}>
                No photos have been uploaded for this social yet.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}>
                {folder.images.map((imgSrc, imgIndex) => {
                  const encodedSrc = encodeURI(imgSrc);
                  return (
                    <div 
                      key={imgIndex} 
                      className="section-card section-card--hoverable"
                      style={{ 
                        padding: '0', 
                        overflow: 'hidden',
                        aspectRatio: '1 / 1',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedImage(encodedSrc)}
                    >
                      <Image
                        src={encodedSrc}
                        alt={`BRAS Social Photo from ${folder.name} - ${imgIndex + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        className="gallery-image"
                      />
                      {/* Hover overlay with download icon hint */}
                      <div className="gallery-overlay" style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(0,0,0,0.6)',
                        borderRadius: '50%',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.8
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '1200px', height: '80vh' }}>
            <Image
              src={selectedImage}
              alt="Fullscreen view"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <a 
              href={selectedImage}
              download
              onClick={(e) => e.stopPropagation()} // Prevent lightbox from closing when clicking download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download High-Res
            </a>
            
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
