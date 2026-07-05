import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ProgressChart({ data }) {
  const latest = data?.length || 0;

  return (
    <div className="w-full h-[540px] bg-[#111827]/95 rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex justify-between items-start mb-5">
        <div>
          <h2 className="text-white text-2xl font-bold">
            Mental Trends
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            {latest} snapshots analyzed
          </p>
        </div>

        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Anxiety
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Confidence
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Energy
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            Emotional
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="anxietyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="emotionalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            stroke="#374151"
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#9CA3AF" }}
            stroke="#374151"
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#0b1220",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              color: "white",
              boxShadow: "0 0 30px rgba(0,0,0,0.4)",
            }}
          />

          <Area
            type="monotone"
            dataKey="anxiety"
            stroke="#ef4444"
            fill="url(#anxietyGradient)"
            strokeWidth={3}
            animationDuration={2000}
            activeDot={{ r: 8 }}
          />

          <Area
            type="monotone"
            dataKey="confidence"
            stroke="#3b82f6"
            fill="url(#confidenceGradient)"
            strokeWidth={3}
            animationDuration={2000}
            activeDot={{ r: 8 }}
          />

          <Area
            type="monotone"
            dataKey="energy"
            stroke="#22c55e"
            fill="url(#energyGradient)"
            strokeWidth={3}
            animationDuration={2000}
            activeDot={{ r: 8 }}
          />

          <Area
            type="monotone"
            dataKey="emotionalHealth"
            stroke="#a855f7"
            fill="url(#emotionalGradient)"
            strokeWidth={3}
            animationDuration={2000}
            activeDot={{ r: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProgressChart;