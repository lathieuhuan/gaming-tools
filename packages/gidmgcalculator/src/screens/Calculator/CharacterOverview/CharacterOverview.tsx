import { useId, useState } from "react";
import { Button, Match, type MatchCase } from "rond";

import { ENHANCE_TOUR_SITE_ID } from "@/constants/ui";
import { useCalcStore } from "@Store/calculator";
import { initSessionWithCharacter, updateMain } from "@Store/calculator/actions";
import { selectActiveMain } from "@Store/calculator/selectors";
import { selectAppReady, useUIStore } from "@Store/ui";

// Component
import { CharacterIntro } from "@/components/CharacterIntro";
import { ComplexSelect } from "@/components/ComplexSelect";
import { Tavern } from "@/components/Tavern";
import { useStore } from "@/lib/dynamic-store";
import { SetupImportAction } from "../components/SetupImportAction";
import {
  ArtifactsTab,
  AttributesTab,
  ConstellationTab,
  TalentsTab,
  WeaponTab,
} from "./TabComponents";

type TabType = "Attributes" | "Weapon" | "Artifacts" | "Constellation" | "Talents";

const TABS = [
  { value: "Attributes", render: <AttributesTab /> },
  { value: "Weapon", render: <WeaponTab /> },
  { value: "Artifacts", render: <ArtifactsTab /> },
  { value: "Constellation", render: <ConstellationTab /> },
  { value: "Talents", render: <TalentsTab /> },
] satisfies MatchCase<TabType>[];

function CharacterOverviewCore(props: { onSwitchCharacter: () => void }) {
  const id = useId();
  const main = useCalcStore(selectActiveMain);

  const [activeTab, setActiveTab] = useState<TabType>("Attributes");

  return (
    <div className="h-full flex flex-col gap-4">
      <CharacterIntro
        character={main}
        mutable
        switchable
        onSwitch={props.onSwitchCharacter}
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
        <Match value={activeTab} cases={TABS} />
      </div>
    </div>
  );
}

type CharacterOverviewProps = {
  touched: boolean;
};

export function CharacterOverview({ touched }: CharacterOverviewProps) {
  const appReady = useUIStore(selectAppReady);
  const store = useStore();

  const [tarvernActive, setTarvernActive] = useState(false);

  const handleSwitchCharacter = () => {
    setTarvernActive(true);
  };

  return (
    <>
      {touched ? (
        <CharacterOverviewCore onSwitchCharacter={handleSwitchCharacter} />
      ) : (
        <div className="w-full flex flex-col items-center space-y-2">
          <Button variant="primary" disabled={!appReady} onClick={handleSwitchCharacter}>
            Select a character
          </Button>

          <p>or</p>

          <SetupImportAction>
            <Button disabled={!appReady}>Import a setup</Button>
          </SetupImportAction>
        </div>
      )}

      <Tavern
        active={tarvernActive}
        sourceType="mixed"
        onSelectCharacter={(character) => {
          initSessionWithCharacter({
            character: character.userData,
            data: character.data,
            userDb: store.select((state) => state.userdb),
          });
        }}
        onClose={() => setTarvernActive(false)}
      />
    </>
  );
}
