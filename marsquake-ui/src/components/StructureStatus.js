'use client'

import { useState, useEffect } from 'react'

export default function StructureStatus({ simulationActive }) {
  const [structures, setStructures] = useState([
    {
      id: 1,
      name: 'Habitat Alpha',
      location: '(50, 50)',
      status: 'safe',
      health: 100,
      damage: 0
    },
    {
      id: 2,
      name: 'Rover Unit-01',
      location: '(60, 60)',
      status: 'safe',
      health: 100,
      tipping: 0
    }
  ])

  useEffect(() => {
    if (simulationActive) {
      const interval = setInterval(() => {
        setStructures(prev => prev.map(structure => {
          // Simulate slight fluctuations during active simulation
          const healthChange = Math.random() * 2 - 1 // -1 to +1
          const newHealth = Math.max(95, Math.min(100, structure.health + healthChange))
          
          let status = 'safe'
          if (newHealth < 98) status = 'monitor'
          if (newHealth < 95) status = 'critical'
          
          return {
            ...structure,
            health: parseFloat(newHealth.toFixed(1)),
            status
          }
        }))
      }, 2000)
      
      return () => clearInterval(interval)
    } else {
      // Reset to safe when simulation stops
      setStructures(prev => prev.map(s => ({ ...s, health: 100, status: 'safe' })))
    }
  }, [simulationActive])

  return (
    <div>
      <div className="panel-header">
        <h2 className="panel-title">Structure Status</h2>
        <span className="panel-badge">2 UNITS</span>
      </div>
      
      <div className="structure-list">
        {structures.map(structure => (
          <div 
            key={structure.id} 
            className={`structure-item ${structure.status}`}
          >
            <div className="structure-info">
              <h3>{structure.name}</h3>
              <p>Location: {structure.location}</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                {structure.damage !== undefined 
                  ? `Damage: ${structure.damage}%` 
                  : `Tipping Risk: ${structure.tipping}%`}
              </p>
            </div>
            
            <div className="structure-status">
              <div className={`status-label ${structure.status}`}>
                {structure.status.toUpperCase()}
              </div>
              <div className="health-percentage">
                {structure.health.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-secondary" style={{ width: '100%' }}>
          VIEW DETAILED ANALYSIS
        </button>
      </div>
    </div>
  )
}