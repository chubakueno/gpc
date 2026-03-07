import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { TabGroup } from "@/components/shared/TabGroup";
import { ZFuncDemo }     from "./ZFuncDemo";
import { ZFuncAnalysis } from "./ZFuncAnalysis";
import { ZFuncCode }     from "./ZFuncCode";

export default function ZFuncPage() {
  const { t } = useLang();
  const [tab, setTab] = useState("demo");

  const tabs = [
    { id: "demo",     label: t("zfunc.tab.demo") },
    { id: "analysis", label: t("zfunc.tab.analysis") },
    { id: "code",     label: t("zfunc.tab.code") },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{t("zfunc.title")}</h1>
        <p className="text-[var(--color-muted)]">{t("zfunc.subtitle")}</p>
      </div>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-8" />
      {tab === "demo"     && <ZFuncDemo />}
      {tab === "analysis" && <ZFuncAnalysis />}
      {tab === "code"     && <ZFuncCode />}
    </main>
  );
}
