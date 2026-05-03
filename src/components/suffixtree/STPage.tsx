import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { TabGroup } from "@/components/shared/TabGroup";
import { STDemo } from "./STDemo";
import { STAnalysis } from "./STAnalysis";
import { STCode } from "./STCode";

export default function STPage() {
  const { t } = useLang();
  const [tab, setTab] = useState("demo");
  const tabs = [
    { id: "demo",     label: t("st.tab.demo") },
    { id: "analysis", label: t("st.tab.analysis") },
    { id: "code",     label: t("st.tab.code") },
  ];
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{t("st.title")}</h1>
        <p className="text-[var(--color-muted)]">{t("st.subtitle")}</p>
      </div>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-8" />
      {tab === "demo"     && <STDemo />}
      {tab === "analysis" && <STAnalysis />}
      {tab === "code"     && <STCode />}
    </main>
  );
}
