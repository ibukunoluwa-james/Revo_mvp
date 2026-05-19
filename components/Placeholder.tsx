/**
 * Lightweight "next milestone" panel for screens listed in the file map
 * but not yet specified in detail (history, summary, agents, flags, reports).
 * Keeps the navigation coherent without faking data.
 */
export default function Placeholder({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="bg-white rounded-xl border border-rg-border p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-rg-gold-bg border border-rg-gold-border flex items-center justify-center mx-auto mb-4">
          <i
            className={`ti ${icon} text-rg-gold-text text-[20px]`}
            aria-hidden="true"
          />
        </div>
        <p className="text-[16px] font-medium text-rg-text-primary mb-1.5">
          {title}
        </p>
        <p className="text-[13px] text-rg-text-muted max-w-md mx-auto">
          {description}
        </p>
        <span className="inline-block mt-5 px-3 py-1 rounded-full bg-rg-page border border-rg-border text-[11px] font-medium text-rg-text-muted uppercase tracking-[.06em]">
          Planned — phase 2
        </span>
      </div>
    </div>
  );
}
