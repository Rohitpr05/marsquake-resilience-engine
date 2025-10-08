'use client'

import { useState, useEffect } from 'react'

export default function StatusPanel({ simulationActive }) {
  const [structures, setStructures] = useState([
    { name: 'HABITAT-ALPHA', status: 'NOMINAL', health: 100 },
    { name: 'ROVER-01', status: 'NOMINAL', health: 100 },
    { name: 'SEISMOMETER', status: 'ACTIVE', health: 100 },
    { name: 'POWER-SYS', status: 'NOMINAL', health: 98 },
    { name: 'COMMS-ARRAY', status: 'NOMINAL', health: 100 },
  ])

  useEffect(() => {
    if (simulationActive) {
      const interval = setInterval(() => {
        setStructures(prev => prev.map(s => {
          const healthChange = (Math.random() - 0.5) * 2
          const newHealth = Math.max(95, Math.min(100, s.health + healthChange))
          
          let status = 'NOMINAL'
          if (newHealth < 97) status = 'MONITOR'
          if (newHealth < 96) status = 'CAUTION'
          
          return { ...s, health: parseFloat(newHealth.toFixed(1)), status }
        }))
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [simulationActive])

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">STRUCTURE STATUS</span>
        <span className="panel-badge">{structures.length} UNITS</span>
      </div>
      <div className="panel-content">
        <div style={{ padding: '8px' }}>
          {structures.map((structure, idx) => (
            <div 
              key={idx}
              style={{
                marginBottom: '8px',
                padding: '6px',
                background: 'var(--bg-secondary)',
                border: `1px solid ${
                  structure.status === 'NOMINAL' ? '#00ff00' :
                  structure.status === 'MONITOR' ? '#ffff00' : '#ff8800'
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
                  INTEGRITY: {structure.health.toFixed(1)}%
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '9px',
                  color: structure.status === 'NOMINAL' ? '#00ff00' :
                         structure.status === 'MONITOR' ? '#ffff00' : '#ff8800',
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
            background: 'rgba(0, 255, 0, 0.1)',
            border: '1px solid #00ff00',
            fontSize: '9px',
            textAlign: 'center',
            color: '#00ff00'
          }}>
            ✓ ALL SYSTEMS OPERATIONAL
          </div>
        </div>
      </div>
    </>
  )
}