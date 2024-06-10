import type { SimulationTarget } from "@Src/types";
import type { AttackPattern, CalcItem, TalentType } from "@Src/backend/types";
import { pickProps } from "@Src/utils";
import { CalculationInfo, CharacterCalc } from "@Src/backend/utils";
import { ResistanceReductionControl, TotalAttribute } from "@Src/backend/controls";
import { AttackPatternConf, AttackPatternConfArgs, CalcItemCalculator } from "@Src/backend/calculation";

type ConfigTalentEventArgs = Pick<AttackPatternConfArgs, "attBonus" | "elmtModCtrls"> & {
  underPattern: AttackPattern;
  talentType: TalentType;
  totalAttr: TotalAttribute;
  configItem: CalcItem;
  info: CalculationInfo;
  target: SimulationTarget;
};

export function configTalentEvent(args: ConfigTalentEventArgs) {
  const { totalAttr, info, target } = args;

  const { disabled, configCalcItem } = AttackPatternConf({
    ...info,
    totalAttr,
    attBonus: args.attBonus,
    elmtModCtrls: args.elmtModCtrls,
    selfBuffCtrls: [],
    customInfusion: {
      element: "phys",
    },
  })(args.underPattern);

  if (disabled) {
    return null;
  }

  const config = configCalcItem(args.configItem);
  const level = CharacterCalc.getFinalTalentLv({ ...info, talentType: args.talentType });
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
