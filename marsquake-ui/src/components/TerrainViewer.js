'use client'

import { useState } from 'react'

export default function TerrainViewer() {
  const [imageError, setImageError] = useState(false)

  return (
    <div>
      <div className="panel-header">
        <h2 className="panel-title">Martian Terrain Map</h2>
        <span className="panel-badge">100x100 GRID</span>
      </div>
      
      <div className="terrain-container">
        {!imageError ? (
          <>
            <img 
              src="/terrain.png" 
              alt="Martian Terrain"
              className="terrain-image"
              onError={() => setImageError(true)}
            />
            <div className="terrain-overlay">
              <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <strong>AREA:</strong> 1.00 km²
              </div>
              <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <strong>RESOLUTION:</strong> 10 m/cell
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                <strong>ELEVATION:</strong> 0-1000 m
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Terrain data not loaded
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Run the backend simulation first to generate terrain.png
            </p>
            <button className="btn" onClick={() => window.location.reload()}>
              RELOAD
            </button>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }}>
          ZOOM IN
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }}>
          ZOOM OUT
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }}>
          RESET VIEW
        </button>
      </div>
    </div>
  )
}