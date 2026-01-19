"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Activity,
  AlertCircle,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from "lucide-react";

interface InflationData {
  date: string;
  cpi_value: number;
  inflation_yoy_pct: number;
}

interface PredictionData {
  model: string;
  last_actual_inflation: number;
  predicted_next_inflation: number;
  direction: "UP" | "DOWN";
}

interface RiskData {
  yield_spread: number;
  level: string;
  color: "red" | "yellow" | "green";
}

// --- CONFIGURATION ---
// The URL of your live Backend on Render
const API_BASE_URL = "https://macropulse-backend.onrender.com";

export default function Dashboard() {
  const [data, setData] = useState<InflationData[]>([]);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // We use the new API_BASE_URL here
        const [histRes, predRes, riskRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/inflation`),
          axios.get(`${API_BASE_URL}/api/predict`),
          axios.get(`${API_BASE_URL}/api/risk`),
        ]);

        setData(histRes.data);
        setPrediction(predRes.data);
        setRisk(riskRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to connect to the Live API.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-8 bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            MacroPulse AI
          </h1>
          <p className="text-slate-400">Real-time Economic Intelligence</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card 1: Inflation */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              Current Inflation
            </h3>
          </div>
          {loading ? (
            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <>
              <div className="text-4xl font-bold text-white">
                {data.length > 0
                  ? data[data.length - 1].inflation_yoy_pct.toFixed(2)
                  : "0.00"}
                %
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Latest Official Data
              </p>
            </>
          )}
        </div>

        {/* Card 2: AI Forecast */}
        <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Brain size={100} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-300">
              <Brain size={24} />
            </div>
            <h3 className="text-lg font-semibold text-indigo-100">
              AI Forecast
            </h3>
          </div>
          {loading || !prediction ? (
            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="relative z-10">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-white">
                  {prediction.predicted_next_inflation.toFixed(2)}%
                </span>
                <span
                  className={`flex items-center text-sm font-medium mb-1 px-2 py-0.5 rounded ${
                    prediction.direction === "UP"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {prediction.direction === "UP" ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  {prediction.direction}
                </span>
              </div>
              <p className="text-sm text-indigo-200/60 mt-2">
                Random Forest Model
              </p>
            </div>
          )}
        </div>

        {/* Card 3: Recession Risk */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-3 rounded-lg ${risk?.color === "red" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
            >
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              Recession Risk
            </h3>
          </div>
          {loading || !risk ? (
            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <>
              <div className="text-4xl font-bold text-white">
                {risk.yield_spread ? risk.yield_spread.toFixed(2) : "0.00"}
              </div>
              <div
                className={`text-sm mt-2 font-medium ${risk.color === "red" ? "text-red-400" : "text-emerald-400"}`}
              >
                {risk.level}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                10Y-2Y Treasury Spread
              </p>
            </>
          )}
        </div>

        {/* Chart */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Activity size={20} className="text-cyan-400" />
              Inflation Trend (2000 - Present)
            </h3>
          </div>
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-slate-500">
                Loading AI Pipeline...
              </div>
            ) : error ? (
              <div className="h-full w-full flex items-center justify-center text-red-400 gap-2">
                <AlertCircle /> {error}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#475569"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      color: "#f8fafc",
                    }}
                    itemStyle={{ color: "#22d3ee" }}
                    labelFormatter={formatDate}
                  />
                  <Line
                    type="monotone"
                    dataKey="inflation_yoy_pct"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: "#22d3ee" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
