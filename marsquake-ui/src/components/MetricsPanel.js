'use client'

export default function MetricsPanel({ currentTime }) {
  return (
    <div>
      <div className="panel-header">
        <h2 className="panel-title">Mars Environment</h2>
        <span className="panel-badge">LIVE DATA</span>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Gravity</div>
          <div className="metric-value">
            3.71<span className="metric-unit">m/s²</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Temperature</div>
          <div className="metric-value" style={{ color: 'var(--accent-blue)' }}>
            -63<span className="metric-unit">°C</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Pressure</div>
          <div className="metric-value">
            600<span className="metric-unit">Pa</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Sim Time</div>
          <div className="metric-value">
            {currentTime}<span className="metric-unit">s</span>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          WAVE VELOCITIES
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.85rem' }}>P-Wave:</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>3000 m/s</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem' }}>S-Wave:</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>1500 m/s</span>
        </div>
      </div>
    </div>
  )
}