"""
Martian Terrain Generator using Perlin Noise
Creates realistic height maps and terrain properties
"""
import numpy as np
from noise import pnoise2
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
        print(f"Generating {self.size}x{self.size} terrain grid...")
        
        terrain = np.zeros((self.size, self.size))
        
        for i in range(self.size):
            for j in range(self.size):
                # Multi-octave Perlin noise for realistic terrain
                terrain[i][j] = pnoise2(
                    i * config.TERRAIN_NOISE_SCALE,
                    j * config.TERRAIN_NOISE_SCALE,
                    octaves=config.TERRAIN_OCTAVES,
                    persistence=0.5,
                    lacunarity=2.0,
                    base=self.seed
                )
        
        # Normalize to 0-1 range, then scale to realistic heights
        terrain = (terrain - terrain.min()) / (terrain.max() - terrain.min())
        terrain = terrain * 1000  # Scale to 0-1000 meters elevation
        
        self.terrain = terrain
        print("✓ Terrain height map generated")
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
        
        print("✓ Soil properties calculated")
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
        
        stats = f"""
        ==========================================
        TERRAIN GENERATION SUMMARY
        ==========================================
        Grid Size: {self.size} x {self.size}
        Resolution: {self.resolution} m/cell
        Total Area: {(self.size * self.resolution / 1000):.2f} km²
        
        Elevation Stats:
        - Min: {self.terrain.min():.2f} m
        - Max: {self.terrain.max():.2f} m
        - Mean: {self.terrain.mean():.2f} m
        - Std Dev: {self.terrain.std():.2f} m
        
        Soil Properties:
        - Rigidity Range: {self.properties['rigidity'].min():.2e} - {self.properties['rigidity'].max():.2e} Pa
        - Density Range: {self.properties['density'].min():.1f} - {self.properties['density'].max():.1f} kg/m³
        ==========================================
        """
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
        print(f"✓ Terrain saved to {filename}")


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
    print(f"Elevation: {props['elevation']:.2f} m")
    print(f"Rigidity: {props['rigidity']:.2e} Pa")
    print(f"Density: {props['density']:.1f} kg/m³")
    
    terrain_gen.save_terrain()