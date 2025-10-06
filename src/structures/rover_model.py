"""
Rover Structure Model
Simpler than habitat - focuses on mobility and tipping
"""
import numpy as np
import config

class RoverModel:
    def __init__(self, location):
        """Initialize rover model"""
        self.location = location
        self.mass = config.ROVER_MASS
        self.wheelbase = config.ROVER_WHEELBASE
        self.strength = config.ROVER_MATERIAL_STRENGTH
        
        # Rover-specific concerns
        self.tipping_risk = 0.0
        self.damage_level = 0.0
        self.max_tilt_angle = 0.0
    
    def calculate_tipping_risk(self, ground_acceleration, terrain_slope=0):
        """
        Calculate risk of rover tipping over
        
        Args:
            ground_acceleration: Ground acceleration in m/s²
            terrain_slope: Terrain slope in degrees
        
        Returns:
            Tipping risk (0-1)
        """
        # Critical tipping angle depends on center of gravity
        # Assuming CoG at 0.8m height, wheelbase 2.7m
        cog_height = 0.8
        critical_angle = np.arctan(self.wheelbase / (2 * cog_height))
        critical_angle_deg = np.degrees(critical_angle)
        
        # Calculate effective tilt from ground motion
        # Simplified: lateral acceleration causes apparent tilt
        accel_tilt = np.arctan(ground_acceleration / config.MARS_GRAVITY)
        accel_tilt_deg = np.degrees(accel_tilt)
        
        # Combined tilt
        total_tilt = abs(terrain_slope) + abs(accel_tilt_deg)
        self.max_tilt_angle = max(self.max_tilt_angle, total_tilt)
        
        # Tipping risk
        risk = total_tilt / critical_angle_deg
        self.tipping_risk = min(1.0, risk)
        
        return self.tipping_risk
    
    def evaluate_safety(self, wave_amplitude, terrain_slope=0):
        """
        Evaluate rover safety
        
        Args:
            wave_amplitude: Ground motion in mm
            terrain_slope: Local terrain slope in degrees
        """
        # Convert to acceleration
        frequency = 1.0
        acceleration = (2 * np.pi * frequency)**2 * (wave_amplitude / 1000)
        
        # Calculate tipping risk
        tipping = self.calculate_tipping_risk(acceleration, terrain_slope)
        
        # Determine status
        if tipping < 0.3:
            status = "STABLE"
        elif tipping < 0.6:
            status = "CAUTION"
        else:
            status = "UNSTABLE"
        
        return {
            'status': status,
            'tipping_risk': tipping * 100,
            'max_tilt': self.max_tilt_angle,
            'recommendation': self._get_recommendation(status)
        }
    
    def _get_recommendation(self, status):
        """Get recommendation based on status"""
        recommendations = {
            'STABLE': 'Rover is stable. Safe to continue operations.',
            'CAUTION': 'Elevated tipping risk. Reduce speed and avoid slopes.',
            'UNSTABLE': 'High tipping risk. Stop immediately and stabilize.'
        }
        return recommendations.get(status, 'Unknown')
    
    def reset(self):
        """Reset rover state"""
        self.tipping_risk = 0.0
        self.damage_level = 0.0
        self.max_tilt_angle = 0.0


if __name__ == "__main__":
    print("Testing Rover Model...\n")
    
    rover = RoverModel(location=(30, 30))
    
    print("Rover Specifications:")
    print(f"Mass: {rover.mass} kg")
    print(f"Wheelbase: {rover.wheelbase} m")
    
    print("\nTipping Risk Analysis:")
    test_scenarios = [
        (5.0, 0),    # 5mm motion, flat terrain
        (10.0, 5),   # 10mm motion, 5° slope
        (20.0, 10),  # 20mm motion, 10° slope
        (50.0, 15),  # 50mm motion, 15° slope
    ]
    
    for amp, slope in test_scenarios:
        rover.reset()
        result = rover.evaluate_safety(amp, slope)
        print(f"\nMotion: {amp}mm, Slope: {slope}°")
        print(f"Status: {result['status']}")
        print(f"Tipping Risk: {result['tipping_risk']:.1f}%")
        print(f"Max Tilt: {result['max_tilt']:.1f}°")