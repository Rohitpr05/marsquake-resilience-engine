'use client'

import { useEffect, useRef } from 'react'

export default function WaveSimulation({ isActive, currentTime }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)

    if (!isActive) {
      // Show standby message
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px Courier New'
      ctx.textAlign = 'center'
      ctx.fillText('SIMULATION STANDBY', width / 2, height / 2)
      return
    }

    // Draw grid
    ctx.strokeStyle = '#2d3748'
    ctx.lineWidth = 1
    
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw epicenter
    const epicenterX = width / 2
    const epicenterY = height / 2
    
    ctx.fillStyle = '#ff4444'
    ctx.beginPath()
    ctx.arc(epicenterX, epicenterY, 5, 0, Math.PI * 2)
    ctx.fill()

    // Draw expanding wave rings
    const numRings = 5
    for (let i = 0; i < numRings; i++) {
      const radius = ((currentTime * 10) + (i * 30)) % 200
      const opacity = 1 - (radius / 200)
      
      ctx.strokeStyle = `rgba(0, 212, 255, ${opacity * 0.5})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(epicenterX, epicenterY, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw structures
    // Habitat
    ctx.fillStyle = '#00ff88'
    ctx.fillRect(epicenterX - 10, epicenterY - 10, 20, 20)
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    ctx.strokeRect(epicenterX - 10, epicenterY - 10, 20, 20)

    // Rover
    ctx.fillStyle = '#ffaa00'
    ctx.beginPath()
    ctx.arc(epicenterX + 50, epicenterY + 50, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw wave amplitude graph
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let x = 0; x < width; x += 2) {
      const time = currentTime + (x / 50)
      const amplitude = Math.sin(time) * 20 * Math.exp(-x / 200)
      const y = height - 50 + amplitude
      
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

  }, [isActive, currentTime])

  return (
    <div>
      <div className="panel-header">
        <h2 className="panel-title">Wave Propagation</h2>
        <span className="panel-badge">REAL-TIME</span>
      </div>
      
      <canvas 
        ref={canvasRef}
        width={1200}
        height={300}
        style={{ 
          width: '100%', 
          height: 'auto',
          border: '1px solid var(--accent-blue)',
          borderRadius: '4px',
          background: 'var(--bg-secondary)'
        }}
      />
      
      <div style={{ 
        marginTop: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        <div>
          <span style={{ color: 'var(--accent-red)' }}>●</span> Epicenter
          <span style={{ marginLeft: '1.5rem', color: 'var(--accent-green)' }}>■</span> Habitat
          <span style={{ marginLeft: '1.5rem', color: 'var(--accent-yellow)' }}>●</span> Rover
        </div>
        <div>
          Max Amplitude: <span style={{ color: 'var(--accent-blue)' }}>
            {(Math.sin(currentTime) * 10).toFixed(2)} mm
          </span>
        </div>
      </div>
    </div>
  )
}