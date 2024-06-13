import { useEffect, useState } from "react";
import { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import { useActiveMember } from "@Simulator/ToolboxProvider";

type SimulationBonus = SimulationAttributeBonus | SimulationAttackBonus;

export function BonusDisplayer(props: { className?: string }) {
  const activeMember = useActiveMember();
  const [bonuses, setBonuses] = useState<SimulationBonus[]>([]);

  useEffect(() => {
    if (activeMember) {
      const { initial, unsubscribe } = activeMember.tools.subscribeBonuses((attrBonus, attkBonus) => {
        setBonuses((attrBonus as SimulationBonus[]).concat(attkBonus));
      });

      setBonuses((initial.attrBonus as SimulationBonus[]).concat(initial.attkBonus));
      return unsubscribe;
    }
    return undefined;
  }, [activeMember]);

  console.log("render: BonusDisplayer");
  console.log(bonuses);

  return null;
}
