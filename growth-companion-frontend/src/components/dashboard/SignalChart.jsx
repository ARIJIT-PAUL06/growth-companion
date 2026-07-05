import React from "react";

const SignalChart = ({ signals }) => {
  const data = Object.entries(signals)
    .map(([name, value]) => ({
      signal: name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      score: value,
    }))
    .sort((a, b) => b.score - a.score);

  const getBarColor = (score) => {
    if (score >= 85) return "from-red-500 to-orange-400";
    if (score >= 60) return "from-yellow-500 to-orange-300";
    return "from-green-500 to-emerald-400";
  };

  return (
    <div className="w-full bg-[#111827] rounded-3xl p-6 border border-white/10 shadow-xl">
      <h2 className="text-white text-2xl font-semibold mb-6">
        Dominant Stress Signals
      </h2>

      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 font-medium">
                {item.signal}
              </span>

              <span className="text-white font-bold">
                {item.score}%
              </span>
            </div>

            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getBarColor(
                  item.score
                )} transition-all duration-700 hover:scale-y-110 origin-left`}
                style={{
                  width: `${item.score}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignalChart;