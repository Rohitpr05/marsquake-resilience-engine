'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FloatingWindow from '@/components/FloatingWindow'
import MarsMap from '@/components/MarsMap'
import SpectrogramPanel from '@/components/SpectrogramPanel'
import TimeSeriesPanel from '@/components/TimeSeriesPanel'
import HistogramPanel from '@/components/HistogramPanel'
import ScatterPanel from '@/components/ScatterPanel'
import SeismicTrace from '@/components/SeismicTrace'
import DataTable from '@/components/DataTable'
import MetricsPanel from '@/components/MetricsPanel'
import LogPanel from '@/components/LogPanel'
import StatusPanel from '@/components/StatusPanel'

export default function MissionControl() {
  const [simulationActive, setSimulationActive] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  
  // Window visibility states
  const [windows, setWindows] = useState({
    spectrogram: false,
    timeSeries: false,
    histogram: false,
    scatter: false,
    seismic: false,
    dataTable: true,
    metrics: true,
    log: true,
    status: true
  })

  useEffect(() => {
    if (simulationActive) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [simulationActive])

  const toggleWindow = (windowName) => {
    setWindows(prev => ({
      ...prev,
      [windowName]: !prev[windowName]
    }))
  }

  return (
    <div className="mission-control">
      <Header 
        simulationActive={simulationActive}
        onToggleSimulation={() => setSimulationActive(!simulationActive)}
      />
      
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
            <MetricsPanel currentTime={currentTime} />
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
            <StatusPanel simulationActive={simulationActive} />
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
            <DataTable />
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
            <SeismicTrace simulationActive={simulationActive} currentTime={currentTime} />
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
            <LogPanel simulationActive={simulationActive} />
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
        </div>
      </div>
    </div>
  )
}