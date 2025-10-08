'use client'

import { useRef, useEffect } from 'react'

export default function SeismicTrace({ simulationActive, currentTime }) {
  const canvasRef = useRef(null)

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

    if (!simulationActive) {
      ctx.fillStyle = '#666666'
      ctx.font = '12px Courier New'
      ctx.textAlign = 'center'
      ctx.fillText('AWAITING SEISMIC EVENT...', width / 2, height / 2)
      return
    }

    // Draw seismic traces
    const channels = [
      { name: 'BHZ', color: '#00ffff', yOffset: height * 0.15 },
      { name: 'BHN', color: '#ff00ff', yOffset: height * 0.40 },
      { name: 'BHE', color: '#ffff00', yOffset: height * 0.65 },
      { name: 'LHZ', color: '#00ff00', yOffset: height * 0.90 }
    ]

    channels.forEach((channel, channelIdx) => {
      // Channel label
      ctx.fillStyle = channel.color
      ctx.font = '10px Courier New'
      ctx.fillText(channel.name, 10, channel.yOffset - 15)

      // Draw trace
      ctx.strokeStyle = channel.color
      ctx.lineWidth = 1
      ctx.beginPath()

      for (let x = 0; x < width; x++) {
        const time = (x / width) * 60 - 30 + currentTime
        
        // Complex seismic signal simulation
        let amplitude = 0

        if (time > 0) {
          // P-wave arrival
          const pWaveTime = time
          amplitude += Math.sin(pWaveTime * 8 + channelIdx * 0.5) * 
                      Math.exp(-pWaveTime * 0.3) * 5

          // S-wave arrival (delayed)
          const sWaveTime = time - 5
          if (sWaveTime > 0) {
            amplitude += Math.sin(sWaveTime * 4 + channelIdx * 0.3) * 
                        Math.exp(-sWaveTime * 0.2) * 8
          }

          // Surface waves (more delayed)
          const surfaceTime = time - 10
          if (surfaceTime > 0) {
            amplitude += Math.sin(surfaceTime * 2 + channelIdx * 0.7) * 
                        Math.exp(-surfaceTime * 0.15) * 6
          }

          // Coda (scattered waves)
          if (time > 15) {
            amplitude += (Math.random() - 0.5) * 
                        Math.exp(-(time - 15) * 0.1) * 3
          }
        }

        // Background noise
        amplitude += (Math.random() - 0.5) * 0.5

        const y = channel.yOffset + amplitude * 2

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()

      // Reference line
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.moveTo(0, channel.yOffset)
      ctx.lineTo(width, channel.yOffset)
      ctx.stroke()
      ctx.setLineDash([])

      // Amplitude scale
      ctx.fillStyle = '#666666'
      ctx.font = '8px Courier New'
      ctx.fillText('±10 mm/s', width - 45, channel.yOffset - 15)
    })

    // Time markers
    ctx.fillStyle = '#ffffff'
    ctx.font = '8px Courier New'
    for (let i = 0; i <= 6; i++) {
      const x = (width / 6) * i
      const time = (i * 10) - 30 + Math.floor(currentTime)
      ctx.fillText(`${time}s`, x - 8, height - 5)
    }

    // Phase arrival markers
    if (currentTime > 0) {
      // P-wave marker
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

    if (currentTime > 5) {
      // S-wave marker
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
    ctx.fillText(`TIME: ${currentTime.toFixed(1)}s`, 10, 27)
    ctx.fillText(`SAMPLING: 100 Hz`, 10, 37)
    ctx.fillText(`FILTER: 0.1-10 Hz`, 10, 47)
    
    const maxAmp = Math.abs(Math.sin(currentTime * 2) * 10)
    ctx.fillStyle = maxAmp > 8 ? '#ff0000' : '#00ff00'
    ctx.fillText(`MAX AMP: ${maxAmp.toFixed(2)} mm/s`, 10, 57)
    ctx.fillText(`STATUS: ${maxAmp > 8 ? 'HIGH' : 'NORMAL'}`, 10, 67)

  }, [simulationActive, currentTime])

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