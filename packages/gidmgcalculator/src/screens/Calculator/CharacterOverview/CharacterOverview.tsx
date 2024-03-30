import { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Button, Badge, Rarity, SwitchNode, type SwitchNodeProps } from "rond";

import { Level } from "@Src/types";
import { LEVELS } from "@Src/constants";
import { $AppCharacter } from "@Src/services";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { initNewSessionWithCharacter } from "@Store/thunks";
import { selectCharacter, updateCharacter } from "@Store/calculator-slice";

// Component
import { ComplexSelect, SetupImporter, Tavern, GenshinImage } from "@Src/components";
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

  const onChangeLevel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(updateCharacter({ level: e.target.value as Level }));
  };

  const onClickConsLevel = (cons: number) => {
    if (cons !== char.cons) {
      dispatch(updateCharacter({ cons }));
    }
  };

  let body;

  if (touched) {
    const appChar = $AppCharacter.get(char.name);
    const elmtText = `text-${appChar.vision}`;

    body = (
      <div className="h-full flex flex-col">
        <div className="pb-4 flex">
          <div
            className="mr-3 relative aspect-square shrink-0"
            onClick={() => setModalType("CHARACTER_SELECT")}
            style={{ width: 88, height: 88 }}
          >
            <Button className="absolute -top-1 -left-1 z-10" icon={<FaSyncAlt />} />
            <Badge active={appChar.beta} className="absolute -top-1 -right-1 z-10">
              BETA
            </Badge>
            <GenshinImage className="cursor-pointer" src={appChar.icon} imgType="character" fallbackCls="p-2" />
          </div>

          <div className="min-w-0 grow">
            <div className="overflow-hidden">
              <p className={`text-2.5xl truncate ${elmtText} font-black`}>{char.name}</p>
              <Rarity value={appChar.rarity} />
            </div>

            <div className="mt-1 pl-1 flex justify-between items-center">
              <div className="flex items-center text-lg">
                <p className="mr-1">Level</p>
                <select
                  className={`font-bold ${elmtText} text-right text-last-right`}
                  value={char.level}
                  onChange={onChangeLevel}
                >
                  {LEVELS.map((_, index) => (
                    <option key={index} className="text-black">
                      {LEVELS[LEVELS.length - 1 - index]}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={
                  "ml-4 px-3 pt-2 pb-1.5 flex-center rounded-lg bg-surface-2 " +
                  `leading-none ${elmtText} font-bold cursor-default relative group`
                }
              >
                <span>C{char.cons}</span>
                <div className="absolute top-full z-50 pt-1 hidden group-hover:block">
                  <ul className="bg-light-default text-black rounded overflow-hidden">
                    {[...Array(7)].map((_, i) => {
                      return (
                        <li
                          key={i}
                          className={`px-3 pt-2 pb-1.5 ${i === char.cons ? "bg-light-disabled" : "hover:bg-primary-1"}`}
                          onClick={() => onClickConsLevel(i)}
                        >
                          C{i}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

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
