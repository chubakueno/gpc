import { useLang } from "@/i18n/LanguageContext";
import { DPProperties } from "./DPProperties";
import { TopDownBottomUpCompare } from "./TopDownBottomUpCompare";
import { DAGVisualization } from "./DAGVisualization";

export function DPFundamentals() {
  const { t } = useLang();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("dp.fund.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("dp.fund.subtitle")}</p>
      </div>

      <DPProperties />
      <TopDownBottomUpCompare />
      <DAGVisualization />
    </div>
  );
}
