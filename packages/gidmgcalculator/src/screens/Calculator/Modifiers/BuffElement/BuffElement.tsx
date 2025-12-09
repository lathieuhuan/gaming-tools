import { Fragment, ReactNode } from "react";

import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";

import { AnemoAbsorptionCtrl } from "./AnemoAbsorptionCtrl";
import { AttackReactionCtrl } from "./AttackReactionCtrl";
import { CustomInfusionCtrl } from "./CustomInfusionCtrl";

export function BuffElement() {
  const { main, elmtEvent } = useShallowCalcStore((state) =>
    Object_.pickProps(selectSetup(state), ["main", "elmtEvent"])
  );
  const { vision, weaponType } = main.data;

  const nodes: ReactNode[] = [];

  if (["pyro", "cryo", "hydro", "electro", "dendro"].includes(vision)) {
    nodes.push(
      <div className="space-y-3">
        <AttackReactionCtrl
          configType="reaction"
          attackElmt={vision}
          character={main}
          elmtEvent={elmtEvent}
        />
      </div>
    );
  }

  if (vision === "anemo") {
    nodes.push(<AnemoAbsorptionCtrl elmtEvent={elmtEvent} character={main} />);
  }

  if (weaponType !== "catalyst") {
    nodes.push(<CustomInfusionCtrl elmtEvent={elmtEvent} character={main} />);
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
