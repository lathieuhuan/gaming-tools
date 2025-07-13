import { CollapseList } from "rond";

import { useTabs } from "@Src/hooks";
import { selectTeammates } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";

// Component
import BuffArtifact from "./BuffArtifact";
import BuffCustom from "./BuffCustom";
import BuffElement from "./BuffElement";
import BuffSelf from "./BuffSelf";
import BuffTeammates from "./BuffTeammates";
import BuffWeapon from "./BuffWeapon";
import DebuffArtifact from "./DebuffArtifact";
import DebuffCustom from "./DebuffCustom";
import DebuffElement from "./DebuffElement";
import DebuffSelf from "./DebuffSelf";
import DebuffTeammates from "./DebuffTeammates";

export function Modifiers() {
  const teammates = useSelector(selectTeammates);
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
              body: <BuffTeammates teammates={teammates} />,
            },
            {
              title: "Weapons buffs",
              heading: "Weapons",
              body: <BuffWeapon teammates={teammates} />,
            },
            {
              title: "Artifacts buffs",
              heading: "Artifacts",
              body: <BuffArtifact teammates={teammates} />,
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
              body: <DebuffTeammates teammates={teammates} />,
            },
            {
              title: "Artifacts debuffs",
              heading: "Artifacts",
              body: <DebuffArtifact teammates={teammates} />,
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
