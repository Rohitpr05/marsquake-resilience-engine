// API Client for Marsquake Simulator
// Handles all communication with Python backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class MarsquakeAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.ws = null;
  }

  // Helper method for API calls
  async fetchAPI(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all marsquake events
  async getEvents() {
    return this.fetchAPI('/api/events');
  }

  // Get structure status
  async getStructures() {
    return this.fetchAPI('/api/structures');
  }

  // Get system metrics
  async getMetrics() {
    return this.fetchAPI('/api/metrics');
  }

  // Get system logs
  async getLogs(limit = 50) {
    return this.fetchAPI(`/api/logs?limit=${limit}`);
  }

  // Get simulation status
  async getSimulationStatus() {
    return this.fetchAPI('/api/simulation/status');
  }

  // Start simulation
  async startSimulation(eventIndex = 0) {
    return this.fetchAPI('/api/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ event_index: eventIndex }),
    });
  }

  // Stop simulation
  async stopSimulation() {
    return this.fetchAPI('/api/simulation/stop', {
      method: 'POST',
    });
  }

  // Get wave field data
  async getWaveField() {
    return this.fetchAPI('/api/simulation/wave-field');
  }

  // Get terrain heightmap
  async getTerrainHeightmap() {
    return this.fetchAPI('/api/terrain/heightmap');
  }

  // Get risk map
  async getRiskMap() {
    return this.fetchAPI('/api/risk-map');
  }

  // Get real-time seismic data
  async getSeismicData() {
    return this.fetchAPI('/api/seismic/realtime');
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage, onError = null, onClose = null) {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected to backend');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (onClose) onClose();
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CLOSED) {
            this.connectWebSocket(onMessage, onError, onClose);
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      if (onError) onError(error);
    }
  }

  // Disconnect WebSocket
  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create singleton instance
const marsquakeAPI = new MarsquakeAPI();
export default marsquakeAPI;