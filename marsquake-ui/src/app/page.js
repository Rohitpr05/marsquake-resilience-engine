'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import TerrainViewer from '@/components/TerrainViewer'
import RiskMap from '@/components/RiskMap'
import MarsquakeLog from '@/components/MarsquakeLog'
import StructureStatus from '@/components/StructureStatus'
import MetricsPanel from '@/components/MetricsPanel'
import WaveSimulation from '@/components/WaveSimulation'

export default function MissionControl() {
  const [simulationActive, setSimulationActive] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (simulationActive) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [simulationActive])

  return (
    <div className="mission-control">
      <Header 
        simulationActive={simulationActive}
        onToggleSimulation={() => setSimulationActive(!simulationActive)}
      />
      
      <div className="dashboard">
        {/* Terrain Viewer - Large */}
        <div className="panel panel-large">
          <TerrainViewer />
        </div>

        {/* Metrics Panel */}
        <div className="panel">
          <MetricsPanel currentTime={currentTime} />
        </div>

        {/* Risk Map - Large */}
        <div className="panel panel-large">
          <RiskMap />
        </div>

        {/* Structure Status */}
        <div className="panel">
          <StructureStatus simulationActive={simulationActive} />
        </div>

        {/* Wave Simulation - Full Width */}
        <div className="panel panel-full">
          <WaveSimulation 
            isActive={simulationActive} 
            currentTime={currentTime}
          />
        </div>

        {/* Marsquake Event Log - Full Width */}
        <div className="panel panel-full">
          <MarsquakeLog />
        </div>
      </div>
    </div>
  )
}