# MacroPulse AI 🚀

```markdown
![Dashboard Preview](./dashboard.png)

![Status](https://img.shields.io/badge/Status-Active-success)
![Stack](https://img.shields.io/badge/Stack-Full--Stack-blue)
![Focus](https://img.shields.io/badge/Focus-AI%20%26%20Economics-indigo)

**MacroPulse AI** is a real-time economic intelligence dashboard that leverages Machine Learning to predict US inflation trends. It combines a high-performance Python backend with a modern React frontend to visualize complex macroeconomic data instantly.

---

## 🧠 The AI Model (Economist Logic)

Unlike simple visualization tools, MacroPulse includes a predictive engine built on **Scikit-Learn**.

* **Algorithm:** Random Forest Regressor (Ensemble Method).
* **Feature Engineering:** Uses a **3-month Lag Auto-Regressive** approach. The model learns how inflation in month `t-1`, `t-2`, and `t-3` impacts the target month `t`.
* **Recession Detection:** Monitors the **10Y-2Y Treasury Yield Spread** to detect inverted yield curves, a primary indicator of upcoming recessions.

---

## 🛠️ Tech Stack

### **Frontend (The Dashboard)**

* **Framework:** Next.js 14 (React)
* **Styling:** Tailwind CSS (Dark Mode UI)
* **Visualization:** Recharts (Responsive Data plotting)
* **Icons:** Lucide React

### **Backend (The Brain)**

* **API:** FastAPI (High-performance Python framework)
* **Data Science:** Pandas, NumPy, Scikit-learn
* **Data Source:** Federal Reserve Economic Data (FRED) API

---

## ⚡ Features

1. **Real-Time Data Pipeline:** Fetches live CPI (Consumer Price Index) and Treasury Bond data directly from the Federal Reserve.
2. **AI Forecast Card:** Predicts the next month's inflation rate and directional trend (Up/Down).
3. **Risk Gauge:** Evaluates recession probability based on yield curve inversion.
4. **Interactive History:** A 20-year interactive timeline of US inflation.

---

## 🚀 Installation & Setup

Clone the repository and run the system locally.

### 1. Backend Setup (Python)

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python fetch_data.py  # Download latest economic data
uvicorn main:app --reload
