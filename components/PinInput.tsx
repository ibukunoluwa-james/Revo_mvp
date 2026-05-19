"use client";

import { useRef } from "react";

/**
 * Six-box PIN display backed by a single hidden password input. The boxes
 * are purely visual — they reflect how many digits have been typed.
 */
export default function PinInput({
  value,
  onChange,
  length = 4,
}: {
  value: string;
  onChange: (next: string) => void;
  length?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className="sr-only"
        autoFocus
      />
      <div
        className="flex gap-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-[42px] h-[42px] rounded-[8px] border flex items-center
              justify-center transition-colors
              ${
                i < value.length
                  ? "bg-rg-navy border-rg-navy"
                  : "bg-rg-page border-rg-border"
              }`}
          >
            {i < value.length && (
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
