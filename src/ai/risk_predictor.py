# -*- coding: utf-8 -*-
"""
AI-based Risk Prediction for Mars Habitat Placement
Uses machine learning to identify high-risk zones
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import config

class RiskPredictor:
    def __init__(self):
        """Initialize risk predictor"""
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def generate_training_data(self, terrain, properties, num_samples=1000):
        """
        Generate synthetic training data from terrain
        
        Args:
            terrain: 2D terrain elevation array
            properties: Dictionary with rigidity and density
            num_samples: Number of training samples to generate
        
        Returns:
            X (features), y (risk labels)
        """
        print("Generating training data for AI model...")
        
        features = []
        labels = []
        
        size = terrain.shape[0]
        
        for _ in range(num_samples):
            # Random location
            x = np.random.randint(1, size - 1)
            y = np.random.randint(1, size - 1)
            
            # Extract features
            elevation = terrain[x, y]
            rigidity = properties['rigidity'][x, y]
            density = properties['density'][x, y]
            
            # Calculate slope (gradient)
            slope_x = abs(terrain[x+1, y] - terrain[x-1, y]) / 2
            slope_y = abs(terrain[x, y+1] - terrain[x, y-1]) / 2
            slope = np.sqrt(slope_x**2 + slope_y**2)
            
            # Local terrain variance (roughness)
            local_window = terrain[max(0, x-2):min(size, x+3), 
                                  max(0, y-2):min(size, y+3)]
            roughness = np.std(local_window)
            
            # Amplification factor (softer soil amplifies waves more)
            amplification = config.SOIL_RIGIDITY / rigidity
            
            # Feature vector
            feature = [elevation, slope, roughness, rigidity, density, amplification]
            features.append(feature)
            
            # Risk label (0=safe, 1=moderate, 2=high risk)
            risk = self._calculate_risk_label(elevation, slope, roughness, 
                                             rigidity, amplification)
            labels.append(risk)
        
        X = np.array(features)
        y = np.array(labels)
        
        print("Generated {0} training samples".format(num_samples))
        print("Risk distribution:")
        print("  - Safe (0): {0}".format(np.sum(y == 0)))
        print("  - Moderate (1): {0}".format(np.sum(y == 1)))
        print("  - High (2): {0}".format(np.sum(y == 2)))
        
        return X, y
    
    def _calculate_risk_label(self, elevation, slope, roughness, 
                             rigidity, amplification):
        """Calculate risk label based on multiple factors"""
        risk_score = 0
        
        # High slope = unstable
        if slope > 50:
            risk_score += 2
        elif slope > 20:
            risk_score += 1
        
        # High roughness = unpredictable terrain
        if roughness > 100:
            risk_score += 1
        
        # Low rigidity = more wave amplification
        if rigidity < 0.9e8:
            risk_score += 1
        
        # High amplification = dangerous
        if amplification > 1.3:
            risk_score += 2
        elif amplification > 1.1:
            risk_score += 1
        
        # Convert to risk category
        if risk_score >= 4:
            return 2  # High risk
        elif risk_score >= 2:
            return 1  # Moderate risk
        else:
            return 0  # Safe
    
    def train(self, X, y):
        """Train the risk prediction model"""
        print("\nTraining AI Risk Prediction Model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        
        print("Training complete!")
        print("  - Training accuracy: {0:.2f}%".format(train_score * 100))
        print("  - Testing accuracy: {0:.2f}%".format(test_score * 100))
        
        self.is_trained = True
        
        return train_score, test_score
    
    def predict_risk_map(self, terrain, properties):
        """
        Generate risk map for entire terrain
        
        Args:
            terrain: 2D terrain elevation array
            properties: Dictionary with rigidity and density
        
        Returns:
            2D risk map (0=safe, 1=moderate, 2=high)
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet! Call train() first.")
        
        print("\nGenerating risk prediction map...")
        
        size = terrain.shape[0]
        risk_map = np.zeros_like(terrain)
        
        for x in range(1, size - 1):
            for y in range(1, size - 1):
                # Extract features
                elevation = terrain[x, y]
                rigidity = properties['rigidity'][x, y]
                density = properties['density'][x, y]
                
                # Calculate slope
                slope_x = abs(terrain[x+1, y] - terrain[x-1, y]) / 2
                slope_y = abs(terrain[x, y+1] - terrain[x, y-1]) / 2
                slope = np.sqrt(slope_x**2 + slope_y**2)
                
                # Local roughness
                local_window = terrain[max(0, x-2):min(size, x+3), 
                                      max(0, y-2):min(size, y+3)]
                roughness = np.std(local_window)
                
                # Amplification
                amplification = config.SOIL_RIGIDITY / rigidity
                
                # Predict
                feature = np.array([[elevation, slope, roughness, 
                                   rigidity, density, amplification]])
                feature_scaled = self.scaler.transform(feature)
                risk = self.model.predict(feature_scaled)[0]
                
                risk_map[x, y] = risk
        
        print("Risk map generated!")
        safe_pct = np.sum(risk_map == 0) / risk_map.size * 100
        moderate_pct = np.sum(risk_map == 1) / risk_map.size * 100
        high_pct = np.sum(risk_map == 2) / risk_map.size * 100
        
        print("Terrain Risk Assessment:")
        print("  - Safe zones: {0:.1f}%".format(safe_pct))
        print("  - Moderate risk: {0:.1f}%".format(moderate_pct))
        print("  - High risk: {0:.1f}%".format(high_pct))
        
        return risk_map
    
    def suggest_placement(self, risk_map, num_suggestions=5):
        """
        Suggest safest locations for habitat placement
        
        Args:
            risk_map: 2D array of risk values
            num_suggestions: Number of locations to suggest
        
        Returns:
            List of (x, y) coordinates sorted by safety
        """
        # Find all safe zones
        safe_zones = np.argwhere(risk_map == 0)
        
        if len(safe_zones) == 0:
            print("Warning: No completely safe zones found!")
            # Fall back to moderate risk zones
            safe_zones = np.argwhere(risk_map == 1)
        
        # Randomly sample suggestions
        if len(safe_zones) > num_suggestions:
            indices = np.random.choice(len(safe_zones), num_suggestions, replace=False)
            suggestions = safe_zones[indices]
        else:
            suggestions = safe_zones
        
        print("\nRecommended habitat placement locations:")
        for i, (x, y) in enumerate(suggestions, 1):
            risk_level = ["SAFE", "MODERATE", "HIGH"][int(risk_map[x, y])]
            print("  {0}. Location ({1}, {2}) - Risk: {3}".format(i, x, y, risk_level))
        
        return suggestions
    
    def save_model(self, filename='outputs/ai_risk_model.pkl'):
        """Save trained model to file"""
        if not self.is_trained:
            print("No trained model to save!")
            return
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler
        }
        
        with open(filename, 'wb') as f:
            pickle.dump(model_data, f)
        
        print("Model saved to {0}".format(filename))
    
    def load_model(self, filename='outputs/ai_risk_model.pkl'):
        """Load trained model from file"""
        with open(filename, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.is_trained = True
        
        print("Model loaded from {0}".format(filename))


if __name__ == "__main__":
    # Test the risk predictor
    from src.data_pipeline.terrain_generator import TerrainGenerator
    
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