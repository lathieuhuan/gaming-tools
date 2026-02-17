import { useId, useState } from "react";
import { Button, SwitchNode, type SwitchNodeCase } from "rond";

import { ENHANCE_TOUR_SITE_ID } from "@/constants/ui";
import { useCalcStore } from "@Store/calculator";
import { updateMain } from "@Store/calculator/actions";
import { selectActiveMain } from "@Store/calculator/selectors";
import { selectAppReady, useUIStore } from "@Store/ui";
import { useCalcModalCtrl } from "../ContextProvider";

// Component
import { CharacterIntro, ComplexSelect } from "@/components";
import {
  ArtifactsTab,
  AttributesTab,
  ConstellationTab,
  TalentsTab,
  WeaponTab,
} from "./tab-components";

type TabType = "Attributes" | "Weapon" | "Artifacts" | "Constellation" | "Talents";

const TABS: SwitchNodeCase<TabType>[] = [
  { value: "Attributes", element: <AttributesTab /> },
  { value: "Weapon", element: <WeaponTab /> },
  { value: "Artifacts", element: <ArtifactsTab /> },
  { value: "Constellation", element: <ConstellationTab /> },
  { value: "Talents", element: <TalentsTab /> },
];

function CharacterOverviewCore(props: { onClickSwitchCharacter: () => void }) {
  const id = useId();
  const main = useCalcStore(selectActiveMain);

  const [activeTab, setActiveTab] = useState<TabType>("Attributes");

  return (
    <div className="h-full flex flex-col gap-4">
      <CharacterIntro
        character={main}
        mutable
        switchable
        onSwitch={props.onClickSwitchCharacter}
        onChangeLevel={(level) => updateMain({ level })}
        onChangeCons={(cons) => updateMain({ cons })}
        onEnhanceToggle={(enhanced) => updateMain({ enhanced })}
        ids={{
          enhanceTag: ENHANCE_TOUR_SITE_ID.mainEnhance,
        }}
      />

      <ComplexSelect
        selectId={id}
        value={activeTab}
        options={TABS.map((tab) => ({ value: tab.value, label: tab.value }))}
        onChange={(newTab) => setActiveTab(newTab)}
      />

      <div className="grow hide-scrollbar">
        <SwitchNode value={activeTab} cases={TABS} />
      </div>
    </div>
  );
}

type CharacterOverviewProps = {
  touched: boolean;
};

export function CharacterOverview({ touched }: CharacterOverviewProps) {
  const appReady = useUIStore(selectAppReady);
  const modalCtrl = useCalcModalCtrl();

  return (
    <>
      {touched ? (
        <CharacterOverviewCore onClickSwitchCharacter={modalCtrl.requestSwitchCharacter} />
      ) : (
        <div className="w-full flex flex-col items-center space-y-2">
          <Button variant="primary" disabled={!appReady} onClick={modalCtrl.requestSwitchCharacter}>
            Select a character
          </Button>
          <p>or</p>
          <Button disabled={!appReady} onClick={modalCtrl.requestImportSetup}>
            Import a setup
          </Button>
        </div>
      )}
    </>
  );
}
