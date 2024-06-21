import { useEffect, useState } from "react";
import { Button } from "rond";
import { FaSyncAlt } from "react-icons/fa";

import type { CalcItem } from "@Backend";
import type { SimulationAttackBonus, TalentHitEventMod } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { TalentEventConfig, useActiveMember } from "@Simulator/ToolboxProvider";

interface TalentHitEventProps {
  item: CalcItem;
  isOnField: boolean;
  getTalentEventConfig: (attkBonus: SimulationAttackBonus[], elmtModCtrls?: TalentHitEventMod) => TalentEventConfig;
  onPerformEvent: (elmtModCtrls?: TalentHitEventMod, alsoSwitch?: boolean) => void;
}

export function TalentHitEvent(props: TalentHitEventProps) {
  const { t } = useTranslation();
  const activeMember = useActiveMember();

  const [attkBonus, setAttkBonus] = useState<SimulationAttackBonus[]>([]);
  const [elmtModCtrls, setElmtModCtrls] = useState<TalentHitEventMod>({
    absorption: null,
    reaction: null,
    infuse_reaction: null,
  });

  useEffect(() => {
    if (activeMember) {
      const { initial, unsubscribe } = activeMember.tools.subscribeBonuses((_, attkBonus) => {
        setAttkBonus(attkBonus);
      });

      setAttkBonus(initial.attkBonus);
      return unsubscribe;
    }
    return undefined;
  }, [activeMember]);

  console.log("render: TalentAttackEvent", props.item.name);

  const config = props.getTalentEventConfig(attkBonus, elmtModCtrls);

  console.log(config.record);

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
        <div className="flex">
          <Button
            shape="square"
            size="small"
            className={props.isOnField ? "" : "rounded-r-none"}
            onClick={() => props.onPerformEvent(elmtModCtrls)}
          >
            Perform
          </Button>

          {!props.isOnField && (
            <Button
              shape="square"
              size="small"
              className="ml-0.5 rounded-l-none"
              icon={<FaSyncAlt />}
              onClick={() => props.onPerformEvent(elmtModCtrls, true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
