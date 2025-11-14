<img width="464" height="216" alt="image" src="https://github.com/user-attachments/assets/1d623a76-f448-45ed-b61d-b71029915648" />

Exoplanet Classification Using NASA Kepler Data

This project is a Machine Learning–powered exoplanet classifier built using NASA’s Kepler Exoplanet Candidate (KOI) dataset and supplemental Kaggle data.
It predicts whether a detected astronomical signal corresponds to a real exoplanet or a false positive, using astrophysical features such as orbital period, transit depth, planet radius, and stellar temperature.

The web interface allows anyone to input custom parameters and instantly receive predictions through a clean, futuristic UI inspired by sci-fi exoplanet imagery.

ML model trained on NASA exoplanet dataset

🚀 Flask backend handling preprocessing, scaling, and predictions
🌐 Next.js frontend with a beautiful sci-fi user interface
🧪 Prediction using 41+ astrophysical parameters
🪐 Real-time classification of exoplanet candidates
🛰️ API endpoint for programmatic access (/predict)
👨‍💻 Team & Contributions

This project was developed by:

Soham Gurav
Shreyas Menon
Piyush Bambori
Om Bankar

We combined:

Astronomy
Data science
Machine learning
Scientific visualization
Frontend & backend development
to build a complete end-to-end exoplanet detection system.

🧬 ML Model Overview

The model uses key astrophysical parameters from NASA:

koi_period → Orbital period
koi_prad → Planet radius
koi_depth → Transit depth
koi_steff → Stellar temperature
koi_score → NASA’s confidence score

Additional essential features are auto-filled and scaled before feeding into a Logistic Regression classifier.

Missing values were cleaned, features standardized using StandardScaler, and a classical binary classification model was trained and saved as:

exoplanet_model.pkl
scaler.pkl
feature_names.pkl

🏗️ Tech Stack
Backend:

Python
Flask
Flask-CORS
scikit-learn
pandas
numpy
joblib

Frontend:

Next.js
React
Inline CSS (no Tailwind needed)


⚙️ How to Run the Project
1️⃣ Backend Setup (Flask API)

Enter backend directory and create virtual env:

cd backend
python -m venv venv


Activate it:

Windows:
venv\Scripts\activate


Install requirements:

pip install -r requirements.txt


Run the backend server:

python run.py


Backend will start at:

http://127.0.0.1:5000

2️⃣ Frontend Setup (Next.js UI)

Go to frontend directory:

cd frontend

Install node modules:

npm install
Run the Next.js development server:
npm run dev


Frontend will run at:

http://localhost:3000

🔌 API Usage
Endpoint:
POST http://127.0.0.1:5000/predict

Example Body:
{
  "features": {
    "koi_score": 0.92,
    "koi_period": 45.2,
    "koi_prad": 1.9,
    "koi_depth": 1200,
    "koi_steff": 5600,
    "... all other required features auto-filled as 0 ..."
  }
}

Response:
{
  "prediction": "Confirmed Exoplanet",
  "confidence": "96.12%"
}

📸 UI Preview:

Sci-fi inspired EXOPLANETS hero section
Responsive modern design
Inline CSS (no build errors)
Clean input form + prediction results

📜 License:

This project is open-source and free to use for educational and research purposes.

🚀 Future Improvements:

Use deep learning models (XGBoost, RandomForest, Neural Networks)
Add real NASA data pull via API
Host frontend + backend online
Generate dynamic exoplanet visualizations
Add RAG-based astrophysics information assistant
