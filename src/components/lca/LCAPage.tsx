import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { PageShell } from "@/components/layout/PageShell";
import { TabGroup } from "@/components/shared/TabGroup";
import { LCADemo } from "./LCADemo";
import { BinaryLiftingExplainer } from "./BinaryLiftingExplainer";
import { EulerTourRMQ } from "./EulerTourRMQ";
import { LCACode } from "./LCACode";

export default function LCAPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("demo");

  const tabs = [
    { id: "demo", label: t("lca.tab.demo") },
    { id: "bl",   label: t("lca.tab.bl") },
    { id: "rmq",  label: t("lca.tab.rmq") },
    { id: "code", label: t("lca.tab.code") },
  ];

  return (
    <PageShell title={t("lca.title")} subtitle={t("lca.subtitle")}>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "demo" && <LCADemo />}
      {activeTab === "bl"   && <BinaryLiftingExplainer />}
      {activeTab === "rmq"  && <EulerTourRMQ />}
      {activeTab === "code" && <LCACode />}
    </PageShell>
  );
}
