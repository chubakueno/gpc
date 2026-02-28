import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { PageShell } from "@/components/layout/PageShell";
import { TabGroup } from "@/components/shared/TabGroup";
import { TrieDemo } from "./TrieDemo";
import { TrieApps } from "./TrieApps";
import { TrieAnalysis } from "./TrieAnalysis";
import { TrieCode } from "./TrieCode";

export default function TriePage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("demo");

  const tabs = [
    { id: "demo",         label: t("trie.tab.demo") },
    { id: "autocomplete", label: t("trie.tab.autocomplete") },
    { id: "analysis",     label: t("trie.tab.analysis") },
    { id: "code",         label: t("trie.tab.code") },
  ];

  return (
    <PageShell title={t("trie.title")} subtitle={t("trie.subtitle")}>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "demo"         && <TrieDemo />}
      {activeTab === "autocomplete" && <TrieApps />}
      {activeTab === "analysis"     && <TrieAnalysis />}
      {activeTab === "code"         && <TrieCode />}
    </PageShell>
  );
}
