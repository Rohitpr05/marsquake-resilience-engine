"""
Mars Environmental Conditions
Temperature, pressure, and atmospheric effects
"""
import numpy as np
import config

class MarsEnvironment:
    def __init__(self):
        """Initialize Mars environment parameters"""
        self.gravity = config.MARS_GRAVITY
        self.temperature = config.MARS_SURFACE_TEMP
        self.pressure = config.MARS_ATMOSPHERIC_PRESSURE
    
    def get_temperature_at_depth(self, depth_km):
        """
        Calculate temperature at given depth below surface
        
        Args:
            depth_km: Depth in kilometers
        
        Returns:
            Temperature in Celsius
        """
        # Approximate geothermal gradient: ~10-20°C per km
        gradient = 15  # °C/km
        temp = self.temperature + (gradient * depth_km)
        return temp
    
    def calculate_wave_attenuation(self, distance_km, frequency=1.0):
        """
        Calculate seismic wave attenuation over distance
        
        Args:
            distance_km: Distance traveled in km
            frequency: Wave frequency in Hz
        
        Returns:
            Attenuation factor (0-1)
        """
        # Simplified attenuation model
        # Q factor (quality factor) for Mars ~200-400
        Q = 300
        
        # Attenuation coefficient
        alpha = (np.pi * frequency) / (Q * config.P_WAVE_VELOCITY / 1000)
        
        # Exponential decay
        attenuation = np.exp(-alpha * distance_km)
        
        return attenuation
    
    def get_environmental_summary(self):
        """Get summary of environmental conditions"""
        summary = f"""
        ==========================================
        MARS ENVIRONMENT PARAMETERS
        ==========================================
        Gravity: {self.gravity} m/s²
        Surface Temperature: {self.temperature}°C
        Atmospheric Pressure: {self.pressure} Pa
        
        Wave Properties:
        - P-Wave Velocity: {config.P_WAVE_VELOCITY} m/s
        - S-Wave Velocity: {config.S_WAVE_VELOCITY} m/s
        - Soil Damping: {config.SOIL_DAMPING_COEFFICIENT}
        ==========================================
        """
        return summary


if __name__ == "__main__":
    env = MarsEnvironment()
    print(env.get_environmental_summary())
    
    # Test temperature at depth
    print("\nTemperature Profile:")
    for depth in [0, 10, 20, 30, 40, 50]:
        temp = env.get_temperature_at_depth(depth)
        print(f"Depth {depth} km: {temp:.1f}°C")
    
    # Test wave attenuation
    print("\nWave Attenuation:")
    for dist in [10, 50, 100, 200, 500]:
        atten = env.calculate_wave_attenuation(dist)
        print(f"Distance {dist} km: {atten*100:.2f}% amplitude")