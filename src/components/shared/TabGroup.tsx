interface Tab {
  id: string;
  label: string;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function TabGroup({ tabs, activeTab, onChange, className = "" }: TabGroupProps) {
  return (
    <div
      className={`flex flex-wrap gap-1 p-1 rounded-xl bg-[var(--color-surface-2)] ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTab}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${tab.id === activeTab
              ? "bg-[var(--color-accent)] text-white shadow-sm"
              : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
