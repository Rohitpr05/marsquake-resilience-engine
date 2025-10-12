'use client'

import { useAPI } from '@/hooks/useAPI'

export default function LogPanelUpdated({ simulationActive }) {
  const { data: logs, loading, error } = useAPI('logs', 1000) // Refresh every second
  
  if (loading && !logs) {
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

  if (error) {
    return (
      <>
        <div className="panel-header">
          <span className="panel-title">SYSTEM LOG</span>
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

  const logsData = logs || []

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">SYSTEM LOG</span>
        <span className="panel-badge">LIVE | {logsData.length} ENTRIES</span>
      </div>
      <div className="panel-content">
        <div className="log-list">
          {logsData.map((log, idx) => (
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
              <span className="log-msg">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}