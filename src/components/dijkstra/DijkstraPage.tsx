import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { PageShell } from "@/components/layout/PageShell";
import { TabGroup } from "@/components/shared/TabGroup";
import { DijkstraDemo } from "./DijkstraDemo";
import { DijkstraProof } from "./DijkstraProof";
import { DijkstraCode } from "./DijkstraCode";

export default function DijkstraPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("demo");

  const tabs = [
    { id: "demo",  label: t("dijkstra.tab.demo") },
    { id: "proof", label: t("dijkstra.tab.proof") },
    { id: "code",  label: t("dijkstra.tab.code") },
  ];

  return (
    <PageShell title={t("dijkstra.title")} subtitle={t("dijkstra.subtitle")}>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "demo"  && <DijkstraDemo />}
      {activeTab === "proof" && <DijkstraProof />}
      {activeTab === "code"  && <DijkstraCode />}
    </PageShell>
  );
}
