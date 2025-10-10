'use client'

import { useEffect, useRef, useState } from 'react'

export default function MarsMapLeaflet({ simulationActive, currentTime }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [leaflet, setLeaflet] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: -4.5, lon: 135.6 })

  // Load Leaflet on client side only
  useEffect(() => {
    import('leaflet').then((L) => {
      setLeaflet(L)
    })
  }, [])

  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = leaflet.map(mapRef.current, {
      center: [-4.5, 135.6],
      zoom: 4,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: false
    })

    mapInstanceRef.current = map

    // Add Mars imagery layer
    leaflet.tileLayer('https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg', {
      attribution: 'NASA/USGS',
      tileSize: 256,
      noWrap: true,
      bounds: [[-90, -180], [90, 180]]
    }).addTo(map)

    // Add coordinate grid
    addCoordinateGrid(map, leaflet)

    // Add seismic stations
    addStations(map, leaflet)

    // Add epicenter marker if simulation active
    if (simulationActive) {
      addEpicenter(map, leaflet, currentTime)
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leaflet])

  // Update epicenter when simulation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !leaflet) return

    if (simulationActive) {
      addEpicenter(mapInstanceRef.current, leaflet, currentTime)
    }
  }, [simulationActive, currentTime, leaflet])

  const addCoordinateGrid = (map, L) => {
    // Latitude lines
    for (let lat = -90; lat <= 90; lat += 15) {
      L.polyline(
        [[lat, -180], [lat, 180]],
        { 
          color: '#00ffff', 
          weight: 1, 
          opacity: 0.3,
          interactive: false
        }
      ).addTo(map)
    }

    // Longitude lines
    for (let lon = -180; lon <= 180; lon += 15) {
      L.polyline(
        [[-90, lon], [90, lon]],
        { 
          color: '#00ffff', 
          weight: 1, 
          opacity: 0.3,
          interactive: false
        }
      ).addTo(map)
    }
  }

  const addStations = (map, L) => {
    const stations = [
      { name: 'INSIGHT', lat: -4.5, lon: 135.6, color: '#00ff00' },
      { name: 'HABITAT-01', lat: -5.0, lon: 136.0, color: '#0066cc' },
      { name: 'ROVER-01', lat: -4.0, lon: 136.5, color: '#cc9900' }
    ]

    stations.forEach(station => {
      const icon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="
            background: ${station.color};
            width: 12px;
            height: 12px;
            border: 2px solid #000;
            box-shadow: 0 0 10px ${station.color};
          "></div>
        `,
        iconSize: [12, 12]
      })

      L.marker([station.lat, station.lon], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: 'Courier New'; font-size: 10px; color: #000;">
            <strong>${station.name}</strong><br/>
            LAT: ${station.lat.toFixed(2)}°<br/>
            LON: ${station.lon.toFixed(2)}°<br/>
            STATUS: ACTIVE
          </div>
        `)
    })
  }

  const addEpicenter = (map, L, time) => {
    // Remove old epicenter layers
    map.eachLayer(layer => {
      if (layer.options && layer.options.className === 'epicenter-layer') {
        map.removeLayer(layer)
      }
    })

    const epicenterLat = -4.5
    const epicenterLon = 135.6

    // Epicenter marker
    const epicenterIcon = L.divIcon({
      className: 'custom-epicenter-marker',
      html: `
        <div style="
          background: #ff0000;
          width: 16px;
          height: 16px;
          border: 2px solid #000;
          box-shadow: 0 0 20px #ff0000;
        "></div>
      `,
      iconSize: [16, 16]
    })

    L.marker([epicenterLat, epicenterLon], { 
      icon: epicenterIcon,
      className: 'epicenter-layer'
    }).addTo(map)

    // Expanding wave rings
    const waveRadius = (time * 5) % 100
    const radiusInDegrees = waveRadius / 111

    for (let i = 0; i < 3; i++) {
      const radius = radiusInDegrees + (i * 0.5)
      const opacity = Math.max(0, 1 - (radius / (radiusInDegrees + 1.5)))

      L.circle([epicenterLat, epicenterLon], {
        radius: radius * 111000,
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0,
        weight: 2,
        opacity: opacity * 0.7,
        className: 'epicenter-layer'
      }).addTo(map)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!mapInstanceRef.current) return

    const parts = searchQuery.split(',')
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim())
      const lon = parseFloat(parts[1].trim())
      
      if (!isNaN(lat) && !isNaN(lon)) {
        mapInstanceRef.current.setView([lat, lon], 6)
        setCoordinates({ lat, lon })
        
        if (leaflet) {
          leaflet.marker([lat, lon])
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="font-family: 'Courier New'; font-size: 10px;">
                <strong>SEARCH LOCATION</strong><br/>
                LAT: ${lat.toFixed(2)}°<br/>
                LON: ${lon.toFixed(2)}°
              </div>
            `)
            .openPopup()
        }
      }
    }
  }

  const goToLocation = (lat, lon) => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setView([lat, lon], 6)
    setCoordinates({ lat, lon })
  }

  return (
    <>
      {/* Map container - BACKGROUND ONLY */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#2a1810',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />

      {/* Fixed control panel - TOP LEFT */}
      <div style={{
        position: 'fixed',
        top: '45px', // Below header
        left: '10px',
        background: 'rgba(255, 255, 255, 0.98)',
        border: '2px solid #000',
        padding: '10px',
        zIndex: 50,
        width: '280px',
        maxHeight: 'calc(100vh - 60px)',
        overflowY: 'auto'
      }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          borderBottom: '2px solid #000',
          paddingBottom: '4px'
        }}>
          MARS SURFACE MAP - SEISMIC OVERLAY
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch} style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="LAT, LON (e.g. -4.5, 135.6)"
            style={{
              width: '100%',
              padding: '6px',
              border: '2px solid #000',
              fontSize: '10px',
              fontFamily: 'Courier New',
              marginBottom: '6px'
            }}
          />
          <button 
            type="submit"
            className="btn"
            style={{ 
              width: '100%',
              padding: '6px',
              fontSize: '10px'
            }}
          >
            SEARCH COORDINATES
          </button>
        </form>

        {/* Quick locations */}
        <div style={{ fontSize: '9px', marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px' }}>
          QUICK LOCATIONS:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button 
            onClick={() => goToLocation(-4.5, 135.6)}
            className="btn"
            style={{ 
              width: '100%',
              padding: '5px',
              fontSize: '9px',
              textAlign: 'left'
            }}
          >
            ➤ INSIGHT LANDING SITE
          </button>
          <button 
            onClick={() => goToLocation(18.4, 77.5)}
            className="btn"
            style={{ 
              width: '100%',
              padding: '5px',
              fontSize: '9px',
              textAlign: 'left'
            }}
          >
            ➤ JEZERO CRATER
          </button>
          <button 
            onClick={() => goToLocation(-14.6, 175.5)}
            className="btn"
            style={{ 
              width: '100%',
              padding: '5px',
              fontSize: '9px',
              textAlign: 'left'
            }}
          >
            ➤ GUSEV CRATER
          </button>
          <button 
            onClick={() => goToLocation(-5.4, 137.8)}
            className="btn"
            style={{ 
              width: '100%',
              padding: '5px',
              fontSize: '9px',
              textAlign: 'left'
            }}
          >
            ➤ MERIDIANI PLANUM
          </button>
        </div>

        {/* Current view info */}
        <div style={{
          marginTop: '12px',
          fontSize: '8px',
          borderTop: '2px solid #000',
          paddingTop: '8px'
        }}>
          <div style={{ marginBottom: '2px' }}>PROJECTION: EQUIRECTANGULAR</div>
          <div style={{ marginBottom: '2px' }}>DATUM: MARS 2000</div>
          <div style={{ marginBottom: '4px' }}>SOURCE: NASA/USGS VIKING MDIM</div>
          <div style={{ marginTop: '6px', color: '#0066cc', fontWeight: 'bold', fontSize: '9px' }}>
            CENTER: {coordinates.lat.toFixed(2)}°, {coordinates.lon.toFixed(2)}°
          </div>
        </div>
      </div>

      {/* North indicator - BOTTOM LEFT */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #000',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        zIndex: 50
      }}>
        N
      </div>

      {/* Scale bar - BOTTOM LEFT */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #000',
        padding: '8px',
        fontSize: '9px',
        fontFamily: 'Courier New',
        zIndex: 50,
        width: '140px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>SCALE</div>
        <div style={{ 
          width: '120px', 
          height: '6px', 
          background: '#000',
          position: 'relative',
          marginBottom: '4px'
        }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>0</span>
          <span>100 km</span>
        </div>
      </div>
    </>
  )
}
