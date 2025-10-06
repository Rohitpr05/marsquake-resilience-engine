# -*- coding: utf-8 -*-
"""
Martian Terrain Generator using Perlin Noise
Creates realistic height maps and terrain properties
"""
import numpy as np
from perlin_noise import PerlinNoise
import config

class TerrainGenerator:
    def __init__(self, size=100, resolution=10, seed=42):
        """
        Initialize terrain generator
        
        Args:
            size: Grid size (size x size)
            resolution: Meters per grid cell
            seed: Random seed for reproducibility
        """
        self.size = size
        self.resolution = resolution
        self.seed = seed
        self.terrain = None
        self.properties = None
    
    def generate_height_map(self):
        """Generate terrain height map using Perlin noise"""
        print("Generating {0}x{0} terrain grid...".format(self.size))
        
        terrain = np.zeros((self.size, self.size))
        
        # Create Perlin noise generator
        noise = PerlinNoise(octaves=config.TERRAIN_OCTAVES, seed=self.seed)
        
        for i in range(self.size):
            for j in range(self.size):
                # Generate noise value
                terrain[i][j] = noise([i * config.TERRAIN_NOISE_SCALE, 
                                      j * config.TERRAIN_NOISE_SCALE])
        
        # Normalize to 0-1 range, then scale to realistic heights
        terrain = (terrain - terrain.min()) / (terrain.max() - terrain.min())
        terrain = terrain * 1000  # Scale to 0-1000 meters elevation
        
        self.terrain = terrain
        print("Terrain height map generated")
        return terrain
    
    def calculate_soil_properties(self):
        """Calculate soil rigidity and density variations based on terrain"""
        if self.terrain is None:
            self.generate_height_map()
        
        # Higher elevation = more compacted soil (higher rigidity)
        # This is a simplified model
        elevation_factor = self.terrain / self.terrain.max()
        
        rigidity = config.SOIL_RIGIDITY * (0.8 + 0.4 * elevation_factor)
        density = config.SOIL_DENSITY * (0.9 + 0.2 * elevation_factor)
        
        self.properties = {
            'rigidity': rigidity,
            'density': density,
            'elevation': self.terrain
        }
        
        print("Soil properties calculated")
        return self.properties
    
    def get_terrain_at(self, x, y):
        """Get terrain properties at specific coordinates"""
        if self.terrain is None:
            raise ValueError("Terrain not generated yet. Call generate_height_map() first.")
        
        # Ensure coordinates are within bounds
        x = np.clip(int(x), 0, self.size - 1)
        y = np.clip(int(y), 0, self.size - 1)
        
        return {
            'elevation': self.terrain[x, y],
            'rigidity': self.properties['rigidity'][x, y],
            'density': self.properties['density'][x, y]
        }
    
    def print_terrain_stats(self):
        """Print terrain statistics"""
        if self.terrain is None:
            print("No terrain generated yet.")
            return
        
        stats = """
        ==========================================
        TERRAIN GENERATION SUMMARY
        ==========================================
        Grid Size: {0} x {0}
        Resolution: {1} m/cell
        Total Area: {2:.2f} km²
        
        Elevation Stats:
        - Min: {3:.2f} m
        - Max: {4:.2f} m
        - Mean: {5:.2f} m
        - Std Dev: {6:.2f} m
        
        Soil Properties:
        - Rigidity Range: {7:.2e} - {8:.2e} Pa
        - Density Range: {9:.1f} - {10:.1f} kg/m³
        ==========================================
        """.format(
            self.size,
            self.resolution,
            (self.size * self.resolution / 1000)**2,
            self.terrain.min(),
            self.terrain.max(),
            self.terrain.mean(),
            self.terrain.std(),
            self.properties['rigidity'].min(),
            self.properties['rigidity'].max(),
            self.properties['density'].min(),
            self.properties['density'].max()
        )
        print(stats)
    
    def save_terrain(self, filename='data/synthetic/terrain.npy'):
        """Save terrain data to file"""
        if self.terrain is None:
            print("No terrain to save. Generate terrain first.")
            return
        
        np.save(filename, {
            'terrain': self.terrain,
            'properties': self.properties,
            'metadata': {
                'size': self.size,
                'resolution': self.resolution,
                'seed': self.seed
            }
        })
        print("Terrain saved to {0}".format(filename))


if __name__ == "__main__":
    # Test terrain generator
    print("Testing Terrain Generator...\n")
    
    terrain_gen = TerrainGenerator(size=100, resolution=10)
    terrain_gen.generate_height_map()
    terrain_gen.calculate_soil_properties()
    terrain_gen.print_terrain_stats()
    
    # Test specific location
    print("\nSample location (50, 50):")
    props = terrain_gen.get_terrain_at(50, 50)
    print("Elevation: {0:.2f} m".format(props['elevation']))
    print("Rigidity: {0:.2e} Pa".format(props['rigidity']))
    print("Density: {0:.1f} kg/m³".format(props['density']))
    
    terrain_gen.save_terrain()