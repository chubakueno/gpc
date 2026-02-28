import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{title}</h1>
        {subtitle && (
          <p className="text-[var(--color-muted)] text-base">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </main>
  );
}
