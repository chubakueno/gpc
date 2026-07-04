import { useLang } from "@/i18n/LanguageContext";

const ROWS = ["style", "states", "order", "stack", "space"] as const;

export function TopDownBottomUpCompare() {
  const { t } = useLang();

  return (
    <div>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
        {t("dp.fund.tdbu.title")}
      </h3>
      <p className="text-sm text-[var(--color-muted)] mb-4">{t("dp.fund.tdbu.desc")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl border border-[var(--color-accent-2)]/30 bg-[var(--color-surface)] p-4">
          <h4 className="text-sm font-semibold text-[var(--color-accent-2)] mb-1.5">
            {t("dp.intro.concepts.memo.title")}
          </h4>
          <p className="text-sm text-[var(--color-muted)]">{t("dp.intro.concepts.memo.body")}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-warn)]/30 bg-[var(--color-surface)] p-4">
          <h4 className="text-sm font-semibold text-[var(--color-warn)] mb-1.5">
            {t("dp.intro.concepts.tab.title")}
          </h4>
          <p className="text-sm text-[var(--color-muted)]">{t("dp.intro.concepts.tab.body")}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-2)] text-[var(--color-muted)] text-xs">
              <th className="text-left font-medium px-4 py-2">{t("dp.fund.tdbu.table.dimension")}</th>
              <th className="text-left font-medium px-4 py-2 text-[var(--color-accent-2)]">
                {t("dp.fund.tdbu.table.topdown")}
              </th>
              <th className="text-left font-medium px-4 py-2 text-[var(--color-warn)]">
                {t("dp.fund.tdbu.table.bottomup")}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row}
                className={i % 2 === 1 ? "bg-[var(--color-surface)]/40" : ""}
              >
                <td className="px-4 py-2.5 font-medium text-[var(--color-text)] align-top">
                  {t(`dp.fund.tdbu.row.${row}.label` as any)}
                </td>
                <td className="px-4 py-2.5 text-[var(--color-muted)] align-top">
                  {t(`dp.fund.tdbu.row.${row}.td` as any)}
                </td>
                <td className="px-4 py-2.5 text-[var(--color-muted)] align-top">
                  {t(`dp.fund.tdbu.row.${row}.bu` as any)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
