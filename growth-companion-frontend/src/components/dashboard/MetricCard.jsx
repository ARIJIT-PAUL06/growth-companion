import React, { useEffect, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const MetricCard = ({ title, value, color }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= value) {
        setAnimatedValue(value);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const data = [{ value: animatedValue }];

  const getStatus = () => {
    if (title === "Anxiety") {
      if (value >= 75) return "High";
      if (value >= 40) return "Moderate";
      return "Low";
    }

    if (value >= 75) return "Excellent";
    if (value >= 40) return "Moderate";
    return "Low";
  };

  const getGlow = () => {
    if (color === "#22c55e") return "shadow-[0_0_40px_rgba(34,197,94,0.15)]";
    if (color === "#ef4444") return "shadow-[0_0_40px_rgba(239,68,68,0.15)]";
    if (color === "#3b82f6") return "shadow-[0_0_40px_rgba(59,130,246,0.15)]";
    return "shadow-[0_0_40px_rgba(245,158,11,0.15)]";
  };

  return (
    <div
      className={`group relative overflow-hidden bg-[#111827]/95 rounded-3xl p-5 border border-white/10 transition-all duration-500 hover:-translate-y-2 ${getGlow()}`}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-all duration-500"
        style={{ backgroundColor: color }}
      />

      <p className="text-gray-400 text-sm mb-3 relative z-10">
        {title}
      </p>

      <div className="h-[180px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={210}
            endAngle={-30}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />

            <RadialBar
              background
              dataKey="value"
              cornerRadius={12}
              fill={color}
              animationDuration={1200}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
          <h2 className="text-5xl font-bold tracking-tight">
            {animatedValue}
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            {getStatus()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;