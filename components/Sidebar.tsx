"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NavItem from "./NavItem";

type Variant = "agent" | "admin";

interface NavGroup {
  section: string;
  items: { icon: string; label: string; href: string; badge?: string | number }[];
}

const NAV: Record<Variant, { context: string; role: string; groups: NavGroup[] }> = {
  agent: {
    context: "Field agent portal",
    role: "Field agent",
    groups: [
      {
        section: "Collection",
        items: [
          { icon: "ti-cash-register", label: "Collect", href: "/collect" },
          { icon: "ti-history", label: "History", href: "/history" },
          { icon: "ti-chart-bar", label: "Daily summary", href: "/summary" },
        ],
      },
    ],
  },
  admin: {
    context: "Anambra State IRS",
    role: "State administrator",
    groups: [
      {
        section: "Overview",
        items: [
          { icon: "ti-layout-dashboard", label: "Dashboard", href: "/dashboard" },
        ],
      },
      {
        section: "Oversight",
        items: [
          { icon: "ti-users", label: "Agents", href: "/agents" },
          { icon: "ti-flag-3", label: "Flags", href: "/flags", badge: "!" },
          { icon: "ti-report", label: "Reports", href: "/reports" },
        ],
      },
    ],
  },
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Sidebar({ variant }: { variant: Variant }) {
  const pathname = usePathname();
  const config = NAV[variant];
  const [name, setName] = useState(
    variant === "admin" ? "Administrator" : "Field agent",
  );

  useEffect(() => {
    if (variant === "agent") {
      const stored = localStorage.getItem("agentName");
      // One-time read from localStorage (unavailable during SSR), so the
      // effect is the correct place for it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setName(stored);
    }
  }, [variant]);

  return (
    <aside className="w-[210px] flex-shrink-0 bg-rg-navy flex flex-col h-screen sticky top-0">
      {/* Zone 1 — Brand header */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <p className="text-rg-gold font-medium text-[14px] tracking-wide">
          Revo
        </p>
        <p className="text-white/35 text-[11px] mt-0.5 uppercase tracking-widest">
          {config.context}
        </p>
      </div>

      {/* Zone 2 + 3 — Navigation (flex-1 pushes footer down) */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {config.groups.map((group) => (
          <div key={group.section}>
            <p className="text-white/25 text-[10px] uppercase tracking-[.1em] px-2.5 pt-2 pb-1.5 mt-1">
              {group.section}
            </p>
            {group.items.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                badge={item.badge}
                active={pathname === item.href}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Zone 4 — User footer */}
      <div className="px-4 py-4 border-t border-white/[0.07] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-rg-gold/[0.18] border border-rg-gold/[0.28] flex items-center justify-center text-rg-gold text-[11px] font-medium flex-shrink-0">
          {initialsOf(name)}
        </div>
        <div className="min-w-0">
          <p className="text-white/80 text-[12px] font-medium truncate">{name}</p>
          <p className="text-white/30 text-[11px]">{config.role}</p>
        </div>
      </div>
    </aside>
  );
}
