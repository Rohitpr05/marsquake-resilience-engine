'use client'

import { useState, useEffect } from 'react'

export default function MarsquakeLog() {
  const [logs, setLogs] = useState([
    {
      id: 1,
      time: '2025-10-08 14:23:15',
      type: 'minor',
      magnitude: 2.3,
      depth: 25.4,
      message: 'Seismic event detected at (45, 52)'
    },
    {
      id: 2,
      time: '2025-10-08 12:15:42',
      type: 'moderate',
      magnitude: 3.5,
      depth: 32.1,
      message: 'Moderate marsquake - All structures nominal'
    },
    {
      id: 3,
      time: '2025-10-08 09:08:33',
      type: 'minor',
      magnitude: 2.7,
      depth: 18.9,
      message: 'Minor tremor recorded - No action required'
    },
    {
      id: 4,
      time: '2025-10-07 22:45:12',
      type: 'major',
      magnitude: 4.2,
      depth: 41.3,
      message: 'Major event - Habitat integrity check initiated'
    },
    {
      id: 5,
      time: '2025-10-07 18:32:55',
      type: 'minor',
      magnitude: 2.1,
      depth: 15.7,
      message: 'Low magnitude event - Monitoring systems active'
    }
  ])

  return (
    <div>
      <div className="panel-header">
        <h2 className="panel-title">Marsquake Event Log</h2>
        <span className="panel-badge">{logs.length} EVENTS</span>
      </div>
      
      <div className="log-container">
        {logs.map(log => (
          <div key={log.id} className="log-entry">
            <span className="log-time">{log.time}</span>
            <span className={`log-type ${log.type}`}>
              M{log.magnitude} {log.type.toUpperCase()}
            </span>
            <span className="log-message">
              {log.message} | Depth: {log.depth} km
            </span>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }}>
          EXPORT LOG
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }}>
          FILTER EVENTS
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }}>
          CLEAR LOG
        </button>
      </div>
    </div>
  )
}