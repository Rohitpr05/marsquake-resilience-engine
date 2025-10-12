# -*- coding: utf-8 -*-
"""
FastAPI Backend Server for Marsquake Simulator
Connects Python simulation to Next.js frontend
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import os
import asyncio
from contextlib import asynccontextmanager

# Import your simulation modules
from src.data_pipeline.marsquake_generator import MarsquakeGenerator
from src.data_pipeline.terrain_generator import TerrainGenerator
from src.physics.wave_propagation import WavePropagation
from src.physics.mars_environment import MarsEnvironment
from src.structures.habitat_model import HabitatModel
from src.structures.rover_model import RoverModel
from src.ai.risk_predictor import RiskPredictor
import config

# Global simulation state
simulation_state = {
    "terrain": None,
    "properties": None,
    "wave_sim": None,
    "habitat": None,
    "rover": None,
    "environment": None,
    "current_event": None,
    "events": [],
    "risk_map": None,
    "simulation_active": False,
    "current_time": 0.0,
    "logs": []
}

# WebSocket connection management
connected_clients = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Initializing Marsquake Simulator Backend...")
    await initialize_simulation()
    yield
    # Shutdown
    print("Shutting down Marsquake Simulator Backend...")

app = FastAPI(
    title="Marsquake Simulator API",
    description="Backend API for Mars Habitat Resilience Lab",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class EventData(BaseModel):
    id: str
    timestamp: str
    magnitude: float
    latitude: float
    longitude: float
    depth_km: float
    type: str
    p_wave_velocity: float
    s_wave_velocity: float

class StructureStatus(BaseModel):
    name: str
    location: List[int]
    status: str
    health: float
    damage_level: Optional[float] = 0.0
    tipping_risk: Optional[float] = 0.0

class SimulationStatus(BaseModel):
    active: bool
    current_time: float
    current_event: Optional[Dict[str, Any]]
    max_amplitude: float

class MetricsData(BaseModel):
    mars_sol: int
    gravity: float
    temperature: float
    pressure: float
    p_wave_velocity: float
    s_wave_velocity: float
    simulation_time: float
    events_per_sol: float
    snr: float
    damping: float
    soil_rigidity: float
    soil_density: float

class LogEntry(BaseModel):
    time: str
    level: str
    message: str

class WaveFieldData(BaseModel):
    field: List[List[float]]
    max_amplitude: float
    epicenter: List[float]
    time: float

# Initialize simulation components
async def initialize_simulation():
    """Initialize all simulation components"""
    global simulation_state
    
    print("Generating terrain...")
    terrain_gen = TerrainGenerator(size=100, resolution=10, seed=42)
    simulation_state["terrain"] = terrain_gen.generate_height_map()
    simulation_state["properties"] = terrain_gen.calculate_soil_properties()
    
    print("Initializing physics...")
    simulation_state["wave_sim"] = WavePropagation(
        simulation_state["terrain"], 
        simulation_state["properties"]
    )
    simulation_state["environment"] = MarsEnvironment()
    
    print("Setting up structures...")
    simulation_state["habitat"] = HabitatModel(location=(50, 50))
    simulation_state["rover"] = RoverModel(location=(60, 60))
    
    print("Generating marsquake events...")
    quake_gen = MarsquakeGenerator(seed=42)
    events = quake_gen.generate_sequence(num_events=20, days_span=30)
    simulation_state["events"] = events
    
    # Initialize logs
    simulation_state["logs"] = [
        {"time": datetime.now().strftime("%H:%M:%S.%f")[:-3], 
         "level": "INFO", 
         "message": "System initialized successfully"}
    ]
    
    print("Backend initialization complete!")

def add_log(level: str, message: str):
    """Add entry to system log"""
    global simulation_state
    log_entry = {
        "time": datetime.now().strftime("%H:%M:%S.%f")[:-3],
        "level": level,
        "message": message
    }
    simulation_state["logs"].append(log_entry)
    # Keep only last 100 logs
    if len(simulation_state["logs"]) > 100:
        simulation_state["logs"] = simulation_state["logs"][-100:]
    return log_entry

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "status": "online",
        "api": "Marsquake Simulator Backend",
        "version": "1.0.0",
        "simulation_ready": simulation_state["terrain"] is not None
    }

@app.get("/api/events", response_model=List[EventData])
async def get_events():
    """Get all marsquake events"""
    events = []
    for event in simulation_state["events"]:
        events.append({
            "id": f"M{len(events)+1:03d}",
            "timestamp": event["timestamp"].isoformat(),
            "magnitude": event["magnitude"],
            "latitude": event["latitude"],
            "longitude": event["longitude"],
            "depth_km": event["depth_km"],
            "type": event["type"],
            "p_wave_velocity": event["p_wave_velocity"],
            "s_wave_velocity": event["s_wave_velocity"]
        })
    return events

@app.get("/api/structures", response_model=List[StructureStatus])
async def get_structures():
    """Get current structure status"""
    structures = []
    
    # Habitat status
    habitat = simulation_state["habitat"]
    if habitat:
        structures.append({
            "name": "HABITAT-ALPHA",
            "location": list(habitat.location),
            "status": "NOMINAL" if habitat.damage_level < 0.1 else "WARNING",
            "health": (1 - habitat.damage_level) * 100,
            "damage_level": habitat.damage_level,
            "tipping_risk": 0.0
        })
    
    # Rover status
    rover = simulation_state["rover"]
    if rover:
        structures.append({
            "name": "ROVER-01",
            "location": list(rover.location),
            "status": "STABLE" if rover.tipping_risk < 0.3 else "CAUTION",
            "health": (1 - rover.tipping_risk) * 100,
            "damage_level": 0.0,
            "tipping_risk": rover.tipping_risk
        })
    
    # Add other monitoring stations
    structures.extend([
        {
            "name": "SEISMOMETER",
            "location": [45, 52],
            "status": "ACTIVE",
            "health": 100.0,
            "damage_level": 0.0,
            "tipping_risk": 0.0
        },
        {
            "name": "POWER-SYS",
            "location": [48, 48],
            "status": "NOMINAL",
            "health": 98.0,
            "damage_level": 0.02,
            "tipping_risk": 0.0
        },
        {
            "name": "COMMS-ARRAY",
            "location": [55, 55],
            "status": "NOMINAL",
            "health": 100.0,
            "damage_level": 0.0,
            "tipping_risk": 0.0
        }
    ])
    
    return structures

@app.get("/api/metrics", response_model=MetricsData)
async def get_metrics():
    """Get current simulation metrics"""
    env = simulation_state["environment"]
    current_sol = (datetime.now() - datetime(2025, 1, 1)).days
    
    return {
        "mars_sol": 1250 + current_sol,
        "gravity": env.gravity if env else config.MARS_GRAVITY,
        "temperature": env.temperature if env else config.MARS_SURFACE_TEMP,
        "pressure": env.pressure if env else config.MARS_ATMOSPHERIC_PRESSURE,
        "p_wave_velocity": config.P_WAVE_VELOCITY,
        "s_wave_velocity": config.S_WAVE_VELOCITY,
        "simulation_time": simulation_state["current_time"],
        "events_per_sol": 2.4,
        "snr": 24.3,
        "damping": config.SOIL_DAMPING_COEFFICIENT,
        "soil_rigidity": config.SOIL_RIGIDITY,
        "soil_density": config.SOIL_DENSITY
    }

@app.get("/api/logs", response_model=List[LogEntry])
async def get_logs(limit: int = 50):
    """Get system logs"""
    return simulation_state["logs"][-limit:]

@app.get("/api/simulation/status", response_model=SimulationStatus)
async def get_simulation_status():
    """Get current simulation status"""
    wave_sim = simulation_state["wave_sim"]
    max_amp = wave_sim.get_max_amplitude() if wave_sim else 0.0
    
    return {
        "active": simulation_state["simulation_active"],
        "current_time": simulation_state["current_time"],
        "current_event": simulation_state["current_event"],
        "max_amplitude": max_amp
    }

@app.post("/api/simulation/start")
async def start_simulation(event_index: int = 0):
    """Start simulation with specified event"""
    global simulation_state
    
    if event_index >= len(simulation_state["events"]):
        raise HTTPException(status_code=400, detail="Invalid event index")
    
    simulation_state["simulation_active"] = True
    simulation_state["current_event"] = simulation_state["events"][event_index]
    simulation_state["current_time"] = 0.0
    simulation_state["wave_sim"].reset()
    simulation_state["habitat"].reset()
    simulation_state["rover"].reset()
    
    add_log("EVENT", f"Simulation started - Magnitude {simulation_state['current_event']['magnitude']}")
    
    # Start async simulation loop
    asyncio.create_task(run_simulation())
    
    return {"status": "started", "event": simulation_state["current_event"]}

@app.post("/api/simulation/stop")
async def stop_simulation():
    """Stop current simulation"""
    global simulation_state
    simulation_state["simulation_active"] = False
    add_log("INFO", "Simulation stopped")
    return {"status": "stopped"}

@app.get("/api/simulation/wave-field", response_model=WaveFieldData)
async def get_wave_field():
    """Get current wave field data"""
    wave_sim = simulation_state["wave_sim"]
    if not wave_sim:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    # Convert numpy array to list and downsample for performance
    field = wave_sim.wave_field[::5, ::5].tolist()  # Downsample by 5
    
    return {
        "field": field,
        "max_amplitude": float(wave_sim.get_max_amplitude()),
        "epicenter": [50.0, 50.0],  # Default epicenter
        "time": simulation_state["current_time"]
    }

@app.get("/api/terrain/heightmap")
async def get_terrain_heightmap():
    """Get terrain height map data"""
    terrain = simulation_state["terrain"]
    if terrain is None:
        raise HTTPException(status_code=503, detail="Terrain not generated")
    
    # Downsample for performance
    downsampled = terrain[::2, ::2]
    
    return {
        "data": downsampled.tolist(),
        "size": downsampled.shape[0],
        "min": float(terrain.min()),
        "max": float(terrain.max()),
        "mean": float(terrain.mean())
    }

@app.get("/api/risk-map")
async def get_risk_map():
    """Get AI-generated risk map"""
    global simulation_state
    
    # Generate risk map if not exists
    if simulation_state["risk_map"] is None:
        predictor = RiskPredictor()
        X, y = predictor.generate_training_data(
            simulation_state["terrain"], 
            simulation_state["properties"],
            num_samples=1000
        )
        predictor.train(X, y)
        simulation_state["risk_map"] = predictor.predict_risk_map(
            simulation_state["terrain"],
            simulation_state["properties"]
        )
    
    # Downsample
    risk_map = simulation_state["risk_map"][::2, ::2]
    
    return {
        "data": risk_map.tolist(),
        "size": risk_map.shape[0],
        "safe_percentage": float(np.sum(risk_map == 0) / risk_map.size * 100),
        "moderate_percentage": float(np.sum(risk_map == 1) / risk_map.size * 100),
        "high_percentage": float(np.sum(risk_map == 2) / risk_map.size * 100)
    }

@app.get("/api/seismic/realtime")
async def get_seismic_data():
    """Get real-time seismic trace data"""
    time = simulation_state["current_time"]
    
    # Generate synthetic seismic data
    channels = []
    for i, (name, color) in enumerate([
        ("BHZ", "#00ffff"),
        ("BHN", "#ff00ff"),
        ("BHE", "#ffff00"),
        ("LHZ", "#00ff00")
    ]):
        # Generate waveform data
        data_points = []
        for t in np.linspace(time - 30, time + 30, 200):
            if t > 0:
                # P-wave
                amplitude = np.sin(t * 8 + i * 0.5) * np.exp(-t * 0.3) * 5
                # S-wave
                if t > 5:
                    amplitude += np.sin((t - 5) * 4 + i * 0.3) * np.exp(-(t - 5) * 0.2) * 8
                # Add noise
                amplitude += (np.random.random() - 0.5) * 0.5
            else:
                amplitude = (np.random.random() - 0.5) * 0.5
            
            data_points.append({
                "time": float(t),
                "amplitude": float(amplitude)
            })
        
        channels.append({
            "name": name,
            "color": color,
            "data": data_points
        })
    
    return {
        "channels": channels,
        "current_time": time,
        "p_arrival": 0.0 if time > 0 else None,
        "s_arrival": 5.0 if time > 5 else None
    }

# Background simulation task
async def run_simulation():
    """Run simulation in background"""
    global simulation_state
    
    while simulation_state["simulation_active"]:
        # Update simulation time
        simulation_state["current_time"] += 0.1
        
        # Update wave propagation
        if simulation_state["current_event"] and simulation_state["wave_sim"]:
            epicenter = (50, 50)  # Default epicenter
            magnitude = simulation_state["current_event"]["magnitude"]
            
            simulation_state["wave_sim"].simulate_wave_step(
                epicenter, 
                magnitude, 
                simulation_state["current_time"]
            )
            
            # Update structure responses
            habitat = simulation_state["habitat"]
            rover = simulation_state["rover"]
            
            if habitat:
                amp = simulation_state["wave_sim"].get_amplitude_at(*habitat.location)
                habitat.evaluate_safety(abs(amp))
            
            if rover:
                amp = simulation_state["wave_sim"].get_amplitude_at(*rover.location)
                rover.evaluate_safety(abs(amp), terrain_slope=5)
            
            # Add periodic log entries
            if int(simulation_state["current_time"]) % 5 == 0:
                max_amp = simulation_state["wave_sim"].get_max_amplitude()
                add_log("INFO", f"Wave amplitude: {max_amp:.2f} mm/s")
        
        # Stop after 60 seconds
        if simulation_state["current_time"] > 60:
            simulation_state["simulation_active"] = False
            add_log("INFO", "Simulation completed")
        
        await asyncio.sleep(0.1)  # 100ms update rate

# WebSocket endpoint for real-time updates with improved error handling
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates with better error handling"""
    await websocket.accept()
    connected_clients.add(websocket)
    add_log("INFO", f"WebSocket client connected. Total clients: {len(connected_clients)}")
    
    try:
        while True:
            # Send updates every 100ms
            if simulation_state["simulation_active"]:
                data = {
                    "type": "update",
                    "time": simulation_state["current_time"],
                    "max_amplitude": simulation_state["wave_sim"].get_max_amplitude() if simulation_state["wave_sim"] else 0,
                    "structures": await get_structures(),
                    "logs": simulation_state["logs"][-5:]  # Last 5 logs
                }
                
                try:
                    await websocket.send_json(data)
                except Exception as send_error:
                    print(f"Error sending WebSocket message: {send_error}")
                    break
            
            # Small delay to prevent overwhelming the connection
            await asyncio.sleep(0.1)
            
    except WebSocketDisconnect:
        print("WebSocket client disconnected normally")
        add_log("INFO", "WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        add_log("ERROR", f"WebSocket error: {e}")
    finally:
        # Remove client from connected set
        connected_clients.discard(websocket)
        add_log("INFO", f"WebSocket client removed. Total clients: {len(connected_clients)}")
        
        # Only attempt to close if the connection is still open
        try:
            if hasattr(websocket, 'client_state') and websocket.client_state.value == 1:  # CONNECTED state
                await websocket.close()
        except Exception:
            # Connection already closed or in error state, ignore
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")