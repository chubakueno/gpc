import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { PageShell } from "@/components/layout/PageShell";
import { TabGroup } from "@/components/shared/TabGroup";
import { KMPDemo } from "./KMPDemo";
import { KMPAnalysis } from "./KMPAnalysis";
import { KMPCode } from "./KMPCode";

export default function KMPPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("demo");

  const tabs = [
    { id: "demo",     label: t("kmp.tab.demo") },
    { id: "analysis", label: t("kmp.tab.analysis") },
    { id: "code",     label: t("kmp.tab.code") },
  ];

  return (
    <PageShell title={t("kmp.title")} subtitle={t("kmp.subtitle")}>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "demo"     && <KMPDemo />}
      {activeTab === "analysis" && <KMPAnalysis />}
      {activeTab === "code"     && <KMPCode />}
    </PageShell>
  );
}
