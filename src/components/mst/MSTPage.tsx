import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { PageShell } from "@/components/layout/PageShell";
import { TabGroup } from "@/components/shared/TabGroup";
import { KruskalDemo } from "./KruskalDemo";
import { PrimDemo } from "./PrimDemo";
import { MSTProof } from "./MSTProof";
import { MSTCode } from "./MSTCode";

export default function MSTPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("kruskal");

  const tabs = [
    { id: "kruskal", label: t("mst.tab.kruskal") },
    { id: "prim",    label: t("mst.tab.prim") },
    { id: "proof",   label: t("mst.tab.proof") },
    { id: "code",    label: t("mst.tab.code") },
  ];

  return (
    <PageShell title={t("mst.title")} subtitle={t("mst.subtitle")}>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "kruskal" && <KruskalDemo />}
      {activeTab === "prim"    && <PrimDemo />}
      {activeTab === "proof"   && <MSTProof />}
      {activeTab === "code"    && <MSTCode />}
    </PageShell>
  );
}
