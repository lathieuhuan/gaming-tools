import { useState } from "react";
import type { CalcItem, TalentEventConfig } from "@Backend";
import type { TalentHitEventMod } from "@Src/types";

import { useTranslation } from "@Src/hooks";
import { Button } from "rond";

type GetTalentEventConfig = (elmtModCtrls?: TalentHitEventMod) => TalentEventConfig;

interface TalentHitEventProps {
  item: CalcItem;
  getTalentEventConfig: GetTalentEventConfig;
  onPerformEvent: (elmtModCtrls?: TalentHitEventMod) => void;
}

export function TalentHitEvent(props: TalentHitEventProps) {
  const { t } = useTranslation();
  const [elmtModCtrls, setElmtModCtrls] = useState<TalentHitEventMod>({
    absorption: null,
    reaction: null,
    infuse_reaction: null,
  });

  console.log("render: TalentAttackEvent", props.item.name);

  const config = props.getTalentEventConfig(elmtModCtrls);

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
        <Button shape="square" size="small" onClick={() => props.onPerformEvent(elmtModCtrls)}>
          Perform
        </Button>
      </div>
    </div>
  );
}
