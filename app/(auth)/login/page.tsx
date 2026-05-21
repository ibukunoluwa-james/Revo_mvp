"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/FormField";
import PinInput from "@/components/PinInput";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"agent" | "admin">("agent");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginAgent = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      localStorage.setItem("agentId", data.agentId);
      localStorage.setItem("agentName", data.name);
      router.push("/collect");
    } catch {
      setError("Connection error. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Connection error. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rg-page p-4">
      <div className="grid grid-cols-[340px_1fr] rounded-2xl overflow-hidden border border-rg-border w-full max-w-[820px] bg-white shadow-sm max-md:grid-cols-1">
        {/* Left panel */}
        <div className="bg-rg-navy p-10 flex flex-col justify-between max-md:hidden">
          <div>
            <p className="text-rg-gold font-medium text-lg tracking-wide">
              Revo
            </p>
            <p className="text-white/35 text-[11px] uppercase tracking-widest mt-1">
              Revenue intelligence platform
            </p>
            <div className="h-px bg-white/[0.08] my-7" />
            <h1 className="text-white text-[26px] font-medium leading-snug mb-3">
              Recovering Nigeria&apos;s lost revenue — one state at a time.
            </h1>
            <p className="text-white/50 text-[13px] leading-relaxed">
              Every collection creates an instant, tamper-proof digital record.
              The taxpayer receives SMS confirmation directly.
            </p>

            <div className="mt-8 p-5 bg-white/[0.04] rounded-[10px] border border-white/[0.07]">
              <p className="text-rg-gold text-[28px] font-medium leading-none">
                ₦3.63T
              </p>
              <p className="text-white/38 text-[11px] mt-1 leading-snug">
                State IGR collected nationally in 2024
              </p>
              <p className="text-rg-teal-light text-[28px] font-medium leading-none mt-4">
                40–60%
              </p>
              <p className="text-white/38 text-[11px] mt-1 leading-snug">
                Estimated uncollected revenue potential
              </p>
            </div>
          </div>
          <p className="text-white/22 text-[11px] tracking-wide">
            Confidential · Demo build · 2026
          </p>
        </div>

        {/* Right panel */}
        <div className="bg-white p-11 flex flex-col justify-center max-md:p-8">
          <p className="text-[20px] font-medium text-rg-text-primary">
            Sign in
          </p>
          <p className="text-[13px] text-rg-text-muted mt-1 mb-7">
            Access your collection portal
          </p>

          {/* Tab toggle */}
          <div className="flex bg-rg-page rounded-[9px] p-[3px] gap-[3px] mb-7">
            {(["agent", "admin"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError("");
                }}
                className={`flex-1 py-2 rounded-[7px] text-[13px] font-medium transition-all
                  ${
                    tab === t
                      ? "bg-white text-rg-navy border border-rg-border"
                      : "text-rg-text-muted bg-transparent"
                  }`}
              >
                {t === "agent" ? "Field agent" : "State admin"}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-rg-orange-bg text-rg-orange text-[12px] rounded-[8px] border border-orange-200 p-3 mb-4">
              {error}
            </div>
          )}

          {tab === "agent" ? (
            <div className="space-y-5">
              <FormField label="Phone number">
                <input
                  type="tel"
                  placeholder="08XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="field-input"
                />
              </FormField>
              <FormField label="4-digit PIN">
                <PinInput value={pin} onChange={setPin} />
              </FormField>
              <button
                onClick={loginAgent}
                disabled={loading}
                className="w-full py-3 rounded-[9px] bg-rg-navy text-white text-[14px] font-medium disabled:opacity-50 hover:bg-rg-navy-mid transition-colors"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <FormField label="Email address">
                <input
                  type="email"
                  placeholder="admin@revo.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                />
              </FormField>
              <FormField label="Password">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                />
              </FormField>
              <button
                onClick={loginAdmin}
                disabled={loading}
                className="w-full py-3 rounded-[9px] bg-rg-navy text-white text-[14px] font-medium disabled:opacity-50 hover:bg-rg-navy-mid transition-colors"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
