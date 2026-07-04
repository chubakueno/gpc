import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { TabGroup } from "@/components/shared/TabGroup";
import { DPIntro } from "./DPIntro";
import { DPFundamentals } from "./DPFundamentals";
import { CoinChangeDemo } from "./CoinChangeDemo";
import { KnapsackDemo } from "./KnapsackDemo";
import { LCSDemo } from "./LCSDemo";
import { LISDemo } from "./LISDemo";
import { DPCode } from "./DPCode";

export default function DPPage() {
  const { t } = useLang();
  const [tab, setTab] = useState("intro");

  const tabs = [
    { id: "intro",    label: t("dp.tab.intro") },
    { id: "fundamentals", label: t("dp.tab.fundamentals") },
    { id: "coins",    label: t("dp.tab.coins") },
    { id: "knapsack", label: t("dp.tab.knapsack") },
    { id: "lcs",      label: t("dp.tab.lcs") },
    { id: "lis",      label: t("dp.tab.lis") },
    { id: "code",     label: t("dp.tab.code") },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{t("dp.title")}</h1>
        <p className="text-[var(--color-muted)]">{t("dp.subtitle")}</p>
      </div>

      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-8" />

      {tab === "intro"    && <DPIntro />}
      {tab === "fundamentals" && <DPFundamentals />}
      {tab === "coins"    && <CoinChangeDemo />}
      {tab === "knapsack" && <KnapsackDemo />}
      {tab === "lcs"      && <LCSDemo />}
      {tab === "lis"      && <LISDemo />}
      {tab === "code"     && <DPCode />}
    </main>
  );
}
