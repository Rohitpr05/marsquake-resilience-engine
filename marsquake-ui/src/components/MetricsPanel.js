'use client'

export default function MetricsPanel({ currentTime }) {
  return (
    <>
      <div className="panel-header">
        <span className="panel-title">SYSTEM METRICS</span>
        <span className="panel-badge">LIVE</span>
      </div>
      <div className="panel-content">
        <div className="data-grid">
          <div className="data-cell">
            <div className="data-label">MARS SOL</div>
            <div className="data-value" style={{ color: '#00ffff' }}>1250</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">GRAVITY</div>
            <div className="data-value">3.71 m/s²</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">TEMP</div>
            <div className="data-value" style={{ color: '#00d4ff' }}>-63°C</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">PRESSURE</div>
            <div className="data-value">600 Pa</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">P-WAVE VEL</div>
            <div className="data-value">3000 m/s</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">S-WAVE VEL</div>
            <div className="data-value">1500 m/s</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">SIM TIME</div>
            <div className="data-value" style={{ color: '#ffff00' }}>
              {currentTime.toFixed(1)}s
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">EVENTS/SOL</div>
            <div className="data-value">2.4</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">SNR</div>
            <div className="data-value" style={{ color: '#00ff00' }}>24.3 dB</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">DAMPING</div>
            <div className="data-value">0.05</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">SOIL RIGID</div>
            <div className="data-value">1.0e8 Pa</div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">DENSITY</div>
            <div className="data-value">1500 kg/m³</div>
          </div>
        </div>
      </div>
    </>
  )
}