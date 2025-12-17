from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import sys
import matplotlib
matplotlib.use("Agg") 
import matplotlib.pyplot as plt
import seaborn as sns
import os
from google import genai


app = Flask(__name__)
CORS(app)


# Replace the text below with your actual API key from Google AI Studio
client = genai.Client(api_key="AIzaSyDKdumXpI0idlYIkLtgP44xTFmdokIRs5s")
try:
    model = joblib.load("exoplanet_model.pkl")
    scaler = joblib.load("scaler.pkl")
    feature_names = joblib.load("feature_names.pkl")
    print(f" Model and Scaler loaded. Expecting {len(feature_names)} features.")
except FileNotFoundError as e:
    print(f" Error loading files: {e}. Did you run exoplanet_classification.py?")
    sys.exit(1)

last_csv_df = None

# The list of expected feature names must match the model's training data
EXPECTED_FEATURES = feature_names

@app.route('/')
def home():
    return render_template('index.html')

@app.route("/update-scatter", methods=["POST"])
def update_scatter():
    try:
        x_feature = request.form.get("x_feature")
        y_feature = request.form.get("y_feature")

        if not x_feature or not y_feature:
            return jsonify({"error": "Missing parameters"}), 400

        global last_csv_df
        if last_csv_df is None:
            return jsonify({"error": "No CSV data available"}), 400

        df = last_csv_df

        if x_feature not in df.columns or y_feature not in df.columns:
            return jsonify({"error": "Invalid feature selection"}), 400

        # DARK THEME
        plt.style.use("dark_background")
        fig, ax = plt.subplots(figsize=(6, 4))

        ax.scatter(
            df[x_feature],
            df[y_feature],
            c=df["prediction"],
            cmap="cool",
            alpha=0.75
        )

        ax.set_xlabel(x_feature, color="white")
        ax.set_ylabel(y_feature, color="white")
        ax.set_title(f"{x_feature} vs {y_feature}", color="white")

        fig.tight_layout()
        fig.savefig("static/scatter_plot.png")
        plt.close(fig)

        return jsonify({
            "scatter": "/static/scatter_plot.png"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 1. Add this at the top with your other globals
last_analysis_results = None 

# 2. Move the Gemini function outside to the top level
def generate_gemini_summary(summary, top_candidates):
    # Use the client initialized at the top of your script
    prompt = f"""
    You are an astrophysics research assistant.
    The following are results from a machine learning model that classifies
    exoplanet candidates using Kepler mission data.

    Summary statistics:
    - Total candidates analyzed: {summary['total_rows']}
    - Confirmed exoplanets: {summary['confirmed_exoplanets']}
    - Non-exoplanets: {summary['not_exoplanets']}

    Top exoplanet candidates (Kepler ID and confidence):
    {top_candidates}

    Write a concise scientific summary (2–3 paragraphs) explaining:
    1. Overall model performance
    2. Observed trends in predictions
    3. Confidence in detected exoplanets
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        return f"AI Summary generation failed: {str(e)}"

# 3. Cleaned up predict-csv route
@app.route("/predict-csv", methods=["POST"])
def predict_csv():
    global last_analysis_results, last_csv_df
    try:
        if "file" not in request.files:
            return jsonify({"error": "No CSV file uploaded"}), 400

        file = request.files["file"]
        df = pd.read_csv(file)
        
        # Validation
        missing_cols = [c for c in EXPECTED_FEATURES if c not in df.columns]
        if missing_cols:
            return jsonify({"error": f"Missing columns: {missing_cols}"}), 400

        # Prediction logic
        X = df[EXPECTED_FEATURES].fillna(0)
        X_scaled = scaler.transform(X)
        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled).max(axis=1)

        df["prediction"] = predictions
        df["prediction_label"] = df["prediction"].apply(lambda x: "Yes" if x == 1 else "No")
        df["confidence"] = (probabilities * 100).round(2)
        
        last_csv_df = df.copy()

        # Prepare summary and rank list
        summary = {
            "total_rows": len(df),
            "confirmed_exoplanets": int((df["prediction"] == 1).sum()),
            "not_exoplanets": int((df["prediction"] == 0).sum())
        }

        rank_df = df.sort_values(by="confidence", ascending=False).head(20)
        rank_list = []
        for _, row in rank_df.iterrows():
            rank_list.append({
                "kepid": int(row["kepid"]) if "kepid" in df.columns else "N/A",
                "confidence": row["confidence"],
                "exoplanet": row["prediction_label"]
            })

        # --- SAVE FOR AI ROUTE ---
        last_analysis_results = {
            "summary": summary,
            "top_candidates": rank_list
        }

        # Graphs generation (Same as your code)
        os.makedirs("static", exist_ok=True)
        plt.style.use("dark_background")
        
        # Prediction Plot
        plt.figure(figsize=(6,4))
        sns.countplot(x=df["prediction_label"], palette=["#00B4D8", "#0077B6"])
        plt.savefig("static/prediction_distribution.png")
        plt.close()

        # Scatter Plot
        plt.figure(figsize=(6,4))
        plt.scatter(df["koi_period"], df["koi_prad"], c=df["prediction"], cmap="cool", alpha=0.75)
        plt.savefig("static/scatter_plot.png")
        plt.close()

        return jsonify({
            "summary": summary,
            "rank_list": rank_list,
            "graphs": {
                "distribution": "/static/prediction_distribution.png",
                "scatter": "/static/scatter_plot.png"
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. NEW ROUTE for Gemini
@app.route("/get-ai-summary", methods=["GET"])
def get_ai_summary():
    global last_analysis_results
    if not last_analysis_results:
        return jsonify({"error": "No analysis found. Upload a CSV first."}), 400
    
    report = generate_gemini_summary(
        last_analysis_results["summary"], 
        last_analysis_results["top_candidates"]
    )
    return jsonify({"ai_summary": report})

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
