# -*- coding: utf-8 -*-
"""
Visualize AI-generated risk map
"""
import numpy as np
import matplotlib.pyplot as plt
from src.data_pipeline.terrain_generator import TerrainGenerator
from src.ai.risk_predictor import RiskPredictor

print("Loading terrain and generating risk map...\n")

# Load or generate terrain
terrain_gen = TerrainGenerator(size=100, resolution=10, seed=42)
terrain = terrain_gen.generate_height_map()
properties = terrain_gen.calculate_soil_properties()

# Initialize and train risk predictor
predictor = RiskPredictor()
X, y = predictor.generate_training_data(terrain, properties, num_samples=2000)
predictor.train(X, y)

# Generate risk map
risk_map = predictor.predict_risk_map(terrain, properties)

# Get safe placement suggestions
suggestions = predictor.suggest_placement(risk_map, num_suggestions=5)

# Create visualization
fig, axes = plt.subplots(1, 3, figsize=(18, 6))

# 1. Terrain elevation
im1 = axes[0].imshow(terrain, cmap='terrain', origin='lower')
axes[0].set_title('Terrain Elevation', fontsize=14, fontweight='bold')
axes[0].set_xlabel('X coordinate')
axes[0].set_ylabel('Y coordinate')
plt.colorbar(im1, ax=axes[0], label='Elevation (m)')

# 2. Risk map
risk_colors = ['green', 'yellow', 'red']
from matplotlib.colors import ListedColormap
risk_cmap = ListedColormap(risk_colors)

im2 = axes[1].imshow(risk_map, cmap=risk_cmap, origin='lower', vmin=0, vmax=2)
axes[1].set_title('AI Risk Prediction Map', fontsize=14, fontweight='bold')
axes[1].set_xlabel('X coordinate')
axes[1].set_ylabel('Y coordinate')
cbar2 = plt.colorbar(im2, ax=axes[1], ticks=[0, 1, 2])
cbar2.set_label('Risk Level')
cbar2.ax.set_yticklabels(['Safe', 'Moderate', 'High'])

# Mark suggested placements
for x, y in suggestions:
    axes[1].plot(y, x, 'b*', markersize=15, markeredgecolor='white', markeredgewidth=1)

# 3. Combined view
im3 = axes[2].imshow(terrain, cmap='terrain', origin='lower', alpha=0.6)
im3_overlay = axes[2].imshow(risk_map, cmap=risk_cmap, origin='lower', 
                            alpha=0.4, vmin=0, vmax=2)
axes[2].set_title('Terrain + Risk Overlay', fontsize=14, fontweight='bold')
axes[2].set_xlabel('X coordinate')
axes[2].set_ylabel('Y coordinate')

# Mark suggested placements
for i, (x, y) in enumerate(suggestions, 1):
    axes[2].plot(y, x, 'b*', markersize=15, markeredgecolor='white', markeredgewidth=2)
    axes[2].text(y, x-3, str(i), color='white', fontsize=10, 
                fontweight='bold', ha='center',
                bbox=dict(boxstyle='round', facecolor='blue', alpha=0.7))

plt.tight_layout()
plt.savefig('outputs/plots/risk_map.png', dpi=300, bbox_inches='tight')
print("\nRisk map saved to: outputs/plots/risk_map.png")
print("Opening plot window...")
plt.show()