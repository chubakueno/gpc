import { useLang } from "@/i18n/LanguageContext";

const CARDS = [
  { key: "decomp", cls: "border-[var(--color-accent)]/30", text: "text-[var(--color-accent)]" },
  { key: "optimal", cls: "border-[var(--color-accent-2)]/30", text: "text-[var(--color-accent-2)]" },
  { key: "overlap", cls: "border-[var(--color-accent-3)]/30", text: "text-[var(--color-accent-3)]" },
  { key: "dag", cls: "border-[var(--color-warn)]/30", text: "text-[var(--color-warn)]" },
  { key: "base", cls: "border-[var(--color-danger)]/30", text: "text-[var(--color-danger)]" },
] as const;

export function DPProperties() {
  const { t } = useLang();

  return (
    <div>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
        {t("dp.fund.props.title")}
      </h3>
      <p className="text-sm text-[var(--color-muted)] mb-4">{t("dp.fund.props.desc")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(({ key, cls, text }) => (
          <div key={key} className={`rounded-xl border ${cls} bg-[var(--color-surface)] p-4`}>
            <h4 className={`text-sm font-semibold mb-1.5 ${text}`}>
              {t(`dp.fund.props.${key}.title` as any)}
            </h4>
            <p className="text-sm text-[var(--color-muted)]">
              {t(`dp.fund.props.${key}.body` as any)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
