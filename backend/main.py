from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INTERNAL AI LOGIC ---
def run_ai_prediction():
    file_path = "data/historical_inflation.csv"
    if not os.path.exists(file_path):
        return {"error": "Data not found"}
    
    # Load Data
    df = pd.read_csv(file_path)
    df['inflation_yoy_pct'] = pd.to_numeric(df['inflation_yoy_pct'], errors='coerce')
    
    # Feature Engineering
    df['lag_1'] = df['inflation_yoy_pct'].shift(1)
    df['lag_2'] = df['inflation_yoy_pct'].shift(2)
    df['lag_3'] = df['inflation_yoy_pct'].shift(3)
    
    model_df = df.dropna()

    X = model_df[['lag_1', 'lag_2', 'lag_3']]
    y = model_df['inflation_yoy_pct']

    # Train Random Forest
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Predict
    latest_data = df.iloc[-1][['inflation_yoy_pct', 'lag_1', 'lag_2']].values
    input_features = latest_data.reshape(1, -1)
    prediction = model.predict(input_features)[0]
    
    return {
        "model": "Random Forest Regressor",
        "last_actual_inflation": df.iloc[-1]['inflation_yoy_pct'],
        "predicted_next_inflation": prediction,
        "direction": "UP" if prediction > df.iloc[-1]['inflation_yoy_pct'] else "DOWN"
    }

# --- ENDPOINTS ---
@app.get("/")
def read_root():
    return {"status": "MacroPulse AI Backend is active 🟢"}

@app.get("/api/inflation")
def get_inflation_data():
    file_path = "data/historical_inflation.csv"
    if not os.path.exists(file_path):
        return {"error": "Run fetch_data.py first"}
    
    # --- FIX IS HERE ---
    # 1. Read the file
    df = pd.read_csv(file_path)
    # 2. THEN clean the data (Fixes the UnboundLocalError)
    df = df.where(pd.notnull(df), None)
    
    return df.to_dict(orient="records")

@app.get("/api/predict")
def get_prediction():
    try:
        return run_ai_prediction()
    except Exception as e:
        return {"error": str(e)}