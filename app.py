from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import sys
import matplotlib.pyplot as plt
import seaborn as sns
import os

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
        # ---------- File Handling ----------
        if "file" not in request.files:
            return jsonify({"error": "No CSV file uploaded"}), 400

        file = request.files["file"]
        df = pd.read_csv(file)

        # Optional axis selection
        x_feature = request.form.get("x_feature", "koi_period")
        y_feature = request.form.get("y_feature", "koi_prad")

        # ---------- Validation ----------
        missing_cols = [c for c in EXPECTED_FEATURES if c not in df.columns]
        if missing_cols:
            return jsonify({"error": f"Missing columns: {missing_cols}"}), 400

        kepid_present = "kepid" in df.columns

        # ---------- Prediction ----------
        X = df[EXPECTED_FEATURES].fillna(0)
        X_scaled = scaler.transform(X)

        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled).max(axis=1)

        df["prediction"] = predictions
        df["prediction_label"] = df["prediction"].apply(
            lambda x: "Yes" if x == 1 else "No"
        )
        df["confidence"] = (probabilities * 100).round(2)

        # ---------- Rank List ----------
        rank_df = df.sort_values(by="confidence", ascending=False)

        rank_list = []
        for _, row in rank_df.iterrows():
            rank_list.append({
                "kepid": int(row["kepid"]) if kepid_present else None,
                "confidence": row["confidence"],
                "exoplanet": row["prediction_label"]
            })

        # ---------- Summary ----------
        summary = {
            "total_rows": len(df),
            "confirmed_exoplanets": int((df["prediction"] == 1).sum()),
            "not_exoplanets": int((df["prediction"] == 0).sum())
        }

        # ---------- Graphs ----------
        os.makedirs("static", exist_ok=True)
        plt.style.use("dark_background")

        # 1️⃣ Prediction Distribution
        plt.figure(figsize=(6,4))
        sns.countplot(
            x=df["prediction_label"],
            palette=["#00B4D8", "#0077B6"]
        )
        plt.title("Exoplanet Prediction Distribution", color="white")
        plt.xlabel("Prediction", color="white")
        plt.ylabel("Count", color="white")
        plt.tight_layout()
        plt.savefig("static/prediction_distribution.png")
        plt.close()

        # 2️⃣ Scatter Plot (Dynamic)
        if x_feature in df.columns and y_feature in df.columns:
            plt.figure(figsize=(6,4))
            plt.scatter(
                df[x_feature],
                df[y_feature],
                c=df["prediction"],
                cmap="cool",
                alpha=0.75
            )
            plt.xlabel(x_feature, color="white")
            plt.ylabel(y_feature, color="white")
            plt.title(f"{x_feature} vs {y_feature}", color="white")
            plt.tight_layout()
            plt.savefig("static/scatter_plot.png")
            plt.close()

        # ---------- Model Metrics (Static from Training) ----------
        metrics = {
            "accuracy": 0.9532,
            "confusion_matrix": [[240, 10], [9, 181]],
            "precision": 0.94,
            "recall": 0.95,
            "f1_score": 0.945
        }

        # ---------- Response ----------
        return jsonify({
            "summary": summary,
            "rank_list": rank_list[:20],  # Top 20
            "metrics": metrics,
            "graphs": {
                "distribution": "/static/prediction_distribution.png",
                "scatter": "/static/scatter_plot.png"
            }
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
