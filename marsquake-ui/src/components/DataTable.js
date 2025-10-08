'use client'

import { useState, useEffect } from 'react'

export default function DataTable() {
  const [events, setEvents] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Generate data only on client side to avoid hydration mismatch
    const eventsData = [
      { id: 'M001', time: '2025-10-08T14:23:15', mag: 4.73, depth: 30.8, lat: -4.5, lon: 135.6, quality: 'A', pArrival: 3.45, sArrival: 7.89 },
      { id: 'M002', time: '2025-10-08T12:15:42', mag: 3.26, depth: 25.3, lat: -5.2, lon: 134.8, quality: 'B', pArrival: 4.12, sArrival: 8.34 },
      { id: 'M003', time: '2025-10-08T09:08:33', mag: 2.84, depth: 41.2, lat: -3.8, lon: 136.1, quality: 'A', pArrival: 2.98, sArrival: 6.45 },
      { id: 'M004', time: '2025-10-07T22:45:12', mag: 3.51, depth: 18.9, lat: -4.9, lon: 135.2, quality: 'A', pArrival: 3.67, sArrival: 7.23 },
      { id: 'M005', time: '2025-10-07T18:32:55', mag: 2.07, depth: 35.7, lat: -4.1, lon: 135.9, quality: 'C', pArrival: 5.21, sArrival: 9.88 },
      { id: 'M006', time: '2025-10-07T15:21:08', mag: 3.92, depth: 28.4, lat: -5.0, lon: 134.5, quality: 'B', pArrival: 3.89, sArrival: 8.01 },
      { id: 'M007', time: '2025-10-07T11:14:33', mag: 2.45, depth: 22.1, lat: -4.3, lon: 135.8, quality: 'A', pArrival: 4.56, sArrival: 9.12 },
      { id: 'M008', time: '2025-10-07T08:05:19', mag: 3.18, depth: 48.8, lat: -5.5, lon: 136.3, quality: 'B', pArrival: 2.34, sArrival: 5.67 },
      { id: 'M009', time: '2025-10-06T23:42:51', mag: 2.61, depth: 31.5, lat: -4.7, lon: 135.1, quality: 'A', pArrival: 4.01, sArrival: 7.89 },
      { id: 'M010', time: '2025-10-06T19:28:44', mag: 4.12, depth: 26.9, lat: -3.9, lon: 136.0, quality: 'A', pArrival: 3.45, sArrival: 7.12 },
    ]
    
    setEvents(eventsData)
    setMounted(true)
  }, [])

  if (!mounted) {
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
            LOADING EVENT DATA...
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">MARSQUAKE EVENT CATALOG</span>
        <span className="panel-badge">{events.length} EVENTS | SOL 1247-1250</span>
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
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td style={{ color: '#00ffff' }}>{event.id}</td>
                  <td>{event.time}</td>
                  <td style={{ 
                    color: event.mag > 4 ? '#ff0000' : 
                           event.mag > 3 ? '#ffff00' : '#00ff00',
                    fontWeight: 'bold'
                  }}>
                    {event.mag.toFixed(2)}
                  </td>
                  <td>{event.depth.toFixed(1)}</td>
                  <td>{event.lat.toFixed(2)}</td>
                  <td>{event.lon.toFixed(2)}</td>
                  <td style={{ 
                    color: event.quality === 'A' ? '#00ff00' : 
                           event.quality === 'B' ? '#ffff00' : '#ff8800'
                  }}>
                    {event.quality}
                  </td>
                  <td>{event.pArrival.toFixed(2)}s</td>
                  <td>{event.sArrival.toFixed(2)}s</td>
                  <td style={{ color: '#00ff00' }}>PROCESSED</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}