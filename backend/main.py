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
    
    df = pd.read_csv(file_path)
    df['inflation_yoy_pct'] = pd.to_numeric(df['inflation_yoy_pct'], errors='coerce')
    
    df['lag_1'] = df['inflation_yoy_pct'].shift(1)
    df['lag_2'] = df['inflation_yoy_pct'].shift(2)
    df['lag_3'] = df['inflation_yoy_pct'].shift(3)
    
    model_df = df.dropna()
    X = model_df[['lag_1', 'lag_2', 'lag_3']]
    y = model_df['inflation_yoy_pct']

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # --- FIX: Create a DataFrame for prediction to silence the warning ---
    latest_vals = df.iloc[-1][['inflation_yoy_pct', 'lag_1', 'lag_2']].values
    input_df = pd.DataFrame(latest_vals.reshape(1, -1), columns=['lag_1', 'lag_2', 'lag_3'])
    
    prediction = model.predict(input_df)[0]
    
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
    df = pd.read_csv(file_path)
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient="records")

@app.get("/api/predict")
def get_prediction():
    try:
        return run_ai_prediction()
    except Exception as e:
        return {"error": str(e)}

# --- NEW: RECESSION RISK ENDPOINT ---
@app.get("/api/risk")
def get_risk_level():
    file_path = "data/yield_curve.csv"
    # Safety Check: If file doesn't exist, return neutral data so app doesn't crash
    if not os.path.exists(file_path):
        return {"yield_spread": 0, "level": "Data Missing", "color": "yellow"}
    
    try:
        df = pd.read_csv(file_path, names=["date", "spread"], header=0)
        latest_spread = df.iloc[-1]['spread']
        
        if latest_spread < 0:
            level = "HIGH (Recession Risk)"
            color = "red"
        elif latest_spread < 0.5:
            level = "Moderate"
            color = "yellow"
        else:
            level = "Low (Healthy)"
            color = "green"
            
        return {"yield_spread": latest_spread, "level": level, "color": color}
    except Exception as e:
        return {"error": str(e)}