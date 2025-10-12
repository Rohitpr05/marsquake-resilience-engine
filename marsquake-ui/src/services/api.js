// FIXED API Client for Marsquake Simulator
// Handles all communication with Python backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class MarsquakeAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.ws = null;
    this.wsConnecting = false;
    this.wsHandlers = {
      onMessage: null,
      onError: null,
      onClose: null
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
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

  // FIXED WebSocket connection with proper management
  connectWebSocket(onMessage, onError = null, onClose = null) {
    // Prevent multiple connections
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    if (this.wsConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }

    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    
    try {
      this.wsConnecting = true;
      this.wsHandlers = { onMessage, onError, onClose };
      
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.wsConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.wsHandlers.onMessage) {
            this.wsHandlers.onMessage(data);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.wsConnecting = false;
        if (this.wsHandlers.onError) {
          this.wsHandlers.onError(error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.wsConnecting = false;
        
        if (this.wsHandlers.onClose) {
          this.wsHandlers.onClose(event);
        }

        // Only reconnect if not manually closed and within attempt limit
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          
          setTimeout(() => {
            if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
              this.connectWebSocket(onMessage, onError, onClose);
            }
          }, 5000 * this.reconnectAttempts); // Exponential backoff
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.wsConnecting = false;
      if (onError) onError(error);
    }
  }

  // FIXED WebSocket disconnect with proper cleanup
  disconnectWebSocket() {
    console.log('Manually disconnecting WebSocket');
    
    if (this.ws) {
      // Set code 1000 for clean closure to prevent reconnection
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.wsConnecting = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.wsHandlers = { onMessage: null, onError: null, onClose: null };
  }

  // Check WebSocket status
  getWebSocketStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}

// Create singleton instance
const marsquakeAPI = new MarsquakeAPI();
export default marsquakeAPI;