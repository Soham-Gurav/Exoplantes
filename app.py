from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import sys

app = Flask(__name__)
CORS(app)

try:
    model = joblib.load("exoplanet_model.pkl")
    scaler = joblib.load("scaler.pkl")
    feature_names = joblib.load("feature_names.pkl")
    print(f" Model and Scaler loaded. Expecting {len(feature_names)} features.")
except FileNotFoundError as e:
    print(f" Error loading files: {e}. Did you run exoplanet_classification.py?")
    sys.exit(1)

# The list of expected feature names must match the model's training data
EXPECTED_FEATURES = feature_names

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # 1. Check if the input contains the required feature dictionary
        if 'features' not in data or not isinstance(data['features'], dict):
             return jsonify({"error": "Invalid input format. Expected a dictionary of features."}), 400

        input_features = data['features']
        input_df = pd.DataFrame([input_features])
        
        # Reorder and select only the columns the model expects
        X_predict = input_df[EXPECTED_FEATURES]

        # 3. Scale the features
        scaled_features = scaler.transform(X_predict)
        
        # 4. Predict
        prediction = model.predict(scaled_features)[0]
        prediction_proba = model.predict_proba(scaled_features)[0].max() # Get confidence

        result = "Confirmed Exoplanet" if prediction == 1 else "Not an Exoplanet"
        
        return jsonify({
            "prediction": result,
            "confidence": f"{prediction_proba * 100:.2f}%"
        })
    except Exception as e:
        # Catch errors like mismatch in number of features
        return jsonify({"error": f"Prediction failed: {e}", "details": f"Expected {len(EXPECTED_FEATURES)} features, received {len(input_features)} keys."}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
