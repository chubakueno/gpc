import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { PageShell } from "@/components/layout/PageShell";
import { TabGroup } from "@/components/shared/TabGroup";
import { NormalHashDemo } from "./NormalHashDemo";
import { RollingHashDemo } from "./RollingHashDemo";
import { BirthdayParadox } from "./BirthdayParadox";
import { CollisionCalculator } from "./CollisionCalculator";
import { HashingCode } from "./HashingCode";

export default function HashingPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("normal");

  const tabs = [
    { id: "normal", label: t("hashing.tab.normal") },
    { id: "rolling", label: t("hashing.tab.rolling") },
    { id: "birthday", label: t("hashing.tab.birthday") },
    { id: "calculator", label: t("hashing.tab.calculator") },
    { id: "code", label: t("hashing.tab.code") },
  ];

  return (
    <PageShell title={t("hashing.title")} subtitle={t("hashing.subtitle")}>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "normal" && <NormalHashDemo />}
      {activeTab === "rolling" && <RollingHashDemo />}
      {activeTab === "birthday" && <BirthdayParadox />}
      {activeTab === "calculator" && <CollisionCalculator />}
      {activeTab === "code" && <HashingCode />}
    </PageShell>
  );
}
