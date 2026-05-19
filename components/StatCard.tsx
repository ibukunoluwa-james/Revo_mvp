export type StatAccent = "gold" | "teal" | "blue" | "orange";

const ACCENT: Record<StatAccent, { bar: string; value: string }> = {
  gold: { bar: "bg-rg-gold", value: "text-rg-gold-text" },
  teal: { bar: "bg-rg-teal", value: "text-emerald-800" },
  blue: { bar: "bg-rg-blue", value: "text-blue-900" },
  orange: { bar: "bg-rg-orange", value: "text-amber-900" },
};

/** Dashboard metric card with a 3px coloured top strip. */
export default function StatCard({
  label,
  value,
  change,
  accent,
}: {
  label: string;
  value: string;
  change: string;
  accent: StatAccent;
}) {
  const a = ACCENT[accent];
  return (
    <div className="bg-white rounded-[10px] border border-rg-border overflow-hidden">
      <div className={`h-[3px] ${a.bar}`} />
      <div className="p-4">
        <p className="text-[11px] text-rg-text-muted uppercase tracking-[.06em] mb-2">
          {label}
        </p>
        <p className={`text-[24px] font-medium leading-none ${a.value}`}>
          {value}
        </p>
        <p className="text-[11px] mt-1.5 text-rg-text-muted">{change}</p>
      </div>
    </div>
  );
}
