import { Fragment, ReactNode } from "react";

import { selectAttkBonuses, selectCharacter, selectElmtModCtrls } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { useTeamData } from "../../ContextProvider";

import { AnemoAbsorptionCtrl } from "./AnemoAbsorptionCtrl";
import { AttackReactionCtrl } from "./AttackReactionCtrl";
import { CustomInfusionCtrl } from "./CustomInfusionCtrl";

export function BuffElement() {
  const character = useSelector(selectCharacter);
  const elmtModCtrls = useSelector(selectElmtModCtrls);
  const attkBonuses = useSelector(selectAttkBonuses);
  const teamData = useTeamData();

  const { vision, weaponType } = teamData.activeAppMember;

  const nodes: ReactNode[] = [];

  // ========== ATTACK REACTION ==========

  if (["pyro", "cryo", "hydro", "electro", "dendro"].includes(vision)) {
    nodes.push(
      <div className="space-y-3">
        <AttackReactionCtrl
          configType="reaction"
          attackElmt={vision}
          elmtModCtrls={elmtModCtrls}
          attkBonuses={attkBonuses}
          characterLv={character.level}
        />
      </div>
    );
  }

  // ========== ANEMO ABSORPTION ==========

  if (vision === "anemo") {
    nodes.push(
      <AnemoAbsorptionCtrl
        elmtModCtrls={elmtModCtrls}
        attkBonuses={attkBonuses}
        characterLv={character.level}
      />
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
