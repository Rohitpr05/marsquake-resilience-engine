'use client'

import { useState, useRef, useEffect } from 'react'

export default function FloatingWindow({ 
  title, 
  children, 
  initialX = 100, 
  initialY = 100,
  initialWidth = 400,
  initialHeight = 300,
  onClose
}) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef(null)

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls')) return
    
    const rect = windowRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  return (
    <div 
      ref={windowRef}
      className={`floating-window ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${initialWidth}px`,
        height: `${initialHeight}px`,
        zIndex: isDragging ? 1000 : 100
      }}
    >
      <div 
        className="window-titlebar"
        onMouseDown={handleMouseDown}
      >
        <span className="window-title">{title}</span>
        <div className="window-controls">
          <button className="window-btn minimize">_</button>
          <button className="window-btn close" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
    </div>
  )
}