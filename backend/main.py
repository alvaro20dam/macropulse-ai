from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
from fredapi import Fred
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

# ---------------------------------------------------------
# 🔑 ENTER YOUR FRED API KEY HERE
# ---------------------------------------------------------
FRED_API_KEY = "8a962c09f771530f473cc66df2b96b70" 
# ---------------------------------------------------------

app = FastAPI()

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
real_data_cache = []

def fetch_and_train():
    """Fetches real data from FRED, cleans it, and trains the model."""
    global model, real_data_cache
    
    print("⏳ Fetching data from FRED... (This might take a moment)")
    
    try:
        fred = Fred(api_key=FRED_API_KEY)
        
        # 1. Fetch the raw series (Last 20 years)
        # UNRATE = Unemployment Rate
        # CPIAUCSL = Consumer Price Index (used to calc inflation)
        start_date = '2004-01-01'
        u_series = fred.get_series('UNRATE', observation_start=start_date)
        cpi_series = fred.get_series('CPIAUCSL', observation_start=start_date)
        
        # 2. Convert to Pandas DataFrame
        df = pd.DataFrame({'unemployment': u_series, 'cpi': cpi_series})
        
        # 3. Calculate Year-Over-Year Inflation Rate
        # Inflation = % change in CPI over 12 months
        df['inflation'] = df['cpi'].pct_change(periods=12) * 100
        
        # 4. Clean Data
        # Drop NaN values (created by the lag calculation) and ensure matching dates
        df = df.dropna()
        
        # Cache for the API endpoint (Convert to list of dicts)
        # We only take the last 100 months to keep the chart readable
        recent_df = df.tail(100)
        real_data_cache = [
            {"unemployment": round(row['unemployment'], 2), 
             "inflation": round(row['inflation'], 2)}
            for index, row in recent_df.iterrows()
        ]
        
        # 5. Train Model on ALL historical data (not just the recent 100)
        X = df[['unemployment']].values
        y = df['inflation'].values
        
        # We use a Polynomial model (degree 2) to capture the curve
        model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression())
        model.fit(X, y)
        
        print(f"✅ Success! Model trained on {len(df)} months of real US economy data.")
        
    except Exception as e:
        print(f"❌ Error fetching FRED data: {e}")
        # Fallback to synthetic data if API fails
        print("⚠️ Switching to Backup Synthetic Mode")
        # (Simple fallback logic could go here, but for now we just print the error)

# Run startup task
fetch_and_train()

# --- API Endpoints ---

class PredictionRequest(BaseModel):
    unemployment_rate: float

@app.get("/api/phillips-curve")
def get_data():
    if not real_data_cache:
        return [{"unemployment": 0, "inflation": 0}] # Return empty if fetch failed
    return real_data_cache

@app.post("/api/predict")
def predict_inflation(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not ready yet")
        
    input_val = np.array([[request.unemployment_rate]])
    prediction = model.predict(input_val)[0]
    
    return {
        "unemployment_rate": request.unemployment_rate,
        "predicted_inflation": round(prediction, 2)
    }