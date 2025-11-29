import { CollapseList } from "rond";

import { useTabs } from "@/hooks";

// Component
import BuffArtifact from "./BuffArtifact";
import BuffCustom from "./BuffCustom";
import BuffElement from "./BuffElement";
import BuffSelf from "./BuffSelf";
import BuffTeamBonus from "./BuffTeamBonus";
import BuffTeammates from "./BuffTeammates";
import BuffWeapon from "./BuffWeapon";
import DebuffArtifact from "./DebuffArtifact";
import DebuffCustom from "./DebuffCustom";
import DebuffElement from "./DebuffElement";
import DebuffSelf from "./DebuffSelf";
import DebuffTeammates from "./DebuffTeammates";

export function Modifiers() {
  const { activeIndex, tabProps, Tabs } = useTabs(1);

  return (
    <div className="h-full flex flex-col">
      <Tabs
        {...tabProps}
        className="text-lg shrink-0"
        configs={[{ text: "Debuffs" }, { text: "Buffs" }]}
      />

      <div className="mt-4 grow custom-scrollbar">
        <CollapseList
          key="buff"
          className={!activeIndex ? "hidden" : undefined}
          items={[
            {
              title: "Team Bonus",
              heading: "Team Bonus",
              body: <BuffTeamBonus />,
            },
            {
              title: "Elemental Event buffs",
              heading: "Elemental Events",
              body: <BuffElement />,
            },
            {
              title: "Self buffs",
              heading: "Self",
              body: <BuffSelf />,
            },
            {
              title: "Teammates buffs",
              heading: "Teammates",
              body: <BuffTeammates />,
            },
            {
              title: "Weapons buffs",
              heading: "Weapons",
              body: <BuffWeapon />,
            },
            {
              title: "Artifacts buffs",
              heading: "Artifacts",
              body: <BuffArtifact />,
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
          className={activeIndex ? "hidden" : undefined}
          items={[
            {
              title: "Elemental Event debuffs",
              heading: "Elemental Events",
              body: <DebuffElement />,
            },
            {
              title: "Self debuffs",
              heading: "Self",
              body: <DebuffSelf />,
            },
            {
              title: "Teammates debuffs",
              heading: "Teammates",
              body: <DebuffTeammates />,
            },
            {
              title: "Artifacts debuffs",
              heading: "Artifacts",
              body: <DebuffArtifact />,
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
