'use client'

import { useAPI } from '@/hooks/useAPI'

export default function StatusPanelUpdated({ simulationActive }) {
  const { data: structures, loading, error } = useAPI('structures', 2000) // Refresh every 2 seconds
  
  if (loading && !structures) {
    return (
      <>
        <div className="panel-header">
          <span className="panel-title">STRUCTURE STATUS</span>
          <span className="panel-badge">LOADING...</span>
        </div>
        <div className="panel-content">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: '#666666',
            fontSize: '10px'
          }}>
            LOADING STRUCTURE DATA...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="panel-header">
          <span className="panel-title">STRUCTURE STATUS</span>
          <span className="panel-badge">ERROR</span>
        </div>
        <div className="panel-content">
          <div style={{ color: '#ff0000', padding: '10px', fontSize: '10px' }}>
            Connection Error: {error}
          </div>
        </div>
      </>
    )
  }

  const structuresData = structures || []

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">STRUCTURE STATUS</span>
        <span className="panel-badge">{structuresData.length} UNITS</span>
      </div>
      <div className="panel-content">
        <div style={{ padding: '8px' }}>
          {structuresData.map((structure, idx) => (
            <div 
              key={idx}
              style={{
                marginBottom: '8px',
                padding: '6px',
                background: 'var(--bg-secondary)',
                border: `1px solid ${
                  structure.status === 'NOMINAL' || structure.status === 'ACTIVE' || structure.status === 'STABLE' ? '#00ff00' :
                  structure.status === 'MONITOR' || structure.status === 'CAUTION' ? '#ffff00' : '#ff8800'
                }`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '10px', color: '#00ffff', marginBottom: '2px' }}>
                  {structure.name}
                </div>
                <div style={{ fontSize: '8px', color: '#666666' }}>
                  LOC: [{structure.location.join(', ')}]
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '9px',
                  color: structure.status === 'NOMINAL' || structure.status === 'ACTIVE' || structure.status === 'STABLE' ? '#00ff00' :
                         structure.status === 'MONITOR' || structure.status === 'CAUTION' ? '#ffff00' : '#ff8800',
                  fontWeight: 'bold'
                }}>
                  {structure.status}
                </div>
                <div style={{ 
                  fontSize: '14px',
                  color: structure.health > 98 ? '#00ff00' : '#ffff00',
                  fontFamily: 'Courier New',
                  marginTop: '2px'
                }}>
                  {structure.health.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
          
          <div style={{ 
            marginTop: '12px',
            padding: '8px',
            background: structuresData.every(s => s.health > 95) ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)',
            border: `1px solid ${structuresData.every(s => s.health > 95) ? '#00ff00' : '#ffff00'}`,
            fontSize: '9px',
            textAlign: 'center',
            color: structuresData.every(s => s.health > 95) ? '#00ff00' : '#ffff00'
          }}>
            {structuresData.every(s => s.health > 95) ? '✓ ALL SYSTEMS OPERATIONAL' : '⚠ MONITORING REQUIRED'}
          </div>
        </div>
      </div>
    </>
  )
}