# -*- coding: utf-8 -*-
import numpy as np
import matplotlib.pyplot as plt

# Load terrain
data = np.load('data/synthetic/terrain.npy', allow_pickle=True).item()
terrain = data['terrain']

# Save as image
plt.figure(figsize=(10, 10))
plt.imshow(terrain, cmap='terrain')
plt.colorbar(label='Elevation (m)')
plt.title('Mars Terrain Height Map')
plt.savefig('outputs/plots/terrain.png', dpi=150, bbox_inches='tight')
print("Saved! Open: outputs/plots/terrain.png")