import type { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  noPad?: boolean;
}

export function SectionCard({ children, className = "", noPad = false }: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] ${noPad ? "" : "p-6"} ${className}`}
    >
      {children}
    </div>
  );
}
