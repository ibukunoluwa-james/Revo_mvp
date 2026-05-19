"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import AgentCell from "@/components/AgentCell";
import FlagAlert from "@/components/FlagAlert";

interface Collection {
  id: string;
  agentName: string;
  agentInitials: string;
  streamName: string;
  amount: number;
  payerPhone: string;
  receiptRef: string;
  time: string;
  flagged: boolean;
}

interface Stats {
  todayTotal: number;
  monthTotal: number;
  agentCount: number;
  totalAgents: number;
  openFlags: number;
  collections: Collection[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Async data fetch on mount + polling — state lands in a promise
    // callback, not synchronously, so cascading renders don't apply.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-[13px] text-rg-text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Date row */}
      <p className="text-[13px] text-rg-text-muted mb-5">
        {new Date().toLocaleDateString("en-NG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <StatCard
          label="Collected today"
          value={`₦${stats.todayTotal.toLocaleString()}`}
          change={`${stats.collections.length} transactions today`}
          accent="gold"
        />
        <StatCard
          label="This month"
          value={`₦${stats.monthTotal.toLocaleString()}`}
          change="Month to date"
          accent="teal"
        />
        <StatCard
          label="Active agents"
          value={stats.agentCount.toString()}
          change={`of ${stats.totalAgents} on roster`}
          accent="blue"
        />
        <StatCard
          label="Open flags"
          value={stats.openFlags.toString()}
          change={stats.openFlags > 0 ? "Needs review" : "All clear"}
          accent="orange"
        />
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-xl border border-rg-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-rg-border-light">
          <p className="text-[14px] font-medium text-rg-text-primary">
            Today&apos;s collections ({stats.collections.length})
          </p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 text-[12px] text-rg-blue hover:underline"
          >
            <i className="ti ti-refresh text-[13px]" aria-hidden="true" />
            Refresh
          </button>
        </div>

        {stats.collections.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-rg-text-muted">
            No collections recorded today yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[13%]" />
                <col className="w-[17%]" />
                <col className="w-[14%]" />
                <col className="w-[9%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead className="bg-rg-page text-[11px] uppercase text-rg-text-muted tracking-[.06em]">
                <tr>
                  {[
                    "Agent",
                    "Revenue type",
                    "Amount",
                    "Payer",
                    "Receipt ID",
                    "Time",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rg-border-light">
                {stats.collections.map((c) => (
                  <tr key={c.id} className="hover:bg-rg-page">
                    <td className="px-4 py-3 text-rg-text-primary">
                      <AgentCell
                        initials={c.agentInitials}
                        name={c.agentName}
                        flagged={c.flagged}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-px rounded text-[11px] font-medium bg-emerald-50 text-emerald-800">
                        {c.streamName}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-rg-gold-text">
                      ₦{c.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-rg-text-secondary">
                      {c.payerPhone}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-rg-text-muted tracking-wide">
                      {c.receiptRef}
                    </td>
                    <td className="px-4 py-3 text-rg-text-muted">{c.time}</td>
                    <td className="px-4 py-3">
                      {c.flagged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-px rounded text-[11px] font-medium bg-amber-50 text-amber-800">
                          <i
                            className="ti ti-alert-triangle text-[11px]"
                            aria-hidden="true"
                          />
                          Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                          <i
                            className="ti ti-check text-[11px]"
                            aria-hidden="true"
                          />
                          Synced
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-3 border-t border-rg-border-light bg-rg-page text-[12px] text-rg-text-muted">
          <span>Showing {stats.collections.length} of today&apos;s records</span>
          <span>Auto-refreshes every 30s</span>
        </div>
      </div>

      {/* Anomaly flag alert bar */}
      <FlagAlert
        count={stats.openFlags}
        summary="Collections of ₦50,000 or more are held for manual review."
      />
    </div>
  );
}
