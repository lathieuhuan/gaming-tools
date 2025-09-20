import { useState } from "react";
import { Button, SwitchNode, type SwitchNodeCase } from "rond";

import { selectCharacter, updateCharacter } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";
import { useCalcModalCtrl, useTeamData } from "../ContextProvider";

// Component
import { CharacterIntro, ComplexSelect } from "@/components";
import {
  ArtifactsTab,
  AttributesTab,
  ConstellationTab,
  TalentsTab,
  WeaponTab,
} from "./character-overview-tabs";

const TABS: SwitchNodeCase<string>[] = [
  { value: "Attributes", element: <AttributesTab /> },
  { value: "Weapon", element: <WeaponTab /> },
  { value: "Artifacts", element: <ArtifactsTab /> },
  { value: "Constellation", element: <ConstellationTab /> },
  { value: "Talents", element: <TalentsTab /> },
];

function CharacterOverviewCore(props: { onClickSwitchCharacter: () => void }) {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);
  const record = useTeamData();

  const [activeTab, setActiveTab] = useState("Attributes");

  return (
    <div className="h-full flex flex-col gap-4">
      <CharacterIntro
        character={character}
        appCharacter={record.activeAppMember}
        mutable
        switchable
        onSwitch={props.onClickSwitchCharacter}
        onChangeLevel={(level) => level !== character.level && dispatch(updateCharacter({ level }))}
        onChangeCons={(cons) => cons !== character.cons && dispatch(updateCharacter({ cons }))}
      />

      <ComplexSelect
        selectId="character-overview-select"
        value={activeTab}
        options={TABS.map((tab) => ({ value: tab.value, label: tab.value }))}
        onChange={(newTab) => setActiveTab(newTab.toString())}
      />

      <div className="grow hide-scrollbar">
        <SwitchNode value={activeTab} cases={TABS} />
      </div>
    </div>
  );
}

interface CharacterOverviewProps {
  touched: boolean;
}
export function CharacterOverview({ touched }: CharacterOverviewProps) {
  const appReady = useSelector(selectAppReady);
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
