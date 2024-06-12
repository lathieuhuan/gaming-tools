import { useEffect, useState } from "react";
import type { SimulationBonus } from "@Src/types";

import { useActiveMember } from "@Simulator/ToolboxProvider";

export function BonusDisplayer(props: { className?: string }) {
  const [bonuses, setBonuses] = useState<SimulationBonus[]>([]);
  const activeMember = useActiveMember();

  useEffect(() => {
    if (activeMember) {
      const { initialBonuses, unsubscribe } = activeMember.tools.subscribeBonuses(setBonuses);

      setBonuses(initialBonuses);
      return unsubscribe;
    }
    return undefined;
  }, [activeMember]);

  console.log("render: BonusDisplayer");
  console.log(bonuses);

  return null;
}
