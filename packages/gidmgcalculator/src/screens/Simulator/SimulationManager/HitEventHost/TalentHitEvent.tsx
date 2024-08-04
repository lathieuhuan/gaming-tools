import { useEffect, useState } from "react";

import type { CalcItem } from "@Backend";
import type { SimulationAttackBonus, TalentHitEventMod } from "@Src/types";
import type { TalentEventConfig } from "@Simulator/simulation-control";

import { useTranslation } from "@Src/hooks";
import { ActionButton } from "@Simulator/components";
import { useActiveSimulation } from "../ToolboxProvider";

interface TalentHitEventProps {
  item: CalcItem;
  getTalentEventConfig: (attkBonus: SimulationAttackBonus[], elmtModCtrls?: TalentHitEventMod) => TalentEventConfig;
  onPerformEvent: (elmtModCtrls?: TalentHitEventMod, alsoSwitch?: boolean) => void;
}

export function TalentHitEvent(props: TalentHitEventProps) {
  const { t } = useTranslation();
  const simulation = useActiveSimulation();

  const [attkBonus, setAttkBonus] = useState<SimulationAttackBonus[]>([]);
  const [elmtModCtrls, setElmtModCtrls] = useState<TalentHitEventMod>({
    absorption: null,
    reaction: null,
    infuse_reaction: null,
  });

  useEffect(() => {
    if (simulation) {
      const { initial, unsubscribe } = simulation.subscribeBonuses((_, attkBonus) => {
        setAttkBonus(attkBonus);
      });

      setAttkBonus(initial.attkBonus);
      return unsubscribe;
    }
    return undefined;
  }, [simulation]);

  // console.log("render: TalentAttackEvent", props.item.name);

  const config = props.getTalentEventConfig(attkBonus, elmtModCtrls);

  // console.log(config.record);

  return (
    <div>
      <div className="text-sm text-secondary-1">
        {t(`${config.attElmt}_attElmt`)} / {t(config.attPatt)} DMG
      </div>
      <div className="mt-3 flex justify-end items-center gap-2">
        <span>
          {Array.isArray(config.damage)
            ? config.damage.map((d) => Math.round(d)).join(" + ")
            : Math.round(config.damage)}
        </span>

        <ActionButton ctaText="Perform" onClick={(alsoSwitch) => props.onPerformEvent(elmtModCtrls, alsoSwitch)} />
      </div>
    </div>
  );
}
