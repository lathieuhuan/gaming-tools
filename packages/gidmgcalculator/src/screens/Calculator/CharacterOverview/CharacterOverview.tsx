import { useState } from "react";
import { Button, SwitchNode, type SwitchNodeProps } from "rond";

import { $AppCharacter } from "@Src/services";

// Store
import { RootState } from "@Store/store";
import { useDispatch, useSelector } from "@Store/hooks";
import { initNewSessionWithCharacter } from "@Store/thunks";
import { selectCharacter, updateCharacter } from "@Store/calculator-slice";

// Component
import { ComplexSelect, SetupImporter, Tavern, CharacterIntro } from "@Src/components";
import { ArtifactsTab, AttributesTab, ConstellationTab, TalentsTab, WeaponTab } from "./character-overview-tabs";

const TABS: SwitchNodeProps<string>["cases"] = [
  { value: "Attributes", element: <AttributesTab /> },
  { value: "Weapon", element: <WeaponTab /> },
  { value: "Artifacts", element: <ArtifactsTab /> },
  { value: "Constellation", element: <ConstellationTab /> },
  { value: "Talents", element: <TalentsTab /> },
];

interface CharacterOverviewProps {
  touched: boolean;
}
export function CharacterOverview({ touched }: CharacterOverviewProps) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const appReady = useSelector((state) => state.ui.ready);

  const [activeTab, setActiveTab] = useState("Attributes");
  const [modalType, setModalType] = useState<"CHARACTER_SELECT" | "IMPORT_SETUP" | "">("");

  const closeModal = () => setModalType("");

  let body;

  if (touched) {
    const appChar = $AppCharacter.get(char.name);

    body = (
      <div className="h-full flex flex-col gap-4">
        <CharacterIntro
          char={char}
          appChar={appChar}
          mutable
          switchable
          onSwitch={() => setModalType("CHARACTER_SELECT")}
          onChangeLevel={(level) => level !== char.level && dispatch(updateCharacter({ level }))}
          onChangeCons={(cons) => cons !== char.cons && dispatch(updateCharacter({ cons }))}
        />
        <CharacterStatusView />

        <ComplexSelect
          selectId="character-overview-select"
          value={activeTab}
          options={TABS.map((tab) => ({ value: tab.value, label: tab.value }))}
          onChange={(newTab) => setActiveTab(newTab.toString())}
        />

        <div className="mt-3 grow hide-scrollbar">
          <SwitchNode value={activeTab} cases={TABS} />
        </div>
      </div>
    );
  } else {
    body = (
      <div className="w-full flex flex-col items-center space-y-2">
        <Button variant="primary" disabled={!appReady} onClick={() => setModalType("CHARACTER_SELECT")}>
          Select a character
        </Button>
        <p>or</p>
        <Button disabled={!appReady} onClick={() => setModalType("IMPORT_SETUP")}>
          Import a setup
        </Button>
      </div>
    );
  }

  return (
    <>
      {body}

      <Tavern
        active={modalType === "CHARACTER_SELECT"}
        sourceType="mixed"
        onSelectCharacter={(character) => {
          dispatch(initNewSessionWithCharacter(character));
        }}
        onClose={closeModal}
      />

      <SetupImporter active={modalType === "IMPORT_SETUP"} onClose={closeModal} />
    </>
  );
}

const selectCharStatus = (state: RootState) => state.calculator.resultById[state.calculator.activeId]?.charStatus;

function CharacterStatusView() {
  const charStatus = useSelector(selectCharStatus);
  return charStatus.BOL ? <div>Bond of Life: {charStatus.BOL}</div> : null;
}
