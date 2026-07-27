import { useState } from "react";
import { CollapseList, Tabs } from "rond";

import { ECalculatorModifierTab, TOUR_STEP_ID } from "@/constants/ui";

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
  const [tab, setTab] = useState(ECalculatorModifierTab.BUFFS);

  return (
    <div className="h-full flex flex-col">
      <Tabs
        id={TOUR_STEP_ID.modifiersTab}
        className="text-lg shrink-0"
        options={[
          {
            value: ECalculatorModifierTab.DEBUFFS,
            label: "Debuffs",
          },
          {
            value: ECalculatorModifierTab.BUFFS,
            label: "Buffs",
          },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-4 grow custom-scrollbar">
        <CollapseList
          key="buff"
          className={tab === ECalculatorModifierTab.DEBUFFS ? "hidden" : undefined}
          items={[
            {
              id: TOUR_STEP_ID.teamBonus,
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
          className={tab === ECalculatorModifierTab.BUFFS ? "hidden" : undefined}
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
