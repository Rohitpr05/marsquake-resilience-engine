'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('./MarsMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f0f0f0',
      color: '#666'
    }}>
      LOADING MARS IMAGERY...
    </div>
  )
})

export default function MarsMap({ simulationActive, currentTime }) {
  return <MapComponent simulationActive={simulationActive} currentTime={currentTime} />
}