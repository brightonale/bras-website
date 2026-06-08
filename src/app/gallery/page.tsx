import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'Gallery - Brighton Real Ale Society',
  description: 'A collection of photos from Brighton Real Ale Society socials.',
};

const PHOTOS = [
  { src: '/assets/photos/photo-1.jpg', alt: 'BRAS Social Photo 1' },
  { src: '/assets/photos/photo-2.jpg', alt: 'BRAS Social Photo 2' },
  { src: '/assets/photos/photo-3.jpg', alt: 'BRAS Social Photo 3' },
  { src: '/assets/photos/photo-4.jpg', alt: 'BRAS Social Photo 4' },
  { src: '/assets/photos/photo-5.jpg', alt: 'BRAS Social Photo 5' },
];

export default function GalleryPage() {
  return (
    <div className="page-container animate-fade-in" style={{ padding: '40px 20px' }}>
      <div className="page-header">
        <span className="page-header__eyebrow">Memories</span>
        <h1 className="page-header__title">Photo Gallery</h1>
        <p className="page-header__subtitle">
          A collection of memories from our various pub crawls and events around Brighton.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginTop: '32px'
      }}>
        {PHOTOS.map((photo, index) => (
          <div 
            key={index} 
            className="section-card section-card--hoverable"
            style={{ 
              padding: '0', 
              overflow: 'hidden',
              aspectRatio: '1 / 1',
              position: 'relative'
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="gallery-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
