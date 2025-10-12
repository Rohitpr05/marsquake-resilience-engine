'use client'

import { useAPI } from '@/hooks/useAPI'

export default function MetricsPanelUpdated({ currentTime }) {
  const { data: metrics, loading, error } = useAPI('metrics', 2000) // Refresh every 2 seconds
  
  if (loading && !metrics) {
    return (
      <>
        <div className="panel-header">
          <span className="panel-title">SYSTEM METRICS</span>
          <span className="panel-badge">LOADING...</span>
        </div>
        <div className="panel-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            LOADING METRICS...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="panel-header">
          <span className="panel-title">SYSTEM METRICS</span>
          <span className="panel-badge">ERROR</span>
        </div>
        <div className="panel-content">
          <div style={{ color: '#ff0000', padding: '10px' }}>
            Connection Error: {error}
          </div>
        </div>
      </>
    )
  }

  const data = metrics || {}

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
            <div className="data-value" style={{ color: '#00ffff' }}>
              {data.mars_sol || 1250}
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">GRAVITY</div>
            <div className="data-value">
              {data.gravity?.toFixed(2) || '3.71'} m/s²
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">TEMP</div>
            <div className="data-value" style={{ color: '#00d4ff' }}>
              {data.temperature || -63}°C
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">PRESSURE</div>
            <div className="data-value">
              {data.pressure || 600} Pa
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">P-WAVE VEL</div>
            <div className="data-value">
              {data.p_wave_velocity || 3000} m/s
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">S-WAVE VEL</div>
            <div className="data-value">
              {data.s_wave_velocity || 1500} m/s
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">SIM TIME</div>
            <div className="data-value" style={{ color: '#ffff00' }}>
              {(currentTime || data.simulation_time || 0).toFixed(1)}s
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">EVENTS/SOL</div>
            <div className="data-value">
              {data.events_per_sol?.toFixed(1) || '2.4'}
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">SNR</div>
            <div className="data-value" style={{ color: '#00ff00' }}>
              {data.snr?.toFixed(1) || '24.3'} dB
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">DAMPING</div>
            <div className="data-value">
              {data.damping || 0.05}
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">SOIL RIGID</div>
            <div className="data-value">
              {data.soil_rigidity ? `${(data.soil_rigidity / 1e8).toFixed(1)}e8` : '1.0e8'} Pa
            </div>
          </div>
          
          <div className="data-cell">
            <div className="data-label">DENSITY</div>
            <div className="data-value">
              {data.soil_density || 1500} kg/m³
            </div>
          </div>
        </div>
      </div>
    </>
  )
}