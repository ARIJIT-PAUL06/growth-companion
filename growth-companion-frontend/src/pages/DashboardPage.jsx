import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import ProgressChart from "../components/dashboard/ProgressChart";
import SignalChart from "../components/dashboard/SignalChart";
import MetricCard from "../components/dashboard/MetricCard";

const DashboardPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [topSignals, setTopSignals] = useState({});
  const [summary, setSummary] = useState("");
  const [memoryInsights, setMemoryInsights] = useState(null);
  const [burnout, setBurnout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshingAI, setRefreshingAI] = useState(false);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
  try {
    const res = await fetch(
      `${SERVER_URL}/api/progress/dashboard`
    );

    const data = await res.json();

    setHistoryData(data.history || []);
    setLatestSnapshot(data.latestSnapshot || null);
    setTopSignals(data.topSignals || {});
    setSummary(data.summary || "");
    setMemoryInsights(data.memoryInsights || null);
    setBurnout(data.burnout || null);

  } catch (error) {
    console.error("Dashboard fetch error:", error);
  } finally {
    setLoading(false);
  }
};

const refreshAIAnalysis = async () => {
  try {
    setRefreshingAI(true);

    const res = await fetch(
      `${SERVER_URL}/api/progress/refresh-ai`
    );

    const data = await res.json();

    setMemoryInsights(data.memoryInsights || null);
    setBurnout(data.burnout || null);

  } catch (error) {
    console.error("Refresh AI error:", error);
  } finally {
    setRefreshingAI(false);
  }
};
  const getPrimaryStressor = () => {
    if (!topSignals || Object.keys(topSignals).length === 0) {
      return "None";
    }

    const sorted = Object.entries(topSignals).sort(
      (a, b) => b[1] - a[1]
    );

    return sorted[0][0]
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getRiskLevel = () => {
    if (!latestSnapshot) return "Unknown";

    const riskScore =
      latestSnapshot.anxiety +
      (100 - latestSnapshot.energy) +
      (100 - latestSnapshot.emotionalHealth);

    if (riskScore > 220) return "High";
    if (riskScore > 150) return "Moderate";
    return "Stable";
  };

  const getGrowthStatus = () => {
    if (!historyData || historyData.length < 5) {
      return "Insufficient Data";
    }

    const first = historyData[0];
    const last = historyData[historyData.length - 1];

    const improvement =
      (first.anxiety - last.anxiety) +
      (last.confidence - first.confidence) +
      (last.energy - first.energy);

    if (improvement > 20) return "Improving";
    if (improvement < -20) return "Declining";
    return "Stable";
  };

  return (
    <div className="relative bg-gradient-to-b from-[#242124] to-black text-white overflow-hidden">

      {/* Background Glow Effects */}

<div
  className="absolute pointer-events-none"
  style={{
    top: "-100px",
    right: "-100px",
    width: "520px",
    height: "520px",
    borderRadius: "50%",
    background: "rgba(168, 85, 247, 0.35)",
    filter: "blur(140px)",
  }}
/>

<div
  className="absolute pointer-events-none"
  style={{
    top: "30%",
    left: "12%",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.28)",
    filter: "blur(140px)",
  }}
/>

<div
  className="absolute pointer-events-none"
  style={{
    bottom: "-120px",
    left: "35%",
    width: "460px",
    height: "460px",
    borderRadius: "50%",
    background: "rgba(34, 211, 238, 0.25)",
    filter: "blur(150px)",
  }}
/>

      <div className="relative z-10 flex h-screen w-screen">
        <Sidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
  <h1 className="text-4xl font-bold">
    Cognitive Dashboard
  </h1>

  <button
    onClick={() =>
      window.open(
        `${SERVER_URL}/api/progress/report`,
        "_blank"
      )
    }
    className="group relative overflow-hidden px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)]"
  >
    <span className="relative z-10">
      📄 Generate Weekly Report
    </span>

    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-white/10" />
  </button>
</div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 p-6">
              Loading dashboard...
            </div>
          ) : (
            <>
              {/* Metric Cards */}
              {latestSnapshot && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                  <MetricCard
                    title="Emotional Health"
                    value={latestSnapshot.emotionalHealth}
                    color="#22c55e"
                  />

                  <MetricCard
                    title="Anxiety"
                    value={latestSnapshot.anxiety}
                    color="#ef4444"
                  />

                  <MetricCard
                    title="Confidence"
                    value={latestSnapshot.confidence}
                    color="#3b82f6"
                  />

                  <MetricCard
                    title="Energy"
                    value={latestSnapshot.energy}
                    color="#f59e0b"
                  />
                </div>
              )}

              {/* Trend Graph */}
              <div className="mb-8">
                <ProgressChart data={historyData} />
              </div>

              {/* Signal Chart */}
              <div className="mb-8">
                <SignalChart signals={topSignals} />
              </div>

              {/* AI Insights */}
<div className="mb-10">
  <div className="mb-6">
  <h2 className="text-3xl font-bold tracking-tight">
    AI Insights
  </h2>
</div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
    {/* Primary Stressor */}
    <div className="group relative overflow-hidden rounded-3xl border border-red-500/20 bg-[#111827]/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-orange-400" />
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all" />

      <p className="text-gray-400 text-sm mb-3 uppercase tracking-wide">
        Primary Stressor
      </p>

      <div className="flex items-center gap-3">
        <span className="text-2xl"></span>
        <h3 className="text-2xl font-bold text-red-400">
          {getPrimaryStressor()}
        </h3>
      </div>
    </div>

    {/* Risk Level */}
    <div className="group relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#111827]/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(250,204,21,0.15)]">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 to-orange-400" />
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all" />

      <p className="text-gray-400 text-sm mb-3 uppercase tracking-wide">
        Risk Level
      </p>

      <div className="flex items-center gap-3">
        <span className="text-2xl"></span>
        <h3 className="text-2xl font-bold text-yellow-400">
          {getRiskLevel()}
        </h3>
      </div>
    </div>

    {/* Growth Status */}
    <div className="group relative overflow-hidden rounded-3xl border border-green-500/20 bg-[#111827]/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500" />
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all" />

      <p className="text-gray-400 text-sm mb-3 uppercase tracking-wide">
        Growth Status
      </p>

      <div className="flex items-center gap-3">
        <span className="text-2xl"></span>
        <h3 className="text-2xl font-bold text-green-400">
          {getGrowthStatus()}
        </h3>
      </div>
    </div>
  </div>

  {/* Cognitive Insight */}
  <div className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-[#111827]/95 p-7 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]">
    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500" />
    <div className="absolute -top-16 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">🧠</span>
      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Cognitive Insight
      </h3>
    </div>

    <p className="text-gray-300 leading-relaxed text-[15px]">
      {summary}
    </p>
  </div>

  {/* Memory Insights */}
{memoryInsights && (
  <div className="mt-8 group relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#111827]/95 p-7 transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]">
    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

  <div className="flex items-center justify-between mb-6">

  <div className="flex items-center gap-3">
    <span className="text-2xl">🧠</span>

    <h3 className="text-2xl font-bold text-cyan-300">
      Memory Insights
    </h3>

    <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
      Powered by Cognee
    </span>
  </div>

  <button
    onClick={refreshAIAnalysis}
    disabled={refreshingAI}
    className="px-5 py-2 rounded-xl font-semibold
               bg-gradient-to-r from-cyan-500 to-blue-600
               hover:scale-105 transition-all duration-300
               hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]
               disabled:opacity-50"
  >
    {refreshingAI ? (
      <>
        <span className="animate-spin inline-block mr-2">⟳</span>
        Generating...
      </>
    ) : (
      <>✨ Analyze Latest Progress</>
    )}
  </button>

</div>

    <div className="space-y-6">
      <div>
        <p className="text-cyan-300 font-semibold mb-2">
          Recurring Themes
        </p>

        <div className="flex flex-wrap gap-2">
          {memoryInsights.recurringThemes?.map((theme, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-sm"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-cyan-300 font-semibold mb-2">
          Behaviour Pattern
        </p>

        <p className="text-gray-300">
          {memoryInsights.behaviorPattern}
        </p>
      </div>

      <div>
        <p className="text-cyan-300 font-semibold mb-2">
          Positive Growth
        </p>

        <p className="text-gray-300">
          {memoryInsights.positiveGrowth}
        </p>
      </div>

      <div>
        <p className="text-cyan-300 font-semibold mb-2">
          Memory Summary
        </p>

        <p className="text-gray-300">
          {memoryInsights.memorySummary}
        </p>
      </div>
    </div>
  </div>
)}

{/* Burnout Prediction */}
{burnout && (
  <div className="mt-8 rounded-3xl border border-orange-500/20 bg-[#111827]/95 p-7">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔥</span>

        <h3 className="text-2xl font-bold text-orange-300">
          Burnout Prediction
        </h3>
        <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-300">
        Powered by Cognee
      </span>
      </div>

      
    </div>

    {burnout.status === "collecting_data" ? (
      <div>
        <p className="text-lg font-semibold text-orange-300 mb-4">
          Learning Behaviour...
        </p>

        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-red-500"
            style={{
              width: `${Math.min(
                100,
                (burnout.progress.snapshots /
                  burnout.progress.requiredSnapshots) *
                  100
              )}%`,
            }}
          />
        </div>

        <p className="text-gray-300">
          Snapshots {burnout.progress.snapshots} /{" "}
          {burnout.progress.requiredSnapshots}
        </p>

        <p className="text-gray-400 mt-3">
          {burnout.message}
        </p>
      </div>
    ) : (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-gray-400 text-sm">
              Predicted Risk
            </p>

            <h2 className="text-2xl font-bold text-orange-300">
              {burnout.risk}
            </h2>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-gray-400 text-sm">
              Score
            </p>

            <h2 className="text-2xl font-bold">
              {burnout.score}
            </h2>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-gray-400 text-sm">
              Prediction Confidence
            </p>

            <h2 className="text-2xl font-bold">
              {burnout.confidence}%
            </h2>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-gray-400 text-sm">
              Estimated Time
            </p>

            <h2 className="text-2xl font-bold">
              {burnout.daysToBurnout} days
            </h2>
          </div>
        </div>

        <div>
          <p className="text-orange-300 font-semibold mb-3">
            Evidence
          </p>

          <ul className="space-y-2">
            {burnout.evidence?.map((item, index) => (
              <li key={index} className="text-gray-300">
                ✓ {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            This prediction is generated from long-term behavioural
            patterns and Cognee memory relationships. It is intended
            for self-awareness and is not a medical diagnosis.
          </p>
        </div>
      </div>
    )}
  </div>
)}

      </div>
    </>
  )}
      </div>
    </div>
  </div>
);
};

export default DashboardPage;