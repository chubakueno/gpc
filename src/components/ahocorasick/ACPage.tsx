import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { TabGroup } from "@/components/shared/TabGroup";
import { ACDemo } from "./ACDemo";
import { ACAnalysis } from "./ACAnalysis";
import { ACCode } from "./ACCode";

export default function ACPage() {
  const { t } = useLang();
  const [tab, setTab] = useState("demo");

  const tabs = [
    { id: "demo",     label: t("ac.tab.demo") },
    { id: "analysis", label: t("ac.tab.analysis") },
    { id: "code",     label: t("ac.tab.code") },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{t("ac.title")}</h1>
        <p className="text-[var(--color-muted)]">{t("ac.subtitle")}</p>
      </div>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-8" />
      {tab === "demo"     && <ACDemo />}
      {tab === "analysis" && <ACAnalysis />}
      {tab === "code"     && <ACCode />}
    </main>
  );
}
