# -*- coding: utf-8 -*-
"""
Test AI Risk Predictor
"""
from src.data_pipeline.terrain_generator import TerrainGenerator
from src.ai.risk_predictor import RiskPredictor

print("Testing AI Risk Predictor...\n")

# Generate terrain
terrain_gen = TerrainGenerator(size=100, resolution=10)
terrain = terrain_gen.generate_height_map()
properties = terrain_gen.calculate_soil_properties()

# Initialize predictor
predictor = RiskPredictor()

# Generate training data
X, y = predictor.generate_training_data(terrain, properties, num_samples=2000)

# Train model
predictor.train(X, y)

# Generate risk map
risk_map = predictor.predict_risk_map(terrain, properties)

# Get placement suggestions
suggestions = predictor.suggest_placement(risk_map, num_suggestions=5)

# Save model
predictor.save_model()

print("\nAI Risk Prediction test complete!")