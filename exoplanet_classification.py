import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import warnings
import sys
warnings.filterwarnings('ignore')  

print("Starting Exoplanet Classification Pipeline...")

try:
    df = pd.read_csv("exoplanets.csv")
except FileNotFoundError:
    print("Error: 'exoplanets.csv' not found. Please ensure the file is in the correct directory.")
    sys.exit(1)

# 2. Target: CONFIRMED = 1, else = 0
if "koi_disposition" not in df.columns:
    raise ValueError("'koi_disposition' column not found in dataset!")

df = df[df["koi_disposition"].notna()]
df["exoplanet_flag"] = df["koi_disposition"].apply(lambda x: 1 if str(x).strip().upper() == "CONFIRMED" else 0)

# 3. Drop irrelevant columns
drop_cols = [
    "kepid", "kepoi_name", "kepler_name", "koi_pdisposition",
    "koi_tce_delivname", "koi_disposition"
]
df = df.drop(columns=[c for c in drop_cols if c in df.columns], errors="ignore")

# 4. Keep only numeric columns
df = df.select_dtypes(include=[np.number])

# 5a. Drop columns where ALL values are NaN (e.g., 'koi_teq_err1', 'koi_teq_err2')
df = df.dropna(axis=1, how='all')

# 5b. AGGRESSIVE CLEANING — drop any row with remaining NaNs
df = df.dropna(axis=0)

# 6. Safety check
if df.empty or len(df) < 10:
    raise ValueError("Dataset too small after cleaning. Check your input file!")

print(f"Cleaned dataset shape: {df.shape}")

# 7. Split features and labels
if "exoplanet_flag" not in df.columns:
    raise ValueError("Target column missing after preprocessing!")

X = df.drop(columns=["exoplanet_flag"])
y = df["exoplanet_flag"]

# IMPORTANT: Save feature names for deployment to ensure correct order
feature_names = X.columns.tolist()
joblib.dump(feature_names, "feature_names.pkl")
print(f"Feature names ({len(feature_names)}) saved for deployment.")

# 8. Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 9. Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# 10. Train models
models = {
    "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42),
}

best_model = None
best_acc = 0.0

print("\nMODEL PERFORMANCE")
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"\n{name} Accuracy: {acc:.4f}")
    # Omitted classification_report for brevity in output
    if acc > best_acc:
        best_acc = acc
        best_model = model

if best_model is None:
    raise ValueError("No model trained successfully.")

print(f"\nBest Model: {type(best_model).__name__} with Accuracy = {best_acc:.4f}")

# 11. Save model and scaler
joblib.dump(best_model, "exoplanet_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("Model and Scaler saved successfully.")
print("Exoplanet pipeline completed successfully!")
