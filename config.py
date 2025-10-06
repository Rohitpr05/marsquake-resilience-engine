"""
Configuration file for Marsquake Simulator
Contains all physical constants and simulation parameters
"""

# ============= MARS PHYSICAL CONSTANTS =============
MARS_GRAVITY = 3.71  # m/s^2
MARS_RADIUS = 3389.5  # km
MARS_SURFACE_TEMP = -63  # °C (average)
MARS_ATMOSPHERIC_PRESSURE = 600  # Pa (average)

# ============= MARSQUAKE PARAMETERS =============
# Based on InSight mission data
MARSQUAKE_MAGNITUDES = {
    'minor': (2.0, 3.0),      # Magnitude range
    'moderate': (3.0, 4.0),
    'major': (4.0, 5.0)
}

MARSQUAKE_FREQUENCY = {
    'daily_probability': 0.15,  # 15% chance per day
    'avg_per_month': 20,
    'max_magnitude_observed': 5.0
}

# Wave velocities (m/s) - estimated from seismic studies
P_WAVE_VELOCITY = 3000  # Primary waves
S_WAVE_VELOCITY = 1500  # Secondary waves

# ============= TERRAIN PARAMETERS =============
TERRAIN_GRID_SIZE = 100  # 100x100 grid
TERRAIN_RESOLUTION = 10  # meters per grid cell
TERRAIN_NOISE_SCALE = 0.1  # Perlin noise scale
TERRAIN_OCTAVES = 6  # Detail level

# Soil properties
SOIL_DENSITY = 1500  # kg/m^3 (Martian regolith)
SOIL_RIGIDITY = 1e8  # Pa (Pascals)
SOIL_DAMPING_COEFFICIENT = 0.05  # Energy absorption

# ============= STRUCTURE PARAMETERS =============
# Habitat specifications
HABITAT_MASS = 50000  # kg
HABITAT_HEIGHT = 10  # meters
HABITAT_WIDTH = 20  # meters
HABITAT_MATERIAL_STRENGTH = 5e8  # Pa
HABITAT_NATURAL_FREQUENCY = 2.0  # Hz

# Rover specifications
ROVER_MASS = 900  # kg (Perseverance-like)
ROVER_WHEELBASE = 2.7  # meters
ROVER_MATERIAL_STRENGTH = 3e8  # Pa

# ============= SIMULATION PARAMETERS =============
TIME_STEP = 0.01  # seconds
SIMULATION_DURATION = 60  # seconds
GRID_SPACING = 10  # meters

# ============= AI/ML PARAMETERS =============
RISK_THRESHOLD = 0.7  # 70% probability threshold
TRAINING_DATA_SIZE = 1000
VALIDATION_SPLIT = 0.2

# ============= OUTPUT SETTINGS =============
VERBOSE_OUTPUT = True
SAVE_PLOTS = True
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR