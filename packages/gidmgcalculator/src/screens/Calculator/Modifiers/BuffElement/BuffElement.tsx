import { TalentCalcItem } from "@Calculation";
import { Fragment, ReactNode } from "react";

import { selectAttkBonuses, selectCharacter, selectElmtModCtrls } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { useTeamData } from "../../ContextProvider";

import { GenshinModifierView } from "@/components";
import { AnemoAbsorptionCtrl } from "./AnemoAbsorptionCtrl";
import { AttackReactionCtrl } from "./AttackReactionCtrl";
import { CustomInfusionCtrl } from "./CustomInfusionCtrl";
import { ResonanceCtrl } from "./ResonanceCtrl";

export function BuffElement() {
  const character = useSelector(selectCharacter);
  const elmtModCtrls = useSelector(selectElmtModCtrls);
  const attkBonuses = useSelector(selectAttkBonuses);
  const teamData = useTeamData();

  const { vision, weaponType, calcList } = teamData.activeAppMember;

  const nodes: ReactNode[] = [];

  // Resonance

  if (elmtModCtrls.resonances.length) {
    nodes.push(<ResonanceCtrl resonances={elmtModCtrls.resonances} />);
  }

  if (teamData.moonsignLv) {
    nodes.push(
        <div key="moonsign" className="space-y-3">
          <GenshinModifierView
            heading={`Moonsign Lv.${teamData.moonsignLv}`}
            description={teamData.moonsignLv === 1 ? "Nascent Gleam" : "Ascendant Gleam"}
            mutable={false}
            checked={true}
          />
        </div>
    );
  }

  // ========== ATTACK REACTION ==========

  const attackReaction = (
    <AttackReactionCtrl
      configType="reaction"
      attackElmt={vision}
      elmtModCtrls={elmtModCtrls}
      attkBonuses={attkBonuses}
      characterLv={character.level}
    />
  );

  if (attackReaction) {
    nodes.push(<div className="space-y-3">{attackReaction}</div>);
  }

  // ========== ANEMO ABSORPTION ==========

  const haveAnyAbsorbAttack = (items: TalentCalcItem[]) => {
    return items.some(({ type = "attack", attElmt }) => attElmt === "absorb" && type === "attack");
  };

  if (
    (vision === "anemo" && weaponType === "catalyst") ||
    haveAnyAbsorbAttack(calcList.ES) ||
    haveAnyAbsorbAttack(calcList.EB)
  ) {
    nodes.push(
      <AnemoAbsorptionCtrl elmtModCtrls={elmtModCtrls} attkBonuses={attkBonuses} characterLv={character.level} />
    );
  }

  // ========== CUSTOM INFUSION ==========

  if (weaponType !== "catalyst") {
    nodes.push(
      <CustomInfusionCtrl
        elmtModCtrls={elmtModCtrls}
        attkBonuses={attkBonuses}
        characterLv={character.level}
        characterElmt={vision}
      />
    );
  }

  return (
    <div className="pt-2">
      {nodes.filter(Boolean).map((node, index) => (
        <Fragment key={index}>
          {index ? <div className="mx-auto my-3 w-1/2 h-px bg-dark-3" /> : null}
          {node}
        </Fragment>
      ))}
    </div>
  );
}
