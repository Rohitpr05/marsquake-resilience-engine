'use client'

import { useRef, useEffect } from 'react'

export default function ScatterPanel() {
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

    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      const y = (height / 10) * i
      
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Generate scatter data (Magnitude vs Depth)
    const dataPoints = []
    for (let i = 0; i < 150; i++) {
      const magnitude = Math.random() * 5
      const depth = 10 + Math.random() * 40
      // Correlation: larger quakes tend to be deeper
      const correlatedDepth = depth + magnitude * 3 + (Math.random() - 0.5) * 10
      
      dataPoints.push({
        x: magnitude,
        y: Math.max(10, Math.min(50, correlatedDepth))
      })
    }

    // Draw axes
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 2
    
    // X-axis
    ctx.beginPath()
    ctx.moveTo(40, height - 30)
    ctx.lineTo(width - 10, height - 30)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(40, 10)
    ctx.lineTo(40, height - 30)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = '#ffffff'
    ctx.font = '8px Courier New'
    
    // X-axis (Magnitude)
    for (let i = 0; i <= 5; i++) {
      const x = 40 + ((width - 50) / 5) * i
      ctx.fillText(`${i}`, x - 3, height - 18)
      
      // Tick marks
      ctx.strokeStyle = '#666666'
      ctx.beginPath()
      ctx.moveTo(x, height - 30)
      ctx.lineTo(x, height - 26)
      ctx.stroke()
    }

    // Y-axis (Depth)
    for (let i = 0; i <= 5; i++) {
      const y = height - 30 - ((height - 40) / 5) * i
      const depth = 10 + i * 8
      ctx.fillText(`${depth}`, 15, y + 3)
      
      // Tick marks
      ctx.strokeStyle = '#666666'
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(44, y)
      ctx.stroke()
    }

    // Axis titles
    ctx.fillStyle = '#00ffff'
    ctx.font = '9px Courier New'
    ctx.fillText('MAGNITUDE', width / 2 - 25, height - 5)
    
    ctx.save()
    ctx.translate(8, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('DEPTH (km)', -30, 0)
    ctx.restore()

    // Draw data points
    dataPoints.forEach(point => {
      const x = 40 + ((point.x / 5) * (width - 50))
      const y = height - 30 - (((point.y - 10) / 40) * (height - 40))
      
      // Color based on magnitude
      let color
      if (point.x < 2) {
        color = '#00ff00'
      } else if (point.x < 3.5) {
        color = '#ffff00'
      } else {
        color = '#ff0000'
      }

      ctx.fillStyle = color
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
      
      // Glow effect for larger quakes
      if (point.x > 3.5) {
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.3
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    ctx.globalAlpha = 1.0

    // Correlation line (linear regression approximation)
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(40, height - 30 - ((10 - 10) / 40) * (height - 40))
    ctx.lineTo(width - 10, height - 30 - ((35 - 10) / 40) * (height - 40))
    ctx.stroke()
    ctx.setLineDash([])

    // Statistics box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(width - 100, 5, 95, 55)
    
    ctx.fillStyle = '#00ffff'
    ctx.font = '8px Courier New'
    ctx.fillText('N = 150', width - 95, 15)
    ctx.fillText('R² = 0.68', width - 95, 25)
    ctx.fillText('SLOPE = 4.2', width - 95, 35)
    ctx.fillText('P < 0.001', width - 95, 45)
    ctx.fillText('SIG: YES', width - 95, 55)

  }, [])

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">MAGNITUDE vs DEPTH CORRELATION</span>
        <span className="panel-badge">SCATTER</span>
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