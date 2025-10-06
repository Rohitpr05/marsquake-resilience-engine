"""
Habitat Structure Model
Analyzes structural response to seismic forces
"""
import numpy as np
import config

class HabitatModel:
    def __init__(self, location, custom_params=None):
        """
        Initialize habitat model
        
        Args:
            location: (x, y) grid coordinates
            custom_params: Optional dictionary to override default parameters
        """
        self.location = location
        
        # Default parameters from config
        self.mass = config.HABITAT_MASS
        self.height = config.HABITAT_HEIGHT
        self.width = config.HABITAT_WIDTH
        self.strength = config.HABITAT_MATERIAL_STRENGTH
        self.natural_freq = config.HABITAT_NATURAL_FREQUENCY
        
        # Override with custom parameters if provided
        if custom_params:
            for key, value in custom_params.items():
                setattr(self, key, value)
        
        # Structural health
        self.damage_level = 0.0  # 0 = intact, 1 = total failure
        self.max_displacement = 0.0
        self.stress_history = []
    
    def calculate_response(self, ground_acceleration):
        """
        Calculate structural response to ground motion
        
        Args:
            ground_acceleration: Ground acceleration in m/s²
        
        Returns:
            Dictionary with response parameters
        """
        # Single-degree-of-freedom (SDOF) approximation
        # Natural frequency
        omega_n = 2 * np.pi * self.natural_freq
        
        # Damping ratio (typical for Mars habitat: 2-5%)
        damping_ratio = 0.03
        
        # Dynamic amplification factor
        # For simplicity, using peak response
        beta = 1.0 / self.natural_freq  # Frequency ratio approximation
        
        # Amplification factor
        amp_factor = 1.0 / np.sqrt((1 - beta**2)**2 + (2 * damping_ratio * beta)**2)
        amp_factor = min(amp_factor, 5.0)  # Cap at 5 for stability
        
        # Structural displacement
        displacement = (ground_acceleration / omega_n**2) * amp_factor
        
        # Update max displacement
        self.max_displacement = max(self.max_displacement, abs(displacement))
        
        # Calculate stress (simplified)
        # Stress = Force / Area
        # Force = mass * acceleration
        force = self.mass * abs(ground_acceleration) * amp_factor
        
        # Approximate cross-sectional area
        area = self.width * self.width  # Assuming square base
        
        stress = force / area
        self.stress_history.append(stress)
        
        # Calculate damage
        # Damage occurs when stress exceeds material strength
        stress_ratio = stress / self.strength
        
        if stress_ratio > 0.5:  # Damage threshold at 50% of strength
            damage_increment = (stress_ratio - 0.5) * 0.1
            self.damage_level = min(1.0, self.damage_level + damage_increment)
        
        return {
            'displacement': displacement,
            'stress': stress,
            'stress_ratio': stress_ratio,
            'amplification_factor': amp_factor,
            'damage_level': self.damage_level
        }
    
    def evaluate_safety(self, wave_amplitude):
        """
        Evaluate structural safety given wave amplitude
        
        Args:
            wave_amplitude: Ground motion amplitude in mm
        
        Returns:
            Safety rating and status
        """
        # Convert amplitude to acceleration (simplified)
        # a = (2πf)² * A
        frequency = 1.0  # 1 Hz typical marsquake frequency
        acceleration = (2 * np.pi * frequency)**2 * (wave_amplitude / 1000)  # Convert mm to m
        
        response = self.calculate_response(acceleration)
        
        # Safety thresholds
        if self.damage_level < 0.1:
            status = "SAFE"
            color = "green"
        elif self.damage_level < 0.3:
            status = "MONITOR"
            color = "yellow"
        elif self.damage_level < 0.7:
            status = "WARNING"
            color = "orange"
        else:
            status = "CRITICAL"
            color = "red"
        
        return {
            'status': status,
            'safety_rating': 1.0 - self.damage_level,
            'max_displacement': self.max_displacement * 1000,  # Convert to mm
            'peak_stress': max(self.stress_history) if self.stress_history else 0,
            'recommendation': self._get_recommendation(status)
        }
    
    def _get_recommendation(self, status):
        """Get safety recommendation based on status"""
        recommendations = {
            'SAFE': 'Structure is stable. Continue normal operations.',
            'MONITOR': 'Minor stress detected. Monitor for further activity.',
            'WARNING': 'Significant stress. Inspect structure and prepare contingencies.',
            'CRITICAL': 'Structural integrity compromised. Evacuate and assess damage.'
        }
        return recommendations.get(status, 'Unknown status')
    
    def reset(self):
        """Reset structural health for new simulation"""
        self.damage_level = 0.0
        self.max_displacement = 0.0
        self.stress_history = []
    
    def get_summary(self):
        """Get habitat summary"""
        summary = f"""
        ==========================================
        HABITAT STRUCTURAL SUMMARY
        ==========================================
        Location: {self.location}
        Mass: {self.mass} kg
        Dimensions: {self.width}m x {self.width}m x {self.height}m
        Natural Frequency: {self.natural_freq} Hz
        Material Strength: {self.strength:.2e} Pa
        
        Current Status:
        - Damage Level: {self.damage_level*100:.1f}%
        - Max Displacement: {self.max_displacement*1000:.2f} mm
        - Peak Stress: {max(self.stress_history) if self.stress_history else 0:.2e} Pa
        ==========================================
        """
        return summary


if __name__ == "__main__":
    print("Testing Habitat Model...\n")
    
    # Create habitat at location
    habitat = HabitatModel(location=(50, 50))
    
    print("Initial Habitat Configuration:")
    print(habitat.get_summary())
    
    # Simulate response to different ground motions
    print("\nSimulating seismic response:")
    test_amplitudes = [1.0, 5.0, 10.0, 20.0, 50.0]  # mm
    
    for amp in test_amplitudes:
        habitat.reset()
        safety = habitat.evaluate_safety(amp)
        print(f"\nGround Motion: {amp} mm")
        print(f"Status: {safety['status']}")
        print(f"Safety Rating: {safety['safety_rating']*100:.1f}%")
        print(f"Max Displacement: {safety['max_displacement']:.2f} mm")
        print(f"Recommendation: {safety['recommendation']}")