import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { TabGroup } from "@/components/shared/TabGroup";
import { SADemo }     from "./SADemo";
import { SAAnalysis } from "./SAAnalysis";
import { SACode }     from "./SACode";

export default function SAPage() {
  const { t } = useLang();
  const [tab, setTab] = useState("demo");

  const tabs = [
    { id: "demo",     label: t("sa.tab.demo") },
    { id: "analysis", label: t("sa.tab.analysis") },
    { id: "code",     label: t("sa.tab.code") },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{t("sa.title")}</h1>
        <p className="text-[var(--color-muted)]">{t("sa.subtitle")}</p>
      </div>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-8" />
      {tab === "demo"     && <SADemo />}
      {tab === "analysis" && <SAAnalysis />}
      {tab === "code"     && <SACode />}
    </main>
  );
}
