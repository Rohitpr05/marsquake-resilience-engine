'use client'

import { useState, useEffect } from 'react'
import { useSimulation, useWebSocket } from '@/hooks/useAPI'
import Header from '@/components/Header'
import FloatingWindow from '@/components/FloatingWindow'
import MarsMap from '@/components/MarsMap'
import SpectrogramPanel from '@/components/SpectrogramPanel'
import TimeSeriesPanel from '@/components/TimeSeriesPanel'
import HistogramPanel from '@/components/HistogramPanel'
import ScatterPanel from '@/components/ScatterPanel'
import SeismicTraceUpdated from '@/components/SeismicTraceUpdated'
import DataTableUpdated from '@/components/Datatableupdated'
import MetricsPanelUpdated from '@/components/Metricspanelupdated'
import LogPanelUpdated from '@/components/LogPanelUpdated'
import StatusPanelUpdated from '@/components/StatusPanelUpdated'

export default function MissionControl() {
  // Use simulation hook for control
  const { 
    simulationActive, 
    currentTime, 
    startSimulation, 
    stopSimulation,
    error: simError 
  } = useSimulation()
  
  // WebSocket for real-time updates
  const { connected } = useWebSocket((data) => {
    // Handle real-time updates here if needed
    console.log('Real-time update:', data)
  })
  
  // Window visibility states
  const [windows, setWindows] = useState({
    spectrogram: false,
    timeSeries: false,
    histogram: false,
    scatter: false,
    seismic: true,
    dataTable: true,
    metrics: true,
    log: true,
    status: true
  })

  const toggleWindow = (windowName) => {
    setWindows(prev => ({
      ...prev,
      [windowName]: !prev[windowName]
    }))
  }

  const handleToggleSimulation = async () => {
    try {
      if (simulationActive) {
        await stopSimulation()
      } else {
        await startSimulation(0) // Start with first event
      }
    } catch (error) {
      console.error('Simulation control error:', error)
    }
  }

  return (
    <div className="mission-control">
      <Header 
        simulationActive={simulationActive}
        onToggleSimulation={handleToggleSimulation}
        connected={connected}
      />
      
      {simError && (
        <div style={{
          position: 'fixed',
          top: '40px',
          right: '20px',
          background: '#ff0000',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 9999
        }}>
          ERROR: {simError}
        </div>
      )}
      
      <div className="main-container">
        {/* Full-screen map background */}
        <div className="map-container-full">
          <MarsMap simulationActive={simulationActive} currentTime={currentTime} />
        </div>

        {/* Floating windows */}
        {windows.metrics && (
          <FloatingWindow
            title="SYSTEM METRICS"
            initialX={20}
            initialY={50}
            initialWidth={300}
            initialHeight={280}
            onClose={() => toggleWindow('metrics')}
          >
            <MetricsPanelUpdated currentTime={currentTime} />
          </FloatingWindow>
        )}

        {windows.status && (
          <FloatingWindow
            title="STRUCTURE STATUS"
            initialX={20}
            initialY={350}
            initialWidth={300}
            initialHeight={250}
            onClose={() => toggleWindow('status')}
          >
            <StatusPanelUpdated simulationActive={simulationActive} />
          </FloatingWindow>
        )}

        {windows.dataTable && (
          <FloatingWindow
            title="EVENT CATALOG"
            initialX={340}
            initialY={50}
            initialWidth={700}
            initialHeight={300}
            onClose={() => toggleWindow('dataTable')}
          >
            <DataTableUpdated />
          </FloatingWindow>
        )}

        {windows.seismic && (
          <FloatingWindow
            title="SEISMIC TRACE"
            initialX={340}
            initialY={370}
            initialWidth={700}
            initialHeight={280}
            onClose={() => toggleWindow('seismic')}
          >
            <SeismicTraceUpdated simulationActive={simulationActive} currentTime={currentTime} />
          </FloatingWindow>
        )}

        {windows.log && (
          <FloatingWindow
            title="SYSTEM LOG"
            initialX={1060}
            initialY={50}
            initialWidth={350}
            initialHeight={300}
            onClose={() => toggleWindow('log')}
          >
            <LogPanelUpdated simulationActive={simulationActive} />
          </FloatingWindow>
        )}

        {windows.spectrogram && (
          <FloatingWindow
            title="FREQUENCY SPECTROGRAM"
            initialX={1060}
            initialY={370}
            initialWidth={350}
            initialHeight={280}
            onClose={() => toggleWindow('spectrogram')}
          >
            <SpectrogramPanel currentTime={currentTime} />
          </FloatingWindow>
        )}

        {windows.timeSeries && (
          <FloatingWindow
            title="TIME SERIES"
            initialX={450}
            initialY={150}
            initialWidth={400}
            initialHeight={300}
            onClose={() => toggleWindow('timeSeries')}
          >
            <TimeSeriesPanel currentTime={currentTime} />
          </FloatingWindow>
        )}

        {windows.histogram && (
          <FloatingWindow
            title="MAGNITUDE DISTRIBUTION"
            initialX={500}
            initialY={200}
            initialWidth={400}
            initialHeight={300}
            onClose={() => toggleWindow('histogram')}
          >
            <HistogramPanel />
          </FloatingWindow>
        )}

        {windows.scatter && (
          <FloatingWindow
            title="MAGNITUDE vs DEPTH"
            initialX={550}
            initialY={250}
            initialWidth={400}
            initialHeight={300}
            onClose={() => toggleWindow('scatter')}
          >
            <ScatterPanel />
          </FloatingWindow>
        )}

        {/* Right sidebar control panel */}
        <div className="control-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Window Controls</div>
            {Object.keys(windows).map(windowName => (
              <div
                key={windowName}
                className={`sidebar-item ${windows[windowName] ? 'active' : ''}`}
                onClick={() => toggleWindow(windowName)}
              >
                <span>{windowName.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}</span>
                <span>{windows[windowName] ? '■' : '□'}</span>
              </div>
            ))}
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-title">Quick Actions</div>
            <button className="btn" style={{ width: '100%', marginBottom: '4px' }}>
              EXPORT DATA
            </button>
            <button className="btn" style={{ width: '100%', marginBottom: '4px' }}>
              RESET VIEW
            </button>
            <button className="btn" style={{ width: '100%' }}>
              SCREENSHOT
            </button>
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-title">Connection Status</div>
            <div style={{ 
              padding: '8px',
              background: connected ? '#00ff0020' : '#ff000020',
              border: `1px solid ${connected ? '#00ff00' : '#ff0000'}`,
              borderRadius: '4px',
              fontSize: '9px',
              textAlign: 'center'
            }}>
              {connected ? '✓ BACKEND CONNECTED' : '✗ BACKEND DISCONNECTED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}