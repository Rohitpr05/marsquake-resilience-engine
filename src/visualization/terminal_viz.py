"""
Terminal-based ASCII visualization
Shows wave propagation and structure status in terminal
"""
import numpy as np

class TerminalVisualizer:
    def __init__(self):
        """Initialize terminal visualizer"""
        self.width = 80
        self.height = 20
    
    def visualize_wave_field(self, wave_field, title="Wave Propagation"):
        """
        Visualize 2D wave field as ASCII art
        
        Args:
            wave_field: 2D numpy array of wave amplitudes
            title: Title for visualization
        """
        # Normalize wave field
        max_val = np.max(np.abs(wave_field))
        if max_val == 0:
            max_val = 1
        
        normalized = wave_field / max_val
        
        # Resize to terminal dimensions
        h, w = wave_field.shape
        step_x = max(1, w // self.width)
        step_y = max(1, h // self.height)
        
        resized = wave_field[::step_y, ::step_x]
        
        # ASCII characters for intensity levels
        chars = " .:-=+*#%@"
        
        print("\n" + "=" * self.width)
        print(title.center(self.width))
        print("=" * self.width)
        
        for row in resized:
            line = ""
            for val in row:
                # Normalize to 0-1
                intensity = abs(val) / max_val if max_val > 0 else 0
                char_idx = int(intensity * (len(chars) - 1))
                line += chars[char_idx]
            print(line)
        
        print("=" * self.width)
        print(f"Max Amplitude: {max_val:.4f} mm\n")
    
    def show_structure_status(self, structures):
        """
        Display structure status table
        
        Args:
            structures: List of structure objects with safety info
        """
        print("\n" + "=" * 80)
        print("STRUCTURE STATUS REPORT".center(80))
        print("=" * 80)
        
        # Header
        print(f"{'Type':<15} {'Location':<15} {'Status':<12} {'Safety':<10} {'Details':<28}")
        print("-" * 80)
        
        for struct in structures:
            struct_type = struct.__class__.__name__.replace('Model', '')
            location = f"({struct.location[0]},{struct.location[1]})"
            
            # Get status (this depends on structure type)
            if hasattr(struct, 'damage_level'):
                safety = f"{(1-struct.damage_level)*100:.1f}%"
                if struct.damage_level < 0.1:
                    status = "✓ SAFE"
                elif struct.damage_level < 0.3:
                    status = "⚠ MONITOR"
                elif struct.damage_level < 0.7:
                    status = "⚠ WARNING"
                else:
                    status = "✗ CRITICAL"
                details = f"Damage: {struct.damage_level*100:.1f}%"
            elif hasattr(struct, 'tipping_risk'):
                safety = f"{(1-struct.tipping_risk)*100:.1f}%"
                if struct.tipping_risk < 0.3:
                    status = "✓ STABLE"
                elif struct.tipping_risk < 0.6:
                    status = "⚠ CAUTION"
                else:
                    status = "✗ UNSTABLE"
                details = f"Tipping: {struct.tipping_risk*100:.1f}%"
            else:
                status = "UNKNOWN"
                safety = "N/A"
                details = ""
            
            print(f"{struct_type:<15} {location:<15} {status:<12} {safety:<10} {details:<28}")
        
        print("=" * 80 + "\n")
    
    def show_progress_bar(self, current, total, label="Progress"):
        """Show progress bar in terminal"""
        bar_length = 50
        progress = current / total
        filled = int(bar_length * progress)
        bar = "█" * filled + "░" * (bar_length - filled)
        
        print(f"\r{label}: |{bar}| {progress*100:.1f}% ({current}/{total})", end="", flush=True)
        
        if current == total:
            print()  # New line when complete


if __name__ == "__main__":
    print("Testing Terminal Visualizer...\n")
    
    viz = TerminalVisualizer()
    
    # Test wave field visualization
    test_field = np.random.randn(50, 50) * 10
    viz.visualize_wave_field(test_field, "Test Wave Field")
    
    # Test progress bar
    import time
    for i in range(1, 11):
        viz.show_progress_bar(i, 10, "Loading")
        time.sleep(0.1)