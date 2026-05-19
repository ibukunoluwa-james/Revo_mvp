"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/FormField";
import ReceiptCard, { type ReceiptData } from "@/components/ReceiptCard";

const STREAMS = [
  "Market Levy",
  "Business Permit",
  "Street Trading",
  "Signage Fee",
];

export default function CollectPage() {
  const router = useRouter();
  const [agentId, setAgentId] = useState("");
  const [form, setForm] = useState({
    stream: STREAMS[0],
    amount: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({ todayTotal: 0, txCount: 0 });

  const loadSummary = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/agent/summary?agentId=${id}`);
      if (res.ok) setSummary(await res.json());
    } catch {
      /* summary is non-critical — keep last known values */
    }
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("agentId");
    if (!id) {
      router.push("/login");
      return;
    }
    // Hydrate the agent id from localStorage on mount — a one-time
    // read from an external store, not a render-driven update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAgentId(id);
    loadSummary(id);
  }, [router, loadSummary]);

  const amountNumber = parseInt(form.amount) || 0;

  const submit = async () => {
    setError("");
    if (!form.amount || !form.phone) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          streamName: form.stream,
          amountNaira: form.amount,
          payerPhone: form.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setReceipt({
        receiptId: data.receiptRef,
        amount: parseInt(data.amount),
        streamName: data.streamName,
        payerPhone: data.payerPhone,
        time: new Date().toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setForm({ ...form, amount: "", phone: "" });
      loadSummary(agentId);
    } catch {
      setError("Connection error. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm({ stream: STREAMS[0], amount: "", phone: "" });
    setError("");
  };

  return (
    <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">
      {/* Collection form card */}
      <div className="bg-white rounded-xl border border-rg-border p-6 h-fit">
        <p className="text-[14px] font-medium text-rg-text-primary mb-5">
          Collection details
        </p>

        {error && (
          <div className="bg-rg-orange-bg text-rg-orange text-[12px] rounded-[8px] border border-orange-200 p-3 mb-4">
            {error}
          </div>
        )}

        <FormField label="Revenue type">
          <select
            value={form.stream}
            onChange={(e) => setForm({ ...form, stream: e.target.value })}
            className="w-full bg-rg-page border border-rg-border rounded-[8px]
              px-3 py-2.5 text-[14px] text-rg-text-primary outline-none
              focus:border-rg-blue focus:bg-white appearance-none"
          >
            {STREAMS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-3 mt-4 max-sm:grid-cols-1">
          <FormField label="Amount (₦)">
            <input
              type="number"
              className="field-input"
              placeholder="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </FormField>
          <FormField label="Payer phone">
            <input
              type="tel"
              className="field-input"
              placeholder="08XXXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </FormField>
        </div>

        <p className="text-[11px] text-rg-text-muted mt-2">
          SMS receipt fires directly to the payer — not via you.
        </p>

        <hr className="border-rg-border-light my-5" />

        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-50 rounded-[8px] border border-emerald-200 mb-4 text-[12px] text-emerald-800">
          <i
            className="ti ti-send text-[15px] text-rg-teal flex-shrink-0"
            aria-hidden="true"
          />
          SMS confirmation will fire to{" "}
          {form.phone || "the payer"} the moment you confirm.
        </div>

        <div className="flex items-center justify-between px-4 py-3.5 bg-rg-gold-bg rounded-[9px] border border-rg-gold-border mb-4">
          <p className="text-[13px] text-amber-900">Amount to collect</p>
          <p className="text-[22px] font-medium text-rg-gold-text">
            ₦{amountNumber.toLocaleString()}
          </p>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-[9px] bg-rg-navy text-white text-[14px] font-medium disabled:opacity-50 hover:bg-rg-navy-mid transition-colors"
        >
          {loading ? "Recording…" : "Confirm and record collection"}
        </button>
        <button
          onClick={clearForm}
          className="w-full py-2.5 rounded-[9px] border border-rg-border bg-white text-[13px] text-rg-text-secondary mt-2 hover:bg-rg-page transition-colors"
        >
          Clear form
        </button>
      </div>

      {/* Right panel */}
      <div className="flex flex-col gap-3">
        <ReceiptCard receipt={receipt} />

        <div className="bg-white rounded-xl border border-rg-border p-5">
          <p className="text-[11px] font-medium text-rg-text-muted uppercase tracking-[.05em] mb-3">
            Today
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-rg-page rounded-[8px] p-3 border border-rg-border">
              <p className="text-[18px] font-medium text-rg-gold-text">
                ₦{summary.todayTotal.toLocaleString()}
              </p>
              <p className="text-[11px] text-rg-text-muted mt-0.5 uppercase tracking-wide">
                Collected
              </p>
            </div>
            <div className="bg-rg-page rounded-[8px] p-3 border border-rg-border">
              <p className="text-[18px] font-medium text-rg-text-primary">
                {summary.txCount}
              </p>
              <p className="text-[11px] text-rg-text-muted mt-0.5 uppercase tracking-wide">
                Transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
