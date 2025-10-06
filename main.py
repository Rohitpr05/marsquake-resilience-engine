# -*- coding: utf-8 -*-
"""
Marsquake Simulator - Main Program
Backend-first implementation with terminal output
"""
import numpy as np
import config
from src.data_pipeline.marsquake_generator import MarsquakeGenerator
from src.data_pipeline.terrain_generator import TerrainGenerator
from src.physics.wave_propagation import WavePropagation
from src.physics.mars_environment import MarsEnvironment
from src.structures.habitat_model import HabitatModel
from src.structures.rover_model import RoverModel
from src.visualization.terminal_viz import TerminalVisualizer

def main():
    """Main simulation program"""
    print("\n" + "="*80)
    print("MARSQUAKE SIMULATOR & HABITAT RESILIENCE LAB".center(80))
    print("Backend Terminal Version".center(80))
    print("="*80 + "\n")
    
    # Initialize components
    print("[*] Initializing simulation components...\n")
    
    # 1. Generate marsquake data
    print("1. Generating Marsquake Data...")
    quake_gen = MarsquakeGenerator(seed=42)
    events = quake_gen.generate_sequence(num_events=10, days_span=30)
    print(quake_gen.get_summary())
    quake_gen.save_to_csv()
    
    # 2. Generate terrain
    print("\n2. Generating Martian Terrain...")
    terrain_gen = TerrainGenerator(size=100, resolution=10, seed=42)
    terrain = terrain_gen.generate_height_map()
    properties = terrain_gen.calculate_soil_properties()
    terrain_gen.print_terrain_stats()
    terrain_gen.save_terrain()
    
    # 3. Initialize physics
    print("\n3. Initializing Mars Environment...")
    env = MarsEnvironment()
    print(env.get_environmental_summary())
    
    # 4. Set up structures
    print("\n4. Placing Structures...")
    habitat = HabitatModel(location=(50, 50))
    rover = RoverModel(location=(60, 60))
    print("[OK] Habitat placed at (50, 50)")
    print("[OK] Rover placed at (60, 60)")
    
    # 5. Run simulation
    print("\n" + "="*80)
    print("RUNNING MARSQUAKE SIMULATION".center(80))
    print("="*80 + "\n")
    
    # Select a test event
    test_event = events[0]  # Use first generated event
    print(f"Simulating Marsquake Event:")
    print(f"  Magnitude: {test_event['magnitude']}")
    print(f"  Depth: {test_event['depth_km']:.1f} km")
    print(f"  Type: {test_event['type'].upper()}\n")
    
    # Initialize wave propagation
    wave_sim = WavePropagation(terrain, properties)
    viz = TerminalVisualizer()
    
    # Epicenter at center
    epicenter = (50, 50)
    
    # Simulate over time
    time_steps = np.arange(0, 31, 5)
    
    for t in time_steps:
        print(f"\n[TIME: {t} seconds]")
        print("-" * 80)
        
        # Update wave propagation
        wave_sim.simulate_wave_step(epicenter, test_event['magnitude'], t)
        
        # Get wave amplitude at structure locations
        habitat_amp = wave_sim.get_amplitude_at(*habitat.location)
        rover_amp = wave_sim.get_amplitude_at(*rover.location)
        
        # Evaluate structure responses
        habitat_safety = habitat.evaluate_safety(abs(habitat_amp))
        rover_safety = rover.evaluate_safety(abs(rover_amp), terrain_slope=5)
        
        # Display results
        print(f"Habitat - Amplitude: {abs(habitat_amp):.3f} mm | Status: {habitat_safety['status']}")
        print(f"Rover   - Amplitude: {abs(rover_amp):.3f} mm | Status: {rover_safety['status']}")
        
        # Visualize wave field every 10 seconds
        if t % 10 == 0:
            viz.visualize_wave_field(wave_sim.wave_field, f"Wave Field at T={t}s")
    
    # Final status report
    print("\n" + "="*80)
    print("FINAL STATUS REPORT".center(80))
    print("="*80 + "\n")
    
    viz.show_structure_status([habitat, rover])
    
    print(habitat.get_summary())
    
    # Recommendations
    print("\n" + "="*80)
    print("RECOMMENDATIONS".center(80))
    print("="*80)
    print(f"\n[HABITAT] {habitat_safety['recommendation']}")
    print(f"[ROVER] {rover_safety['recommendation']}")
    
    print("\n" + "="*80)
    print("SIMULATION COMPLETE".center(80))
    print("="*80 + "\n")
    
    print("Output files saved:")
    print("  - data/synthetic/marsquakes.csv")
    print("  - data/synthetic/terrain.npy")
    print("\n[OK] All systems operational!\n")


if __name__ == "__main__":
    main()