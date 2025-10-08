'use client'

import { useState, useEffect } from 'react'

export default function LogPanel({ simulationActive }) {
  const [logs, setLogs] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize with static logs
    const initialLogs = [
      { time: '14:23:15.234', level: 'WARN', msg: 'High amplitude detected on BHZ channel' },
      { time: '14:23:12.891', level: 'INFO', msg: 'P-wave arrival confirmed at station INSIGHT' },
      { time: '14:23:10.456', level: 'EVENT', msg: 'Seismic event M4.73 detected at -4.5°, 135.6°' },
      { time: '14:23:09.123', level: 'INFO', msg: 'Trigger threshold exceeded: 3.2 sigma' },
      { time: '12:15:42.678', level: 'INFO', msg: 'Event M3.26 processed and cataloged' },
      { time: '12:15:40.234', level: 'EVENT', msg: 'Moderate marsquake detected' },
      { time: '09:08:33.567', level: 'INFO', msg: 'Background noise level: nominal' },
      { time: '09:08:30.890', level: 'INFO', msg: 'Calibration pulse completed successfully' },
    ]
    
    setLogs(initialLogs)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (simulationActive && mounted) {
      const interval = setInterval(() => {
        const now = new Date()
        const newLog = {
          time: now.toLocaleTimeString('en-US', { hour12: false }) + 
                '.' + String(now.getMilliseconds()).padStart(3, '0'),
          level: Math.random() > 0.7 ? 'WARN' : 'INFO',
          msg: [
            'Wave amplitude: ' + (Math.random() * 10).toFixed(2) + ' mm/s',
            'Frequency peak at ' + (Math.random() * 5).toFixed(1) + ' Hz',
            'Station health check: all nominal',
            'Data buffer: 87% capacity',
            'Telemetry uplink successful'
          ][Math.floor(Math.random() * 5)]
        }
        
        setLogs(prev => [newLog, ...prev].slice(0, 20))
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [simulationActive, mounted])

  if (!mounted) {
    return (
      <>
        <div className="panel-header">
          <span className="panel-title">SYSTEM LOG</span>
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
            INITIALIZING LOG SYSTEM...
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">SYSTEM LOG</span>
        <span className="panel-badge">REAL-TIME</span>
      </div>
      <div className="panel-content">
        <div className="log-list">
          {logs.map((log, idx) => (
            <div key={idx} className="log-entry">
              <span className="log-time">{log.time}</span>
              <span style={{ 
                color: log.level === 'EVENT' ? '#ff0000' :
                       log.level === 'WARN' ? '#ffff00' :
                       log.level === 'ERROR' ? '#ff0000' : '#00ff00',
                minWidth: '50px',
                fontWeight: 'bold'
              }}>
                {log.level}
              </span>
              <span className="log-msg">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}