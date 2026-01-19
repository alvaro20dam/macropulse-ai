import os
import pandas as pd
from fredapi import Fred
from dotenv import load_dotenv

load_dotenv()
FRED_API_KEY = os.getenv("FRED_API_KEY")
fred = Fred(api_key=FRED_API_KEY)

def fetch_data():
    print("📡 Fetching Economic Data...")
    
    # 1. Inflation Data (CPI)
    cpi = fred.get_series('CPIAUCSL', observation_start='2000-01-01')
    df_cpi = pd.DataFrame(cpi, columns=['cpi_value'])
    df_cpi.index.name = 'date'
    df_cpi['inflation_yoy_pct'] = df_cpi['cpi_value'].pct_change(periods=12) * 100
    
    # 2. Yield Curve (10Y - 2Y Treasury Spread)
    # This is the "Recession Indicator"
    yield_curve = fred.get_series('T10Y2Y', observation_start='2020-01-01')
    
    # Save files
    os.makedirs('data', exist_ok=True)
    
    # Save Inflation
    df_cpi.dropna().to_csv('data/historical_inflation.csv')
    
    # Save Yield Curve (Just the latest value is enough for the card, but let's save history)
    yield_curve.to_csv('data/yield_curve.csv')
    
    print("✅ Inflation and Yield Curve data saved.")

if __name__ == "__main__":
    fetch_data()