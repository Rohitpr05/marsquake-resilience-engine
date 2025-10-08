'use client'

import { useState, useEffect } from 'react'

export default function Header({ simulationActive, onToggleSimulation }) {
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const sol = Math.floor((now.getTime() / 1000 / 86400) % 1000)
      setTimestamp(`SOL ${sol} ${now.toISOString().slice(11, 19)} UTC`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="header">
      <div className="header-title">
        <h1>MARSQUAKE MONITORING SYSTEM v2.1</h1>
        <span className="timestamp">{timestamp || 'INITIALIZING...'}</span>
      </div>
      
      <div className="status-bar">
        <span className={`status-item ${simulationActive ? 'active' : ''}`}>
          SIM: {simulationActive ? 'ACTIVE' : 'STANDBY'}
        </span>
        <span className="status-item active">TELEMETRY: NOMINAL</span>
        <span className="status-item active">UPLINK: 128 kbps</span>
      </div>
      
      <button 
        className={`control-btn ${simulationActive ? 'active' : ''}`}
        onClick={onToggleSimulation}
      >
        {simulationActive ? '■ STOP' : '▶ START'}
      </button>
    </header>
  )
}