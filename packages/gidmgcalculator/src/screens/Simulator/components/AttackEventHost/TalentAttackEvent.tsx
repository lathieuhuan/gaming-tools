import { useMemo } from "react";
import { TalentType, configAttackEvent } from "@Backend";
import type { RootState } from "@Store/store";

import { getActiveMember } from "@Simulator/Simulator.utils";
import { AttackEventConfigItem } from "./AttackEventHost.utils";

import { useActiveMember, useActiveSimulation, useToolbox } from "@Simulator/providers";
import { useTranslation } from "@Src/hooks";
import { useSelector } from "@Store/hooks";

const selectAttackBonus = (state: RootState) => getActiveMember(state)?.attackBonus ?? [];

interface TalentAttackEventProps {
  talentType: TalentType;
  configItem: AttackEventConfigItem;
}

export function TalentAttackEvent({ talentType, configItem }: TalentAttackEventProps) {
  const { t } = useTranslation();
  const activeSimulation = useActiveSimulation();
  const activeMember = useActiveMember();
  const toolbox = useToolbox();

  const attackBonus = useSelector(selectAttackBonus);

  console.log("render: TalentAttackEvent");

  const info = useMemo(() => {
    if (!activeSimulation || !activeMember || !toolbox) {
      return null;
    }

    return configAttackEvent({
      underPattern: configItem.underPatt,
      talentType,
      totalAttr: toolbox.totalAttr.finalize(),
      attackBonus,
      configItem,
      info: {
        char: activeMember.char,
        appChar: activeMember.appChar,
        partyData: activeSimulation.partyData,
      },
      target: activeSimulation.target,
    });
  }, [activeSimulation, activeMember, toolbox, attackBonus]);

  if (info === null) {
    return null;
  }
  if (!info) {
    return <div>This attack is not available.</div>;
  }

  return (
    <div>
      <div className="text-sm text-secondary-1">
        {t(`${info.attElmt}_attElmt`)} / {t(info.attPatt)} DMG
      </div>
    </div>
  );
}
