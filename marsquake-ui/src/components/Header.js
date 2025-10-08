'use client'

export default function Header({ simulationActive, onToggleSimulation }) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>MARSQUAKE SIMULATOR</h1>
        <span className="mission-badge">MISSION CONTROL</span>
      </div>
      
      <div className="status-indicators">
        <div className="status-item">
          <div className={`status-dot ${simulationActive ? 'green' : 'yellow'}`}></div>
          <span>SYSTEM: {simulationActive ? 'ACTIVE' : 'STANDBY'}</span>
        </div>
        <div className="status-item">
          <div className="status-dot green"></div>
          <span>COMMS: ONLINE</span>
        </div>
        <div className="status-item">
          <div className="status-dot green"></div>
          <span>DATA: NOMINAL</span>
        </div>
      </div>
      
      <button 
        className={`btn ${simulationActive ? 'btn-secondary' : ''}`}
        onClick={onToggleSimulation}
      >
        {simulationActive ? 'STOP SIMULATION' : 'START SIMULATION'}
      </button>
    </header>
  )
}