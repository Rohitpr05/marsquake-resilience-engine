    # -*- coding: utf-8 -*-
"""
Download real Mars imagery from NASA
"""
import urllib.request
import os

print("Downloading real Mars imagery from NASA...")

# Mars Global Map (Viking colorized mosaic)
mars_map_url = "https://www.lpi.usra.edu/resources/mapcatalog/mars/Mars_Viking_ClrMosaic_global_925m.jpg"

# Create output directory
os.makedirs("marsquake-ui/public/assets", exist_ok=True)

try:
    print("Fetching Mars base map...")
    urllib.request.urlretrieve(mars_map_url, "marsquake-ui/public/assets/mars_map.jpg")
    print("✓ Mars map downloaded successfully!")
except Exception as e:
    print(f"Error downloading: {e}")
    print("\nManual download:")
    print("1. Go to: https://trek.nasa.gov/mars/")
    print("2. Download Mars map")
    print("3. Save to: marsquake-ui/public/assets/mars_map.jpg")

print("\nDone! Map saved to: marsquake-ui/public/assets/mars_map.jpg")