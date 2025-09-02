import { useState } from "react";
import { Button, SwitchNode, type SwitchNodeCase } from "rond";

import { selectCharacter, updateCharacter } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectAppReady, selectTraveler } from "@Store/ui-slice";
import { useCalcModalCtrl, useTeamData } from "../ContextProvider";
// import { $AppCharacter } from "@/services";

// Component
import { CharacterIntro, ComplexSelect } from "@/components";
import { ArtifactsTab, AttributesTab, ConstellationTab, TalentsTab, WeaponTab } from "./character-overview-tabs";

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

  // This makes component rerender on change Traveler, appCharacter has new image links
  useSelector(selectTraveler);

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

// type Data = {
//   name: string;
//   scales: number[][];
// };

interface CharacterOverviewProps {
  touched: boolean;
}
export function CharacterOverview({ touched }: CharacterOverviewProps) {
  const appReady = useSelector(selectAppReady);
  const modalCtrl = useCalcModalCtrl();

  // const calcScale = (prev: number, next: number) => {
  //   return round(((next - prev) / prev) * 100, 2);
  // };

  // const getAverageScale = (data: Data[]) => {
  //   let atkScales: number[] = [];
  //   let hpScales: number[] = [];
  //   let defScales: number[] = [];

  //   for (let i = 0; i < 13; i++) {
  //     let sum = 0;

  //     for (const item of data) {
  //       sum += item.scales[i][0];
  //     }

  //     atkScales.push(sum / data.length);
  //   }

  //   for (let i = 0; i < 13; i++) {
  //     let sum = 0;

  //     for (const item of data) {
  //       sum += item.scales[i][1];
  //     }

  //     hpScales.push(sum / data.length);
  //   }

  //   for (let i = 0; i < 13; i++) {
  //     let sum = 0;

  //     for (const item of data) {
  //       sum += item.scales[i][2];
  //     }

  //     defScales.push(sum / data.length);
  //   }

  //   return [atkScales, hpScales, defScales];
  // };

  // const handleLog = () => {
  //   const star4: Data[] = [];
  //   const star5: Data[] = [];

  //   $AppCharacter.getAll().forEach((character) => {
  //     const { name, rarity, stats } = character;
  //     const scales: number[][] = [];

  //     for (let i = 1; i < stats.length; i++) {
  //       scales.push([
  //         calcScale(stats[i - 1][0], stats[i][0]),
  //         calcScale(stats[i - 1][1], stats[i][1]),
  //         calcScale(stats[i - 1][2], stats[i][2]),
  //       ]);
  //     }

  //     const data = { name, scales };

  //     if (rarity === 4) {
  //       star4.push(data);
  //     } else if (rarity === 5) {
  //       star5.push(data);
  //     }
  //   });

  //   console.log("star4", star4);
  //   console.log("star5", star5);
  //   console.log("star4averageScale", getAverageScale(star4));
  //   console.log("star5averageScale", getAverageScale(star5));
  // };

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
          {/* <Button onClick={handleLog}>Log</Button> */}
        </div>
      )}
    </>
  );
}
