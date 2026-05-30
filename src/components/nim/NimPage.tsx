import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { TabGroup } from "@/components/shared/TabGroup";
import NimDemo from "./NimDemo";
import NimTheory from "./NimTheory";
import SpragueGrundy from "./SpragueGrundy";
import NimCode from "./NimCode";

export default function NimPage() {
  const { t } = useLang();
  const [tab, setTab] = useState("game");

  const tabs = [
    { id: "game",   label: t("nim.tab.game") },
    { id: "theory", label: t("nim.tab.theory") },
    { id: "grundy", label: t("nim.tab.grundy") },
    { id: "code",   label: t("nim.tab.code") },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{t("nim.title")}</h1>
        <p className="text-[var(--color-muted)]">{t("nim.subtitle")}</p>
      </div>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-8" />
      {tab === "game"   && <NimDemo />}
      {tab === "theory" && <NimTheory />}
      {tab === "grundy" && <SpragueGrundy />}
      {tab === "code"   && <NimCode />}
    </main>
  );
}
