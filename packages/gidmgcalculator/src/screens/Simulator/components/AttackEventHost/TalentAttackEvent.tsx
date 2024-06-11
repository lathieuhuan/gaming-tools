import { useState } from "react";
import { CalcItem, configTalentEvent } from "@Backend";
import { useTranslation } from "@Src/hooks";
import { ElementModCtrl } from "@Src/types";

export type GetTalentEventConfig = (
  item: CalcItem,
  elmtModCtrls?: Partial<ElementModCtrl>
) => ReturnType<typeof configTalentEvent>;

interface TalentAttackEventProps {
  item: CalcItem;
  configTalentEvent: GetTalentEventConfig;
}

export function TalentAttackEvent(props: TalentAttackEventProps) {
  const { t } = useTranslation();
  const [elmtModCtrls, setElmtModCtrls] = useState<Partial<ElementModCtrl>>({
    absorption: null,
    reaction: null,
    infuse_reaction: null,
  });

  console.log("render: TalentAttackEvent", props.item.name);

  const config = props.configTalentEvent(props.item, elmtModCtrls);

  console.log(config.record);

  return (
    <div>
      <div className="text-sm text-secondary-1">
        {t(`${config.attElmt}_attElmt`)} / {t(config.attPatt)} DMG
      </div>
      <div>
        {Array.isArray(config.damage) ? config.damage.map((d) => Math.round(d)).join(" + ") : Math.round(config.damage)}
      </div>
    </div>
  );
}
