"use client";

import React, { useEffect, useState, FormEvent } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

// --- Interfaces ---
interface PhillipsData {
  unemployment: number;
  inflation: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    name: string;
    payload: PhillipsData;
  }[];
  label?: string;
}

// --- Dark Mode Tooltip ---
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-slate-700">
        <p className="font-bold mb-2 text-slate-200">Economic Snapshot</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-emerald-400">Unemployment:</span>
            <span className="font-mono font-bold">{payload[0].value}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-rose-400">Inflation:</span>
            <span className="font-mono font-bold">{payload[1].value}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PhillipsChart() {
  const [data, setData] = useState<PhillipsData[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const [prediction, setPrediction] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/phillips-curve");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handlePredict = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputVal) return;
    try {
      const res = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unemployment_rate: parseFloat(inputVal) }),
      });
      if (!res.ok) throw new Error("Prediction request failed");
      const result = await res.json();
      setPrediction(result.predicted_inflation);
    } catch (error) {
      console.error("Prediction failed:", error);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 space-y-8">
      {/* 1. Main Dashboard Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950/50 px-8 py-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Short-Run Phillips Curve
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Real-time trade-off analysis (US Economy)
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE FRED DATA
          </div>
        </div>

        {/* Chart Area - Increased padding and adjusted margins */}
        <div className="h-112.5 w-full p-6 pr-8">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.4}
              />

              <XAxis
                type="number"
                dataKey="unemployment"
                name="Unemployment"
                unit="%"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#475569" }}
                dy={10} // Pushes labels down slightly
                label={{
                  value: "Unemployment Rate (%)",
                  position: "insideBottom",
                  offset: -20, // Pushes title down to avoid overlap
                  fill: "#94a3b8",
                  fontSize: 13,
                }}
              />

              <YAxis
                type="number"
                dataKey="inflation"
                name="Inflation"
                unit="%"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#475569" }}
                label={{
                  value: "Inflation Rate (%)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94a3b8",
                  fontSize: 13,
                  dy: 50, // Vertically center the label better
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8" }}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />

              <Scatter name="Economics Data" data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="url(#neonGradient)" />
                ))}
              </Scatter>

              <defs>
                <linearGradient id="neonGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.9} />
                </linearGradient>
              </defs>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Data Source */}
        <div className="bg-slate-950/50 px-8 py-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            <span>
              Source:{" "}
              <span className="text-slate-300 font-medium">
                Federal Reserve (FRED)
              </span>
            </span>
          </div>
          <span className="font-mono text-slate-600 bg-slate-800/50 px-2 py-1 rounded">
            UNRATE vs CPIAUCSL
          </span>
        </div>
      </div>

      {/* 2. AI Forecaster Panel - Fixed Alignment */}
      <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">AI Forecaster</h3>
          <p className="text-slate-400 text-sm mt-1">
            Run a scenario through the regression model.
          </p>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* Form Container */}
          <form
            onSubmit={handlePredict}
            className="flex gap-0 items-center bg-slate-800/50 p-1 rounded-xl border border-slate-700"
          >
            {/* Input - Explicit Height h-12 */}
            <input
              type="number"
              step="0.1"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ex: 4.2"
              className="h-12 pl-4 pr-4 bg-transparent text-white placeholder-slate-500 focus:outline-none w-32 md:w-40 text-lg border-r border-slate-700"
            />
            {/* Button - Explicit Height h-12 */}
            <button
              type="submit"
              className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-r-lg rounded-l-none transition-all whitespace-nowrap"
            >
              Run Model
            </button>
          </form>

          {/* Result Display - Vertically Centered */}
          {prediction !== null && (
            <div className="text-right pl-4 border-l border-slate-700">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">
                Inflation
              </p>
              <p
                className={`text-3xl font-bold ${prediction > 5 ? "text-rose-400" : "text-emerald-400"} animate-in fade-in`}
              >
                {prediction}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
