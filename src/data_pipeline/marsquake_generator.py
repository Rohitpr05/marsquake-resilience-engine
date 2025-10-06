"""
Synthetic Marsquake Data Generator
Based on InSight mission statistical patterns
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import config

class MarsquakeGenerator:
    def __init__(self, seed=42):
        """Initialize marsquake generator with random seed"""
        np.random.seed(seed)
        self.events = []
    
    def generate_magnitude(self, quake_type='minor'):
        """Generate magnitude based on quake type"""
        min_mag, max_mag = config.MARSQUAKE_MAGNITUDES[quake_type]
        # Use exponential distribution for more realistic magnitude
        magnitude = np.random.uniform(min_mag, max_mag)
        return round(magnitude, 2)
    
    def generate_epicenter(self):
        """Generate random epicenter location on Mars surface"""
        # Latitude: -90 to 90
        # Longitude: -180 to 180
        lat = np.random.uniform(-90, 90)
        lon = np.random.uniform(-180, 180)
        depth = np.random.uniform(10, 50)  # km below surface
        return lat, lon, depth
    
    def generate_event(self, magnitude=None, quake_type='minor'):
        """Generate a single marsquake event"""
        if magnitude is None:
            magnitude = self.generate_magnitude(quake_type)
        
        lat, lon, depth = self.generate_epicenter()
        
        event = {
            'timestamp': datetime.now(),
            'magnitude': magnitude,
            'latitude': lat,
            'longitude': lon,
            'depth_km': depth,
            'p_wave_velocity': config.P_WAVE_VELOCITY,
            's_wave_velocity': config.S_WAVE_VELOCITY,
            'type': quake_type
        }
        
        self.events.append(event)
        return event
    
    def generate_sequence(self, num_events=10, days_span=30):
        """Generate a sequence of marsquake events over time"""
        events = []
        start_date = datetime.now()
        
        for i in range(num_events):
            # Random time offset
            day_offset = np.random.uniform(0, days_span)
            event_time = start_date + timedelta(days=day_offset)
            
            # Determine quake type based on probability
            rand = np.random.random()
            if rand < 0.7:
                quake_type = 'minor'
            elif rand < 0.95:
                quake_type = 'moderate'
            else:
                quake_type = 'major'
            
            event = self.generate_event(quake_type=quake_type)
            event['timestamp'] = event_time
            events.append(event)
        
        # Sort by timestamp
        events.sort(key=lambda x: x['timestamp'])
        self.events = events
        return events
    
    def save_to_csv(self, filename='data/synthetic/marsquakes.csv'):
        """Save generated events to CSV"""
        if not self.events:
            print("No events to save. Generate events first.")
            return
        
        df = pd.DataFrame(self.events)
        df.to_csv(filename, index=False)
        print(f"✓ Saved {len(self.events)} marsquake events to {filename}")
        return df
    
    def get_summary(self):
        """Get statistical summary of generated events"""
        if not self.events:
            return "No events generated yet."
        
        df = pd.DataFrame(self.events)
        summary = f"""
        ==========================================
        MARSQUAKE GENERATION SUMMARY
        ==========================================
        Total Events: {len(self.events)}
        Magnitude Range: {df['magnitude'].min():.2f} - {df['magnitude'].max():.2f}
        Average Magnitude: {df['magnitude'].mean():.2f}
        
        Event Types:
        - Minor: {len(df[df['type'] == 'minor'])}
        - Moderate: {len(df[df['type'] == 'moderate'])}
        - Major: {len(df[df['type'] == 'major'])}
        
        Depth Range: {df['depth_km'].min():.1f} - {df['depth_km'].max():.1f} km
        ==========================================
        """
        return summary


if __name__ == "__main__":
    # Test the generator
    print("Testing Marsquake Generator...\n")
    
    generator = MarsquakeGenerator()
    
    # Generate single event
    print("Generating single event:")
    event = generator.generate_event(quake_type='moderate')
    print(f"Magnitude: {event['magnitude']}")
    print(f"Location: ({event['latitude']:.2f}, {event['longitude']:.2f})")
    print(f"Depth: {event['depth_km']:.2f} km\n")
    
    # Generate sequence
    print("Generating sequence of 20 events over 30 days...")
    generator.generate_sequence(num_events=20, days_span=30)
    print(generator.get_summary())
    
    # Save to file
    generator.save_to_csv()