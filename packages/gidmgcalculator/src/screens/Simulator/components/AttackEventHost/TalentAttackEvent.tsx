import { useMemo } from "react";
import {
  AttackBonusControl,
  AttackPatternConf,
  CalculationInfo,
  CharacterCalc,
  TalentType,
  TotalAttribute,
} from "@Backend";
import type { RootState } from "@Store/store";

import { pickProps } from "@Src/utils";
import { getActiveMember } from "@Simulator/Simulator.utils";
import { AttackEventConfigItem } from "./AttackEventHost.utils";

import { useSelector } from "@Store/hooks";
import { useTranslation } from "@Src/hooks";
import { useActiveMember, useActiveSimulation, useToolbox } from "@Simulator/providers";
import { SimulationAttackBonus, SimulationTarget } from "@Src/types";
import { ResistanceReductionControl } from "@Src/backend/controls";
import CalcItemCalculator from "@Src/backend/calculation/calc-item-calculator";

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

    return getEventInfo({
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

type GetEventInfoArgs = {
  talentType: TalentType;
  totalAttr: TotalAttribute;
  attackBonus: SimulationAttackBonus[];
  configItem: AttackEventConfigItem;
  info: CalculationInfo;
  target: SimulationTarget;
};

function getEventInfo({ talentType, totalAttr, attackBonus, configItem, info, target }: GetEventInfoArgs) {
  const attackBonusCtrl = new AttackBonusControl();

  for (const bonus of attackBonus) {
    attackBonusCtrl.add(bonus.toType, bonus.toKey, bonus.value, "");
  }

  const { disabled, configCalcItem } = AttackPatternConf({
    ...info,
    totalAttr,
    attBonus: attackBonusCtrl,
    selfBuffCtrls: [],
    elmtModCtrls: {
      absorption: null,
      infuse_reaction: null,
      reaction: null,
    },
    customInfusion: {
      element: "phys",
    },
  })(configItem.underPatt);

  if (disabled) {
    return false;
  }

  const config = configCalcItem(configItem);
  const level = CharacterCalc.getFinalTalentLv({ ...info, talentType });
  const resistReduct = new ResistanceReductionControl();

  const calculateCalcItem = CalcItemCalculator(info.char.level, target.level, totalAttr, resistReduct.apply(target));

  const base = config.calculateBaseDamage(level);

  const result = calculateCalcItem({
    base,
    ...config,
  });

  console.log(config.record);

  return {
    damage: result.average,
    ...pickProps(config, ["attElmt", "attPatt", "record"]),
  };
}
