'use client'

import { useRef, useEffect } from 'react'
import { useAPI } from '@/hooks/useAPI'

export default function SeismicTraceUpdated({ simulationActive, currentTime }) {
  const canvasRef = useRef(null)
  const { data: seismicData, loading, error } = useAPI('seismic', 500) // Refresh every 500ms

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1

    for (let i = 0; i <= 20; i++) {
      const y = (height / 20) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    for (let i = 0; i <= 40; i++) {
      const x = (width / 40) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    if (!simulationActive || !seismicData) {
      ctx.fillStyle = '#666666'
      ctx.font = '12px Courier New'
      ctx.textAlign = 'center'
      ctx.fillText('AWAITING SEISMIC EVENT...', width / 2, height / 2)
      return
    }

    // Draw seismic traces from backend data
    const channels = seismicData.channels || []

    channels.forEach((channel, channelIdx) => {
      const yOffset = height * (0.15 + channelIdx * 0.25)
      
      // Channel label
      ctx.fillStyle = channel.color
      ctx.font = '10px Courier New'
      ctx.fillText(channel.name, 10, yOffset - 15)

      // Draw trace
      ctx.strokeStyle = channel.color
      ctx.lineWidth = 1
      ctx.beginPath()

      const data = channel.data || []
      data.forEach((point, i) => {
        const x = (i / data.length) * width
        const y = yOffset + point.amplitude * 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Reference line
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.moveTo(0, yOffset)
      ctx.lineTo(width, yOffset)
      ctx.stroke()
      ctx.setLineDash([])

      // Amplitude scale
      ctx.fillStyle = '#666666'
      ctx.font = '8px Courier New'
      ctx.fillText('±10 mm/s', width - 45, yOffset - 15)
    })

    // Phase arrival markers
    if (seismicData.p_arrival !== null && seismicData.p_arrival !== undefined) {
      const pX = width / 2
      ctx.strokeStyle = '#ff0000'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(pX, 0)
      ctx.lineTo(pX, height)
      ctx.stroke()
      
      ctx.fillStyle = '#ff0000'
      ctx.font = '10px Courier New'
      ctx.fillText('P', pX + 3, 12)
    }

    if (seismicData.s_arrival !== null && seismicData.s_arrival !== undefined) {
      const sX = width / 2 + (5 / 60) * width
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(sX, 0)
      ctx.lineTo(sX, height)
      ctx.stroke()
      
      ctx.fillStyle = '#00ff00'
      ctx.fillText('S', sX + 3, 12)
    }

    ctx.setLineDash([])

    // Info box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(5, 5, 150, 65)
    
    ctx.fillStyle = '#00ffff'
    ctx.font = '8px Courier New'
    ctx.fillText('SEISMIC WAVEFORM', 10, 15)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`TIME: ${(seismicData.current_time || 0).toFixed(1)}s`, 10, 27)
    ctx.fillText(`SAMPLING: 100 Hz`, 10, 37)
    ctx.fillText(`FILTER: 0.1-10 Hz`, 10, 47)
    
    const maxAmp = 10
    ctx.fillStyle = maxAmp > 8 ? '#ff0000' : '#00ff00'
    ctx.fillText(`MAX AMP: ${maxAmp.toFixed(2)} mm/s`, 10, 57)
    ctx.fillText(`STATUS: ${maxAmp > 8 ? 'HIGH' : 'NORMAL'}`, 10, 67)

  }, [simulationActive, currentTime, seismicData])

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">BROADBAND SEISMOMETER - REAL-TIME TRACE</span>
        <span className="panel-badge">4 CHANNELS | 100 Hz</span>
      </div>
      <div className="panel-content">
        <canvas 
          ref={canvasRef}
          width={1400}
          height={400}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </>
  )
}