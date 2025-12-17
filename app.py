from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import sys
import matplotlib.pyplot as plt
import seaborn as sns

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

@app.route("/predict-csv", methods=["POST"])
def predict_csv():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No CSV file uploaded"}), 400

        file = request.files["file"]
        df = pd.read_csv(file)

        # Check required columns
        missing_cols = [c for c in EXPECTED_FEATURES if c not in df.columns]
        if missing_cols:
            return jsonify({"error": f"Missing columns: {missing_cols}"}), 400

        # Select and reorder features
        X = df[EXPECTED_FEATURES]

        # Handle NaNs safely
        X = X.fillna(0)

        # Scale
        X_scaled = scaler.transform(X)

        # Predict
        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled).max(axis=1)

        df["prediction"] = predictions
        df["prediction_label"] = df["prediction"].apply(
            lambda x: "Confirmed Exoplanet" if x == 1 else "Not an Exoplanet"
        )
        df["confidence"] = (probabilities * 100).round(2)


# Scatter plot
        plt.figure(figsize=(6,4))
        sns.scatterplot(
          x=df["koi_period"],
          y=df["koi_prad"],
          hue=df["prediction_label"]
        )
        plt.xlabel("Orbital Period")
        plt.ylabel("Planet Radius")
        plt.title("Period vs Radius")
        plt.tight_layout()
        plt.savefig("static/period_vs_radius.png")
        plt.close() 

        # Summary
        summary = {
            "total_rows": len(df),
            "confirmed_exoplanets": int((df["prediction"] == 1).sum()),
            "not_exoplanets": int((df["prediction"] == 0).sum())
        }

     



        return jsonify({
            "summary": summary,
            "results": df[["prediction_label", "confidence"]].to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
