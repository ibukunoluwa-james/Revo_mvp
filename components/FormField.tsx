import type { ReactNode } from "react";

/** Label + input wrapper used consistently for every form field. */
export default function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-rg-text-secondary uppercase tracking-[.07em] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
