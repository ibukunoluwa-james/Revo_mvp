/** Avatar + name cell used in the transactions table. */
export default function AgentCell({
  initials,
  name,
  flagged,
}: {
  initials: string;
  name: string;
  flagged?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center
          text-[11px] font-medium flex-shrink-0
          ${
            flagged
              ? "bg-amber-50 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
      >
        {initials}
      </div>
      <span>{name}</span>
    </div>
  );
}
