<div align="center">

# MacroPulse AI 🚀

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Full--Stack-blue?style=for-the-badge)
![Focus](https://img.shields.io/badge/Focus-AI%20%26%20Economics-indigo?style=for-the-badge)

<br />

<img src="./dashboard.png" alt="Dashboard Preview" width="800" style="border-radius: 10px; box-shadow: 0px 4px 20px rgba(0,0,0,0.5);">

<br />

## Real-time Economic Intelligence Dashboard with AI Forecasting

</div>

---

## 🧠 The AI Model (Economist Logic)

Unlike simple visualization tools, **MacroPulse** includes a predictive engine built on **Scikit-Learn**.

* **Algorithm:** Random Forest Regressor (Ensemble Method).
* **Feature Engineering:** Uses a **3-month Lag Auto-Regressive** approach. The model learns how inflation in month `t-1`, `t-2`, and `t-3` impacts the target month `t`.
* **Recession Detection:** Monitors the **10Y-2Y Treasury Yield Spread** to detect inverted yield curves, a primary indicator of upcoming recessions.

---

## 🛠️ Tech Stack

### **Frontend**

* **Framework:** Next.js 14 (React)
* **Styling:** Tailwind CSS (Dark Mode UI)
* **Visualization:** Recharts

### **Backend**

* **API:** FastAPI (High-performance Python framework)
* **Data Science:** Pandas, NumPy, Scikit-learn
* **Data Source:** Federal Reserve Economic Data (FRED) API

---

## ⚡ Key Features

1. **Real-Time Data Pipeline:** Fetches live CPI and Treasury Bond data.
2. **AI Forecast Card:** Predicts next month's inflation rate and direction.
3. **Risk Gauge:** Evaluates recession probability.
4. **Interactive History:** 20-year interactive timeline.

---

## 🚀 Quick Start

### 1. Backend (Python)

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python fetch_data.py
uvicorn main:app --reload

---

### 2. Frontend (React)

cd frontend
npm install
npm run dev
