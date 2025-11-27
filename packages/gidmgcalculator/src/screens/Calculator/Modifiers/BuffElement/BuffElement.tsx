import { Fragment, ReactNode } from "react";

import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";

import { AnemoAbsorptionCtrl } from "./AnemoAbsorptionCtrl";
import { AttackReactionCtrl } from "./AttackReactionCtrl";
import { CustomInfusionCtrl } from "./CustomInfusionCtrl";

export function BuffElement() {
  const { char: character, elmtEvent } = useShallowCalcStore((state) =>
    Object_.pickProps(selectSetup(state), ["char", "elmtEvent"])
  );
  const { vision, weaponType } = character.data;

  const nodes: ReactNode[] = [];

  // ========== ATTACK REACTION ==========

  if (["pyro", "cryo", "hydro", "electro", "dendro"].includes(vision)) {
    nodes.push(
      <div className="space-y-3">
        <AttackReactionCtrl
          configType="reaction"
          attackElmt={vision}
          character={character}
          elmtEvent={elmtEvent}
        />
      </div>
    );
  }

  // ========== ANEMO ABSORPTION ==========

  if (vision === "anemo") {
    nodes.push(<AnemoAbsorptionCtrl elmtEvent={elmtEvent} character={character} />);
  }

  // ========== CUSTOM INFUSION ==========

  if (weaponType !== "catalyst") {
    nodes.push(<CustomInfusionCtrl elmtEvent={elmtEvent} character={character} />);
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
