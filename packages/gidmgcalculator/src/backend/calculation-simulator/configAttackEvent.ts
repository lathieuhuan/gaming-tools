import type { SimulationAttackBonus, SimulationTarget } from "@Src/types";
import type { AttackPattern, CalcItem, TalentType } from "@Src/backend/types";
import { AttackBonusControl, ResistanceReductionControl, TotalAttribute } from "@Src/backend/controls";
import { CalculationInfo, CharacterCalc } from "@Src/backend/utils";
import { AttackPatternConf, CalcItemCalculator } from "@Src/backend/calculation";
import { pickProps } from "@Src/utils";

type ConfigAttackEventArgs = {
  underPattern: AttackPattern;
  talentType: TalentType;
  totalAttr: TotalAttribute;
  attackBonus: SimulationAttackBonus[];
  configItem: CalcItem;
  info: CalculationInfo;
  target: SimulationTarget;
};

export function configAttackEvent({
  underPattern,
  talentType,
  totalAttr,
  attackBonus,
  configItem,
  info,
  target,
}: ConfigAttackEventArgs) {
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
  })(underPattern);

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
