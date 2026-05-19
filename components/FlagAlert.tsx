"use client";

import { useRouter } from "next/navigation";

/** Orange anomaly alert bar shown below the dashboard table. */
export default function FlagAlert({
  count,
  summary,
}: {
  count: number;
  summary: string;
}) {
  const router = useRouter();
  if (count <= 0) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3.5 bg-rg-orange-bg rounded-[10px] border border-orange-200 mt-3.5">
      <div className="flex items-center gap-3">
        <i
          className="ti ti-alert-triangle text-rg-orange text-[18px] flex-shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-[13px] font-medium text-amber-900">
            {count} anomaly {count === 1 ? "flag requires" : "flags require"} review
          </p>
          <p className="text-[12px] text-amber-800 mt-0.5">{summary}</p>
        </div>
      </div>
      <button
        onClick={() => router.push("/flags")}
        className="px-4 py-1.5 bg-rg-orange text-white rounded-[7px] text-[12px] font-medium whitespace-nowrap hover:opacity-90 transition-opacity"
      >
        Review flags
      </button>
    </div>
  );
}
