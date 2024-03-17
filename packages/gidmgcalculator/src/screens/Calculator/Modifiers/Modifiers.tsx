import { CollapseList } from "rond";
import { selectParty } from "@Store/calculator-slice";
import { $AppCharacter } from "@Src/services";

// Hook
import { useSelector } from "@Store/hooks";
import { useTabs } from "@Src/hooks";

// Component
import { ElementBuffs } from "./buffs/elements";
import { PartyBuffs, SelfBuffs } from "./buffs/characters";
import { WeaponBuffs } from "./buffs/weapons";
import { ArtifactBuffs } from "./buffs/artifacts";
import { ArtifactDebuffs, ElementDebuffs } from "./debuffs/others";
import { PartyDebuffs, SelfDebuffs } from "./debuffs/characters";
import { CustomModifiers } from "./custom";

export default function Modifiers() {
  const party = useSelector(selectParty);
  const partyData = $AppCharacter.getPartyData(party);

  const { activeIndex, renderTabs } = useTabs({
    defaultIndex: 1,
    configs: [{ text: "Debuffs" }, { text: "Buffs" }],
  });

  return (
    <div className="h-full flex flex-col">
      {renderTabs("text-lg shrink-0")}

      <div className="mt-4 grow custom-scrollbar">
        {activeIndex ? (
          <CollapseList
            key="buff"
            items={[
              { heading: "Resonance & Reactions", body: <ElementBuffs /> },
              {
                heading: "Self",
                body: <SelfBuffs />,
              },
              {
                heading: "Party",
                body: <PartyBuffs />,
              },
              {
                heading: "Weapons",
                body: <WeaponBuffs />,
              },
              {
                heading: "Artifacts",
                body: <ArtifactBuffs />,
              },
              {
                heading: "Custom",
                body: <CustomModifiers isBuffs />,
              },
            ]}
          />
        ) : (
          <CollapseList
            key="debuff"
            items={[
              { heading: "Resonance & Reactions", body: <ElementDebuffs /> },
              {
                heading: "Self",
                body: <SelfDebuffs partyData={partyData} />,
              },
              {
                heading: "Party",
                body: <PartyDebuffs partyData={partyData} />,
              },
              {
                heading: "Artifacts",
                body: <ArtifactDebuffs />,
              },
              {
                heading: "Custom",
                body: <CustomModifiers isBuffs={false} />,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
