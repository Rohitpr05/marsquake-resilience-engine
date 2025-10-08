'use client'

import { useRef, useEffect } from 'react'

export default function HistogramPanel() {
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

    // Generate histogram data (magnitude distribution)
    const bins = 20
    const data = new Array(bins).fill(0)
    
    // Simulate magnitude distribution (more small quakes, fewer large)
    for (let i = 0; i < 1000; i++) {
      const magnitude = Math.abs(Math.random() * Math.random() * 5)
      const bin = Math.floor((magnitude / 5) * bins)
      if (bin < bins) {
        data[bin]++
      }
    }

    const maxCount = Math.max(...data)

    // Draw bars
    const barWidth = width / bins
    
    for (let i = 0; i < bins; i++) {
      const barHeight = (data[i] / maxCount) * (height - 40)
      const x = i * barWidth
      const y = height - 20 - barHeight

      // Color based on magnitude
      const magnitude = (i / bins) * 5
      let color
      if (magnitude < 2) {
        color = '#00ff00'
      } else if (magnitude < 3.5) {
        color = '#ffff00'
      } else {
        color = '#ff0000'
      }

      ctx.fillStyle = color
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight)

      // Border
      ctx.strokeStyle = '#000000'
      ctx.strokeRect(x + 1, y, barWidth - 2, barHeight)
    }

    // Axes
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 1
    
    // X-axis
    ctx.beginPath()
    ctx.moveTo(0, height - 20)
    ctx.lineTo(width, height - 20)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(30, 0)
    ctx.lineTo(30, height - 20)
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#ffffff'
    ctx.font = '8px Courier New'
    
    // X-axis labels (magnitude)
    for (let i = 0; i <= 5; i++) {
      const x = (i / 5) * width
      ctx.fillText(`${i}`, x - 3, height - 8)
    }

    // Y-axis labels (count)
    for (let i = 0; i <= 5; i++) {
      const y = height - 20 - (i / 5) * (height - 40)
      const count = Math.floor((i / 5) * maxCount)
      ctx.fillText(`${count}`, 2, y + 3)
    }

    // Axis titles
    ctx.fillStyle = '#00ffff'
    ctx.font = '9px Courier New'
    ctx.fillText('MAGNITUDE', width / 2 - 30, height - 2)
    
    ctx.save()
    ctx.translate(12, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('COUNT', -20, 0)
    ctx.restore()

    // Statistics box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(width - 90, 5, 85, 45)
    
    ctx.fillStyle = '#00ffff'
    ctx.font = '8px Courier New'
    ctx.fillText('N = 1000', width - 85, 15)
    ctx.fillText('MEAN = 1.84', width - 85, 25)
    ctx.fillText('STD = 0.92', width - 85, 35)
    ctx.fillText('MAX = 4.73', width - 85, 45)

  }, [])

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">MAGNITUDE DISTRIBUTION</span>
        <span className="panel-badge">HIST</span>
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