import React from 'react';

export default function Loading() {
  return (
    <div className="beer-loader-container">
      <div className="beer-loader">
        <div className="beer-loader__glass">
          <div className="beer-loader__liquid">
            <div className="beer-loader__bubbles"></div>
          </div>
          <div className="beer-loader__handle"></div>
        </div>
      </div>
      <p className="beer-loader__text">Pouring your pint...</p>
    </div>
  );
}
