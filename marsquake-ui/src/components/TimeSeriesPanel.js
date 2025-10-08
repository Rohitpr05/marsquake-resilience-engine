'use client'

import { useRef, useEffect } from 'react'

export default function TimeSeriesPanel({ currentTime }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1

    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Vertical lines
    for (let i = 0; i <= 20; i++) {
      const x = (width / 20) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Axis labels
    ctx.fillStyle = '#666666'
    ctx.font = '8px Courier New'
    
    // Y-axis (amplitude)
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i
      const amp = (5 - i) * 2 - 5 // -5 to +5
      ctx.fillText(`${amp}`, 2, y + 3)
    }

    // X-axis (time)
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      const t = i * 3 // 30 second window
      ctx.fillText(`${t}s`, x - 8, height - 2)
    }

    // Draw multiple channel data
    const channels = [
      { name: 'VBB-Z', color: '#00ffff', offset: 0 },
      { name: 'VBB-N', color: '#ff00ff', offset: 0.3 },
      { name: 'VBB-E', color: '#ffff00', offset: 0.6 }
    ]

    channels.forEach(channel => {
      ctx.strokeStyle = channel.color
      ctx.lineWidth = 1.5
      ctx.beginPath()

      for (let x = 0; x < width; x++) {
        const time = (x / width) * 30 + currentTime
        
        // Simulated seismic signal
        let amplitude = 0
        
        // Main seismic wave
        amplitude += Math.sin(time * 2 + channel.offset) * 
                    Math.exp(-time * 0.1) * 3
        
        // Secondary waves
        amplitude += Math.sin(time * 4 + channel.offset * 2) * 
                    Math.exp(-time * 0.15) * 1.5
        
        // Background noise
        amplitude += (Math.random() - 0.5) * 0.3
        
        const y = height / 2 - (amplitude * height / 12)
        
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.stroke()
    })

    // Legend
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(width - 80, 5, 75, 40)
    
    channels.forEach((channel, i) => {
      ctx.fillStyle = channel.color
      ctx.fillRect(width - 75, 10 + i * 12, 10, 8)
      ctx.fillStyle = '#ffffff'
      ctx.font = '8px Courier New'
      ctx.fillText(channel.name, width - 62, 17 + i * 12)
    })

  }, [currentTime])

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">SEISMIC TIME SERIES</span>
        <span className="panel-badge">3-AXIS</span>
      </div>
      <div className="panel-content">
        <canvas 
          ref={canvasRef}
          width={400}
          height={300}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </>
  )
}