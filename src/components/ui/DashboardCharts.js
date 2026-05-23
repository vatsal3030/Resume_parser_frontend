"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export function CreditUsageChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch generations and group by date for the last 7 days
    api.get("/domain/generations?limit=100")
      .then((res) => {
        const generations = res.data || [];
        // Initialize last 7 days
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            rawDate: d.toISOString().split("T")[0],
            credits: 0,
          };
        });

        generations.forEach((g) => {
          const gDate = new Date(g.createdAt).toISOString().split("T")[0];
          const dayMatch = last7Days.find((d) => d.rawDate === gDate);
          if (dayMatch) {
            dayMatch.credits += g.creditsCost || 0;
          }
        });

        setData(last7Days);
      })
      .catch((err) => console.error("Failed to load generations for chart", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-64 bg-gray-100 border-4 border-brutal-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-72 bg-white border-4 border-brutal-black p-4 shadow-[4px_4px_0_#000] flex flex-col">
      <h3 className="font-black uppercase tracking-wider mb-4 text-sm">Credit Usage (7 Days)</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#000", color: "#fff", border: "2px solid #000", borderRadius: 0, fontWeight: "bold", fontSize: 12 }}
              itemStyle={{ color: "#fff" }}
            />
            <Area type="step" dataKey="credits" stroke="#000" strokeWidth={3} fill="#facc15" fillOpacity={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const COLORS = ["#facc15", "#38bdf8", "#f472b6", "#4ade80", "#c084fc", "#fb923c"];

export function ToolUsageChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/domain/generations?limit=100")
      .then((res) => {
        const generations = res.data || [];
        const toolCounts = {};
        
        generations.forEach((g) => {
          const type = g.generationType || "OTHER";
          toolCounts[type] = (toolCounts[type] || 0) + 1;
        });

        const chartData = Object.keys(toolCounts)
          .map((key) => ({
            name: key.replace(/_/g, " ").replace("GENERATE ", ""),
            count: toolCounts[key]
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 tools

        setData(chartData);
      })
      .catch((err) => console.error("Failed to load tool usage", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-64 bg-gray-100 border-4 border-brutal-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 bg-white border-4 border-brutal-black p-4 shadow-[4px_4px_0_#000] flex flex-col items-center justify-center text-center">
        <p className="font-bold text-gray-500">No tool usage data yet</p>
      </div>
    );
  }

  return (
    <div className="h-72 bg-white border-4 border-brutal-black p-4 shadow-[4px_4px_0_#000] flex flex-col">
      <h3 className="font-black uppercase tracking-wider mb-4 text-sm">Top Tools Used</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip 
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{ backgroundColor: "#000", color: "#fff", border: "2px solid #000", borderRadius: 0, fontWeight: "bold", fontSize: 12 }}
            />
            <Bar dataKey="count" barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
