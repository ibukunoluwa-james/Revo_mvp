import Link from "next/link";

export interface NavItemProps {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  badge?: string | number;
}

/**
 * A single sidebar navigation row. The active item gets a gold tinted
 * background and border; everything else is muted white that brightens
 * on hover.
 */
export default function NavItem({
  icon,
  label,
  href,
  active,
  badge,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-[13px]
        mb-0.5 transition-colors
        ${
          active
            ? "bg-rg-gold/[0.14] text-rg-gold border border-rg-gold/[0.22]"
            : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
        }`}
    >
      <i className={`ti ${icon} text-[15px]`} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="bg-rg-orange/30 text-orange-300 text-[10px] px-1.5 py-px rounded-full">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
