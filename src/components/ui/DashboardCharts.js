"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export function CreditUsageChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/domain/generations?limit=100")
      .then((res) => {
        const generations = res.data || [];
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
      <div className="h-72 rounded-2xl border border-(--hairline) bg-(--surface-card) flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-(--primary)" />
      </div>
    );
  }

  return (
    <div className="h-72 rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-sm flex flex-col transition-colors">
      <h3 className="font-serif text-sm text-(--ink) mb-4">Credit Usage (7 Days)</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="creditUsageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: "var(--muted)" }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "var(--muted)" }} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--surface-card)", 
                color: "var(--ink)", 
                border: "1px solid var(--hairline)", 
                borderRadius: "12px", 
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
              }}
              itemStyle={{ color: "var(--primary)" }}
            />
            <Area 
              type="monotone" 
              dataKey="credits" 
              stroke="var(--primary)" 
              strokeWidth={2} 
              fill="url(#creditUsageGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
            name: key.replace(/_/g, " ").replace("GENERATE", "").trim(),
            count: toolCounts[key]
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setData(chartData);
      })
      .catch((err) => console.error("Failed to load tool usage", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-72 rounded-2xl border border-(--hairline) bg-(--surface-card) flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-(--primary)" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-72 rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-sm flex flex-col items-center justify-center text-center">
        <p className="text-xs text-(--muted)">No tool usage data recorded yet</p>
      </div>
    );
  }

  return (
    <div className="h-72 rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-sm flex flex-col transition-colors">
      <h3 className="font-serif text-sm text-(--ink) mb-4">Top Tools Used</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 10, fill: "var(--muted)" }} 
              axisLine={false} 
              tickLine={false} 
              width={90} 
            />
            <Tooltip 
              cursor={{ fill: "var(--surface-soft)" }}
              contentStyle={{ 
                backgroundColor: "var(--surface-card)", 
                color: "var(--ink)", 
                border: "1px solid var(--hairline)", 
                borderRadius: "12px", 
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
              }}
            />
            <Bar dataKey="count" barSize={16} radius={[0, 6, 6, 0]}>
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="var(--primary)" 
                  fillOpacity={Math.max(0.4, 1 - index * 0.15)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
