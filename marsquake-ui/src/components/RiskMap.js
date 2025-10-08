'use client'

import { useState } from 'react'

export default function RiskMap() {
  const [imageError, setImageError] = useState(false)

  return (
    <div>
      <div className="panel-header">
        <h2 className="panel-title">AI Risk Assessment</h2>
        <span className="panel-badge">ML PREDICTION</span>
      </div>
      
      <div className="terrain-container">
        {!imageError ? (
          <>
            <img 
              src="/risk_map.png" 
              alt="Risk Map"
              className="terrain-image"
              onError={() => setImageError(true)}
            />
            <div className="terrain-overlay">
              <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                RISK LEGEND:
              </div>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                🟢 <span style={{ color: 'var(--accent-green)' }}>SAFE</span>
              </div>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                🟡 <span style={{ color: 'var(--accent-yellow)' }}>MODERATE</span>
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                🔴 <span style={{ color: 'var(--accent-red)' }}>HIGH RISK</span>
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
              Risk map not available
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Run visualize_risk_map.py to generate risk assessment
            </p>
            <button className="btn" onClick={() => window.location.reload()}>
              RELOAD
            </button>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div className="metric-card">
          <div className="metric-label">Safe Zones</div>
          <div className="metric-value">
            67<span className="metric-unit">%</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">High Risk</div>
          <div className="metric-value" style={{ color: 'var(--accent-red)' }}>
            12<span className="metric-unit">%</span>
          </div>
        </div>
      </div>
    </div>
  )
}