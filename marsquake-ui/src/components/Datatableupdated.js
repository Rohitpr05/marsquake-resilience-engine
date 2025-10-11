'use client'

import { useAPI } from '@/hooks/useAPI'

export default function DataTable() {
  const { data: events, loading, error } = useAPI('events', 5000) // Refresh every 5 seconds
  
  if (loading && !events) {
    return (
      <>
        <div className="panel-header">
          <span className="panel-title">MARSQUAKE EVENT CATALOG</span>
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
            FETCHING EVENT DATA FROM BACKEND...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="panel-header">
          <span className="panel-title">MARSQUAKE EVENT CATALOG</span>
          <span className="panel-badge">ERROR</span>
        </div>
        <div className="panel-content">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: '#ff0000',
            fontSize: '10px'
          }}>
            ERROR: {error}
          </div>
        </div>
      </>
    )
  }

  // Calculate arrival times
  const calculateArrivalTime = (depth, waveVelocity) => {
    const distance = Math.sqrt(depth * depth + 100)
    return (distance / (waveVelocity / 1000)).toFixed(2)
  }
  
  // Determine quality based on magnitude and depth
  const determineQuality = (magnitude, depth) => {
    if (magnitude > 4.0 && depth < 30) return 'A'
    if (magnitude > 3.0) return 'B'
    return 'C'
  }

  const eventsData = events || []

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">MARSQUAKE EVENT CATALOG</span>
        <span className="panel-badge">{eventsData.length} EVENTS | LIVE DATA</span>
      </div>
      <div className="panel-content">
        <div className="data-table-content">
          <table>
            <thead>
              <tr>
                <th>EVENT ID</th>
                <th>UTC TIME</th>
                <th>MAG</th>
                <th>DEPTH (km)</th>
                <th>LAT (°)</th>
                <th>LON (°)</th>
                <th>QUALITY</th>
                <th>P-ARRIVAL</th>
                <th>S-ARRIVAL</th>
                <th>TYPE</th>
              </tr>
            </thead>
            <tbody>
              {eventsData.map((event, idx) => {
                const quality = determineQuality(event.magnitude, event.depth_km)
                const pArrival = calculateArrivalTime(event.depth_km, event.p_wave_velocity)
                const sArrival = calculateArrivalTime(event.depth_km, event.s_wave_velocity)
                
                return (
                  <tr key={event.id || idx}>
                    <td style={{ color: '#00ffff' }}>{event.id}</td>
                    <td>{new Date(event.timestamp).toISOString().slice(0, 19)}</td>
                    <td style={{ 
                      color: event.magnitude > 4 ? '#ff0000' : 
                             event.magnitude > 3 ? '#ffff00' : '#00ff00',
                      fontWeight: 'bold'
                    }}>
                      {event.magnitude.toFixed(2)}
                    </td>
                    <td>{event.depth_km.toFixed(1)}</td>
                    <td>{event.latitude.toFixed(2)}</td>
                    <td>{event.longitude.toFixed(2)}</td>
                    <td style={{ 
                      color: quality === 'A' ? '#00ff00' : 
                             quality === 'B' ? '#ffff00' : '#ff8800'
                    }}>
                      {quality}
                    </td>
                    <td>{pArrival}s</td>
                    <td>{sArrival}s</td>
                    <td style={{ 
                      color: event.type === 'major' ? '#ff0000' :
                             event.type === 'moderate' ? '#ffff00' : '#00ff00',
                      textTransform: 'uppercase'
                    }}>
                      {event.type}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}