"use client";

import { usePathname, useRouter } from "next/navigation";

const TITLES: Record<string, string> = {
  "/collect": "Record collection",
  "/history": "Collection history",
  "/summary": "Daily summary",
  "/dashboard": "Revenue dashboard",
  "/agents": "Field agents",
  "/flags": "Anomaly flags",
  "/reports": "Reports",
};

interface DashboardRow {
  time: string;
  agentName: string;
  streamName: string;
  amount: number;
  payerPhone: string;
  receiptRef: string;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = TITLES[pathname] ?? "Revo";
  const isDashboard = pathname === "/dashboard";

  const exportToday = async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    const header = [
      "Time",
      "Agent",
      "Revenue type",
      "Amount (NGN)",
      "Payer",
      "Receipt ID",
    ];
    const rows = (data.collections as DashboardRow[]).map((c) => [
      c.time,
      c.agentName,
      c.streamName,
      String(c.amount),
      c.payerPhone,
      c.receiptRef,
    ]);
    downloadCsv(
      `revo-${new Date().toISOString().slice(0, 10)}.csv`,
      [header, ...rows],
    );
  };

  const logout = () => {
    localStorage.removeItem("agentId");
    localStorage.removeItem("agentName");
    router.push("/login");
  };

  return (
    <header className="h-[54px] bg-white border-b border-rg-border flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <p className="text-[15px] font-medium text-rg-text-primary">{title}</p>
      </div>
      <div className="flex items-center gap-2">
        {isDashboard && (
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rg-teal" />
              Live · auto-refresh 30s
            </span>
            <button
              onClick={exportToday}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-rg-border bg-white text-[12px] text-rg-text-secondary hover:bg-rg-page transition-colors"
            >
              <i className="ti ti-download text-[13px]" aria-hidden="true" />
              Export
            </button>
            <button
              onClick={exportToday}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-rg-navy text-white text-[12px] font-medium hover:bg-rg-navy-mid transition-colors"
            >
              <i className="ti ti-file-text text-[13px]" aria-hidden="true" />
              SFTAS report
            </button>
          </>
        )}
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-rg-border bg-white text-[12px] text-rg-text-secondary hover:bg-rg-page transition-colors"
        >
          <i className="ti ti-logout text-[13px]" aria-hidden="true" />
          Log out
        </button>
      </div>
    </header>
  );
}
