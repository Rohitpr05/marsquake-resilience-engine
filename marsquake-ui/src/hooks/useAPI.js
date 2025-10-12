'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import marsquakeAPI from '@/services/api'

// Custom hook for API data fetching
export function useAPI(endpoint, refreshInterval = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let result;
      switch (endpoint) {
        case 'events':
          result = await marsquakeAPI.getEvents();
          break;
        case 'structures':
          result = await marsquakeAPI.getStructures();
          break;
        case 'metrics':
          result = await marsquakeAPI.getMetrics();
          break;
        case 'logs':
          result = await marsquakeAPI.getLogs();
          break;
        case 'simulation/status':
          result = await marsquakeAPI.getSimulationStatus();
          break;
        case 'wave-field':
          result = await marsquakeAPI.getWaveField();
          break;
        case 'terrain':
          result = await marsquakeAPI.getTerrainHeightmap();
          break;
        case 'risk-map':
          result = await marsquakeAPI.getRiskMap();
          break;
        case 'seismic':
          result = await marsquakeAPI.getSeismicData();
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }
      
      setData(result)
    } catch (err) {
      setError(err.message)
      console.error(`Error fetching ${endpoint}:`, err)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()

    // Set up refresh interval if specified
    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

// FIXED Hook for WebSocket real-time updates
export function useWebSocket(onUpdate) {
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  
  // Use useRef to store the callback to prevent recreation on every render
  const onUpdateRef = useRef(onUpdate)
  
  // Update ref when callback changes
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    // Stable callback functions that don't change
    const handleMessage = (data) => {
      setLastMessage(data)
      if (onUpdateRef.current) {
        onUpdateRef.current(data)
      }
    }

    const handleError = (error) => {
      console.error('WebSocket error:', error)
      setConnected(false)
    }

    const handleClose = () => {
      setConnected(false)
    }

    const handleOpen = () => {
      setConnected(true)
    }

    // Connect WebSocket
    marsquakeAPI.connectWebSocket(handleMessage, handleError, handleClose)
    
    // Check connection status
    const checkConnection = () => {
      const status = marsquakeAPI.getWebSocketStatus()
      setConnected(status === 'connected')
    }
    
    // Check initial connection
    setTimeout(checkConnection, 1000)
    
    // Cleanup function
    return () => {
      setConnected(false)
      marsquakeAPI.disconnectWebSocket()
    }
  }, []) // Empty dependency array - only run once!

  return { connected, lastMessage }
}

// FIXED Hook for simulation control
export function useSimulation() {
  const [simulationActive, setSimulationActive] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState(null)

  // Get initial status
  useEffect(() => {
    marsquakeAPI.getSimulationStatus()
      .then(status => {
        setSimulationActive(status.active)
        setCurrentTime(status.current_time)
      })
      .catch(err => setError(err.message))
  }, [])

  const startSimulation = useCallback(async (eventIndex = 0) => {
    try {
      setError(null)
      await marsquakeAPI.startSimulation(eventIndex)
      setSimulationActive(true)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const stopSimulation = useCallback(async () => {
    try {
      setError(null)
      await marsquakeAPI.stopSimulation()
      setSimulationActive(false)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Subscribe to real-time updates with stable callback
  useWebSocket(useCallback((data) => {
    if (data.type === 'update') {
      setCurrentTime(data.time)
    }
  }, []))

  return {
    simulationActive,
    currentTime,
    error,
    startSimulation,
    stopSimulation
  }
}