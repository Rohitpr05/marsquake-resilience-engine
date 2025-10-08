'use client'

import { useRef, useEffect } from 'react'

export default function SpectrogramPanel({ currentTime }) {
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

    // Draw frequency axis
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()

      // Frequency labels
      ctx.fillStyle = '#666666'
      ctx.font = '8px Courier New'
      ctx.fillText(`${10 - i} Hz`, 2, y - 2)
    }

    // Time axis
    for (let i = 0; i <= 20; i++) {
      const x = (width / 20) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw spectrogram data (simulated)
    const imageData = ctx.createImageData(width, height)
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const freq = (height - y) / height * 10 // 0-10 Hz
        const time = x / width * 30 + currentTime
        
        // Simulate seismic frequency content
        let intensity = 0
        
        // P-wave dominant at 1-3 Hz
        intensity += Math.exp(-Math.pow((freq - 2), 2) / 2) * 
                    Math.sin(time * 2) * 0.5 + 0.5
        
        // S-wave at 0.5-1.5 Hz
        intensity += Math.exp(-Math.pow((freq - 1), 2) / 2) * 
                    Math.sin(time * 1.5 + Math.PI) * 0.3 + 0.3
        
        // Add noise
        intensity += Math.random() * 0.1
        
        intensity = Math.max(0, Math.min(1, intensity))
        
        // Color mapping (jet colormap style)
        const idx = (y * width + x) * 4
        
        if (intensity < 0.25) {
          // Blue to Cyan
          const t = intensity / 0.25
          imageData.data[idx] = 0
          imageData.data[idx + 1] = Math.floor(t * 255)
          imageData.data[idx + 2] = 255
        } else if (intensity < 0.5) {
          // Cyan to Green
          const t = (intensity - 0.25) / 0.25
          imageData.data[idx] = 0
          imageData.data[idx + 1] = 255
          imageData.data[idx + 2] = Math.floor((1 - t) * 255)
        } else if (intensity < 0.75) {
          // Green to Yellow
          const t = (intensity - 0.5) / 0.25
          imageData.data[idx] = Math.floor(t * 255)
          imageData.data[idx + 1] = 255
          imageData.data[idx + 2] = 0
        } else {
          // Yellow to Red
          const t = (intensity - 0.75) / 0.25
          imageData.data[idx] = 255
          imageData.data[idx + 1] = Math.floor((1 - t) * 255)
          imageData.data[idx + 2] = 0
        }
        
        imageData.data[idx + 3] = 255
      }
    }
    
    ctx.putImageData(imageData, 0, 0)

    // Color scale bar
    const barWidth = 20
    const barHeight = height - 40
    const barX = width - barWidth - 10
    const barY = 20

    for (let i = 0; i < barHeight; i++) {
      const intensity = 1 - (i / barHeight)
      
      if (intensity < 0.25) {
        const t = intensity / 0.25
        ctx.fillStyle = `rgb(0, ${Math.floor(t * 255)}, 255)`
      } else if (intensity < 0.5) {
        const t = (intensity - 0.25) / 0.25
        ctx.fillStyle = `rgb(0, 255, ${Math.floor((1 - t) * 255)})`
      } else if (intensity < 0.75) {
        const t = (intensity - 0.5) / 0.25
        ctx.fillStyle = `rgb(${Math.floor(t * 255)}, 255, 0)`
      } else {
        const t = (intensity - 0.75) / 0.25
        ctx.fillStyle = `rgb(255, ${Math.floor((1 - t) * 255)}, 0)`
      }
      
      ctx.fillRect(barX, barY + i, barWidth, 1)
    }

    // Scale labels
    ctx.fillStyle = '#ffffff'
    ctx.font = '8px Courier New'
    ctx.fillText('1.0', barX + barWidth + 2, barY + 4)
    ctx.fillText('0.5', barX + barWidth + 2, barY + barHeight / 2 + 4)
    ctx.fillText('0.0', barX + barWidth + 2, barY + barHeight + 4)

  }, [currentTime])

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">FREQUENCY SPECTROGRAM</span>
        <span className="panel-badge">FFT 512</span>
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