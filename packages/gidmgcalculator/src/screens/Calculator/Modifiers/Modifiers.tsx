import { CollapseList } from "rond";

import { selectParty } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { useTabs } from "@Src/hooks";

// Component
import ElementBuffs from "./buffs/ElementBuffs";
import SelfBuffs from "./buffs/SelfBuffs";
import PartyBuffs from "./buffs/PartyBuffs";
import WeaponBuffs from "./buffs/WeaponBuffs";
import ArtifactBuffs from "./buffs/ArtifactBuffs";
import ElementDebuffs from "./debuffs/ElementDebuffs";
import SelfDebuffs from "./debuffs/SelfDebuffs";
import PartyDebuffs from "./debuffs/PartyDebuffs";
import ArtifactDebuffs from "./debuffs/ArtifactDebuffs";
import CustomModifiers from "./CustomModifiers";

export function Modifiers() {
  const party = useSelector(selectParty);

  const { activeIndex, renderTabs } = useTabs({
    defaultIndex: 1,
    configs: [{ text: "Debuffs" }, { text: "Buffs" }],
  });

  return (
    <div className="h-full flex flex-col">
      {renderTabs("text-lg shrink-0")}

      <div className="mt-4 grow custom-scrollbar">
        <CollapseList
          key="buff"
          className={!activeIndex && "hidden"}
          items={[
            {
              title: "Resonance & Reactions buffs",
              heading: "Resonance & Reactions",
              body: <ElementBuffs />,
            },
            {
              title: "Self buffs",
              heading: "Self",
              body: <SelfBuffs />,
            },
            {
              title: "Party buffs",
              heading: "Party",
              body: <PartyBuffs party={party} />,
            },
            {
              title: "Weapons buffs",
              heading: "Weapons",
              body: <WeaponBuffs party={party} />,
            },
            {
              title: "Artifacts buffs",
              heading: "Artifacts",
              body: <ArtifactBuffs party={party} />,
            },
            {
              title: "Custom buffs",
              heading: "Custom",
              body: <CustomModifiers isBuffs />,
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
              body: <ElementDebuffs />,
            },
            {
              title: "Self debuffs",
              heading: "Self",
              body: <SelfDebuffs />,
            },
            {
              title: "Party debuffs",
              heading: "Party",
              body: <PartyDebuffs party={party} />,
            },
            {
              title: "Artifacts debuffs",
              heading: "Artifacts",
              body: <ArtifactDebuffs party={party} />,
            },
            {
              title: "Custom debuffs",
              heading: "Custom",
              body: <CustomModifiers isBuffs={false} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
