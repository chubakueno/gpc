import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { PageShell } from "@/components/layout/PageShell";
import { TabGroup } from "@/components/shared/TabGroup";
import { SectionCard } from "@/components/layout/SectionCard";
import { UFDSGraph } from "./UFDSGraph";
import { UFDSControls } from "./UFDSControls";
import { ComplexityProof } from "./ComplexityProof";
import { AckermannSketch } from "./AckermannSketch";
import { UFDSCode } from "./UFDSCode";
import { useUFDS } from "@/hooks/useUFDS";

function UFDSInteractive() {
  const { t } = useLang();
  const { state, union, find, addNode, reset, setMode } = useUFDS();

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("ufds.interactive.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("ufds.interactive.desc")}</p>

      <div className="flex flex-col gap-6">
        <UFDSGraph state={state} onUnion={union} onFind={find} />
        <UFDSControls
          mode={state.optimizationMode}
          onSetMode={setMode}
          onAddNode={addNode}
          onReset={reset}
          log={state.operationLog}
          nodeCount={state.nodes.length}
        />
      </div>
    </SectionCard>
  );
}

export default function UFDSPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("interactive");

  const tabs = [
    { id: "interactive", label: t("ufds.tab.interactive") },
    { id: "proof", label: t("ufds.tab.proof") },
    { id: "ackermann", label: t("ufds.tab.ackermann") },
    { id: "code", label: t("ufds.tab.code") },
  ];

  return (
    <PageShell title={t("ufds.title")} subtitle={t("ufds.subtitle")}>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "interactive" && <UFDSInteractive />}
      {activeTab === "proof" && <ComplexityProof />}
      {activeTab === "ackermann" && <AckermannSketch />}
      {activeTab === "code" && <UFDSCode />}
    </PageShell>
  );
}
