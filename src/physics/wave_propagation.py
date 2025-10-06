"""
Seismic Wave Propagation Simulation
Models how P-waves and S-waves travel through Martian terrain
"""
import numpy as np
import config
from scipy.ndimage import gaussian_filter

class WavePropagation:
    def __init__(self, terrain_grid, terrain_properties):
        """
        Initialize wave propagation simulator
        
        Args:
            terrain_grid: 2D array of terrain elevations
            terrain_properties: Dictionary with rigidity and density
        """
        self.terrain = terrain_grid
        self.properties = terrain_properties
        self.size = terrain_grid.shape[0]
        
        # Wave field (amplitude at each grid point)
        self.wave_field = np.zeros_like(terrain_grid)
        self.time = 0
    
    def calculate_arrival_time(self, epicenter, target, wave_type='p'):
        """
        Calculate wave arrival time from epicenter to target
        
        Args:
            epicenter: (x, y) coordinates of quake epicenter
            target: (x, y) coordinates of target location
            wave_type: 'p' or 's' wave
        
        Returns:
            Arrival time in seconds
        """
        # Calculate distance
        dx = (target[0] - epicenter[0]) * config.GRID_SPACING
        dy = (target[1] - epicenter[1]) * config.GRID_SPACING
        distance = np.sqrt(dx**2 + dy**2)
        
        # Select wave velocity
        velocity = config.P_WAVE_VELOCITY if wave_type == 'p' else config.S_WAVE_VELOCITY
        
        # Time = distance / velocity
        arrival_time = distance / velocity
        
        return arrival_time
    
    def simulate_wave_step(self, epicenter, magnitude, current_time):
        """
        Simulate one time step of wave propagation
        
        Args:
            epicenter: (x, y) epicenter coordinates
            magnitude: Quake magnitude
            current_time: Current simulation time
        """
        # Calculate wave amplitude based on magnitude (Richter scale)
        # Amplitude increases exponentially with magnitude
        base_amplitude = 10 ** (magnitude - 3)  # Ground motion in mm
        
        for i in range(self.size):
            for j in range(self.size):
                # Calculate distance from epicenter
                dx = (i - epicenter[0]) * config.GRID_SPACING
                dy = (j - epicenter[1]) * config.GRID_SPACING
                distance = np.sqrt(dx**2 + dy**2)
                
                # Skip epicenter itself
                if distance < config.GRID_SPACING:
                    continue
                
                # Calculate arrival time for P-wave
                arrival_time = distance / config.P_WAVE_VELOCITY
                
                # Check if wave has arrived
                if current_time >= arrival_time:
                    # Calculate amplitude with distance decay
                    # Geometric spreading: amplitude ~ 1/distance
                    amplitude = base_amplitude / max(distance, 1.0)
                    
                    # Apply material damping
                    damping = np.exp(-config.SOIL_DAMPING_COEFFICIENT * distance / 1000)
                    amplitude *= damping
                    
                    # Time-dependent wave shape (simplified Ricker wavelet)
                    time_since_arrival = current_time - arrival_time
                    freq = 1.0  # 1 Hz dominant frequency
                    wave_shape = (1 - 2 * (np.pi * freq * time_since_arrival)**2) * \
                                 np.exp(-(np.pi * freq * time_since_arrival)**2)
                    
                    self.wave_field[i, j] = amplitude * wave_shape
        
        # Apply smoothing to simulate wave diffusion
        self.wave_field = gaussian_filter(self.wave_field, sigma=0.5)
        self.time = current_time
    
    def get_amplitude_at(self, x, y):
        """Get wave amplitude at specific location"""
        x = np.clip(int(x), 0, self.size - 1)
        y = np.clip(int(y), 0, self.size - 1)
        return self.wave_field[x, y]
    
    def get_max_amplitude(self):
        """Get maximum amplitude in current wave field"""
        return np.max(np.abs(self.wave_field))
    
    def reset(self):
        """Reset wave field"""
        self.wave_field = np.zeros_like(self.terrain)
        self.time = 0


if __name__ == "__main__":
    from src.data_pipeline.terrain_generator import TerrainGenerator
    
    print("Testing Wave Propagation...\n")
    
    # Generate terrain
    terrain_gen = TerrainGenerator(size=50)
    terrain = terrain_gen.generate_height_map()
    properties = terrain_gen.calculate_soil_properties()
    
    # Initialize wave propagation
    wave_sim = WavePropagation(terrain, properties)
    
    # Simulate marsquake at center
    epicenter = (25, 25)
    magnitude = 4.5
    
    print(f"Simulating magnitude {magnitude} marsquake at {epicenter}")
    print("Wave propagation over time:\n")
    
    # Simulate for several time steps
    for t in np.arange(0, 30, 5):
        wave_sim.simulate_wave_step(epicenter, magnitude, t)
        max_amp = wave_sim.get_max_amplitude()
        print(f"Time: {t:4.1f}s | Max Amplitude: {max_amp:.4f} mm")
    
    print("\n✓ Wave propagation test complete")