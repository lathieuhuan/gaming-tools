import { useState } from "react";
import { CalcItem, TalentEventConfig } from "@Backend";
import { useTranslation } from "@Src/hooks";
import { ElementModCtrl, TalentHitEventMod } from "@Src/types";
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
      <div>
        {Array.isArray(config.damage) ? config.damage.map((d) => Math.round(d)).join(" + ") : Math.round(config.damage)}
      </div>
      <Button onClick={() => props.onPerformEvent(elmtModCtrls)}>Perform</Button>
    </div>
  );
}
