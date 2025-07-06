import { CollapseList } from "rond";

import { useTabs } from "@Src/hooks";
import { useCharacterData } from "../ContextProvider/hooks";

// Component
import BuffArtifact from "./BuffArtifact";
import BuffCustom from "./BuffCustom";
import BuffElement from "./BuffElement";
import BuffParty from "./BuffParty";
import BuffSelf from "./BuffSelf";
import BuffWeapon from "./BuffWeapon";
import DebuffArtifact from "./DebuffArtifact";
import DebuffCustom from "./DebuffCustom";
import DebuffElement from "./DebuffElement";
import DebuffParty from "./DebuffParty";
import DebuffSelf from "./DebuffSelf";

export function Modifiers() {
  const { party } = useCharacterData();
  const { activeIndex, tabProps, Tabs } = useTabs(1);

  return (
    <div className="h-full flex flex-col">
      <Tabs {...tabProps} className="text-lg shrink-0" configs={[{ text: "Debuffs" }, { text: "Buffs" }]} />

      <div className="mt-4 grow custom-scrollbar">
        <CollapseList
          key="buff"
          className={!activeIndex && "hidden"}
          items={[
            {
              title: "Resonance & Reactions buffs",
              heading: "Resonance & Reactions",
              body: <BuffElement />,
            },
            {
              title: "Self buffs",
              heading: "Self",
              body: <BuffSelf />,
            },
            {
              title: "Party buffs",
              heading: "Party",
              body: <BuffParty party={party} />,
            },
            {
              title: "Weapons buffs",
              heading: "Weapons",
              body: <BuffWeapon party={party} />,
            },
            {
              title: "Artifacts buffs",
              heading: "Artifacts",
              body: <BuffArtifact party={party} />,
            },
            {
              title: "Custom buffs",
              heading: "Custom",
              body: <BuffCustom />,
            },
          ]}
        />

        <CollapseList
          key="debuff"
          className={activeIndex && "hidden"}
          items={[
            {
              title: "Resonance & Reactions debuffs",
              heading: "Resonance & Reactions",
              body: <DebuffElement />,
            },
            {
              title: "Self debuffs",
              heading: "Self",
              body: <DebuffSelf />,
            },
            {
              title: "Party debuffs",
              heading: "Party",
              body: <DebuffParty party={party} />,
            },
            {
              title: "Artifacts debuffs",
              heading: "Artifacts",
              body: <DebuffArtifact party={party} />,
            },
            {
              title: "Custom debuffs",
              heading: "Custom",
              body: <DebuffCustom />,
            },
          ]}
        />
      </div>
    </div>
  );
}
